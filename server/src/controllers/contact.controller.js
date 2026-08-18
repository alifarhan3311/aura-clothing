import Contact from "../models/Contact.js";
import { sendMail } from "../lib/mailer.js";
import {
  contactAdminNotificationEmail,
  contactUserAckEmail,
  contactStatusUpdateEmail,
} from "../lib/emailTemplates.js";

/**
 * @desc    Submit a contact form / support inquiry
 * @route   POST /api/contact
 * @access  Public / Authenticated
 */
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject ? subject.trim() : "General Inquiry",
      message: message.trim(),
      user: req.user ? req.user._id : null,
      status: "pending",
      statusHistory: [
        {
          status: "pending",
          note: "Inquiry submitted by customer",
          changedAt: new Date(),
        },
      ],
    };

    const contact = await Contact.create(contactData);

    // 1. Send confirmation email to user
    try {
      await sendMail(
        contact.email,
        `We've received your message: "${contact.subject}" – Fade Find`,
        contactUserAckEmail(contact)
      );
    } catch (mailErr) {
      console.warn("Failed to send user contact ack email:", mailErr.message);
    }

    // 2. Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (adminEmail) {
      try {
        await sendMail(
          adminEmail,
          `[New Inquiry] ${contact.subject} – from ${contact.name}`,
          contactAdminNotificationEmail(contact)
        );
      } catch (mailErr) {
        console.warn("Failed to send admin contact alert email:", mailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Thank you! Your message has been received and our team will get back to you.",
      contact,
    });
  } catch (error) {
    console.error("Create contact error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit contact message",
    });
  }
};

/**
 * @desc    Get inquiries submitted by logged-in user
 * @route   GET /api/contact/my
 * @access  Private (Customer)
 */
export const getMyContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({
      $or: [{ user: req.user._id }, { email: req.user.email.toLowerCase() }],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error("Get my contacts error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch inquiries",
    });
  }
};

/**
 * @desc    Get all inquiries for Admin (with search, filter, pagination)
 * @route   GET /api/contact
 * @access  Private (Admin)
 */
export const getAllContacts = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status && status !== "all" && status !== "undefined" && status !== "null") {
      query.status = status;
    }

    if (search && search.trim() && search.trim() !== "undefined" && search.trim() !== "null") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
        { phone: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .populate("user", "name email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Contact.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      contacts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get all contacts error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch contact inquiries",
    });
  }
};

/**
 * @desc    Get inquiry status stats for admin badge / summary
 * @route   GET /api/contact/stats
 * @access  Private (Admin)
 */
export const getContactStats = async (req, res) => {
  try {
    const [total, pending, in_progress, resolved, rejected, closed] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: "pending" }),
      Contact.countDocuments({ status: "in_progress" }),
      Contact.countDocuments({ status: { $in: ["resolved", "completed"] } }),
      Contact.countDocuments({ status: "rejected" }),
      Contact.countDocuments({ status: "closed" }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        in_progress,
        resolved,
        rejected,
        closed,
      },
    });
  } catch (error) {
    console.error("Get contact stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get contact stats",
    });
  }
};

/**
 * @desc    Get single contact inquiry details
 * @route   GET /api/contact/:id
 * @access  Private (Admin)
 */
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).populate(
      "user",
      "name email avatar phone"
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact inquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Get contact by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve inquiry",
    });
  }
};

/**
 * @desc    Update contact inquiry status & optionally send reply email
 * @route   PATCH /api/contact/:id/status
 * @access  Private (Admin)
 */
export const updateContactStatus = async (req, res) => {
  try {
    const { status, adminReply, note, sendNotification = true } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact inquiry not found",
      });
    }

    const validStatuses = ["pending", "in_progress", "completed", "resolved", "rejected", "closed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      });
    }

    const newStatus = status || contact.status;
    const replyText = adminReply !== undefined ? adminReply.trim() : contact.adminReply;

    if (status && status !== contact.status) {
      contact.status = status;
      contact.statusHistory.push({
        status,
        note: note || (adminReply ? `Status changed to ${status}. Reply provided.` : `Status changed to ${status}`),
        changedAt: new Date(),
      });
    }

    if (adminReply !== undefined) {
      contact.adminReply = replyText;
      if (replyText) {
        contact.repliedAt = new Date();
      }
    }

    await contact.save();

    // Send email to user if notification is requested
    if (sendNotification && contact.email) {
      try {
        await sendMail(
          contact.email,
          `Update on your support inquiry: "${contact.subject}" – Fade Find`,
          contactStatusUpdateEmail(contact, replyText || note)
        );
      } catch (mailErr) {
        console.warn("Failed to send status update email to user:", mailErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Inquiry status updated successfully",
      contact,
    });
  } catch (error) {
    console.error("Update contact status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update inquiry status",
    });
  }
};

/**
 * @desc    Delete a contact inquiry
 * @route   DELETE /api/contact/:id
 * @access  Private (Admin)
 */
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact inquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact inquiry deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete contact inquiry",
    });
  }
};
