import Slide from "../models/Slide.js";
import { buildPublicPath, deleteFile } from "../middlewares/upload.middleware.js";

// GET /api/slides — Active slides for public homepage
export const getActiveSlides = async (req, res, next) => {
  try {
    const slides = await Slide.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, slides });
  } catch (error) {
    next(error);
  }
};

// GET /api/slides/admin — All slides for admin management
export const getAllSlidesAdmin = async (req, res, next) => {
  try {
    const slides = await Slide.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, slides });
  } catch (error) {
    next(error);
  }
};

// POST /api/slides — Create slide
export const createSlide = async (req, res, next) => {
  try {
    const {
      title,
      subtitle,
      eyebrow,
      badgeText,
      buttonText,
      linkPath,
      secondaryButtonText,
      secondaryLinkPath,
      order,
      isActive,
      imageUrl,
      showStats,
      stat1Value,
      stat1Label,
      stat2Value,
      stat2Label,
      stat3Value,
      stat3Label,
    } = req.body;

    let image = imageUrl || "";
    if (req.file) {
      image = buildPublicPath(req.file);
    }

    if (!image) {
      return res.status(400).json({ success: false, message: "Slide image is required" });
    }

    const slide = await Slide.create({
      title: title || "New Slide",
      subtitle: subtitle || "",
      eyebrow: eyebrow || "",
      badgeText: badgeText || "",
      image,
      buttonText: buttonText || "Shop Now",
      linkPath: linkPath || "/shop",
      secondaryButtonText: secondaryButtonText || "",
      secondaryLinkPath: secondaryLinkPath || "",
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : true,
      showStats: showStats === "true" || showStats === true,
      stat1Value: stat1Value || "",
      stat1Label: stat1Label || "",
      stat2Value: stat2Value || "",
      stat2Label: stat2Label || "",
      stat3Value: stat3Value || "",
      stat3Label: stat3Label || "",
    });

    res.status(201).json({ success: true, slide });
  } catch (error) {
    next(error);
  }
};

// PUT /api/slides/:id — Update slide
export const updateSlide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slide = await Slide.findById(id);

    if (!slide) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }

    const {
      title,
      subtitle,
      eyebrow,
      badgeText,
      buttonText,
      linkPath,
      secondaryButtonText,
      secondaryLinkPath,
      order,
      isActive,
      imageUrl,
      showStats,
      stat1Value,
      stat1Label,
      stat2Value,
      stat2Label,
      stat3Value,
      stat3Label,
    } = req.body;

    if (req.file) {
      // If uploading a new file, delete old local image file if present
      if (slide.image && slide.image.startsWith("/uploads/")) {
        deleteFile(slide.image);
      }
      slide.image = buildPublicPath(req.file);
    } else if (imageUrl) {
      slide.image = imageUrl;
    }

    if (title !== undefined) slide.title = title;
    if (subtitle !== undefined) slide.subtitle = subtitle;
    if (eyebrow !== undefined) slide.eyebrow = eyebrow;
    if (badgeText !== undefined) slide.badgeText = badgeText;
    if (buttonText !== undefined) slide.buttonText = buttonText;
    if (linkPath !== undefined) slide.linkPath = linkPath;
    if (secondaryButtonText !== undefined) slide.secondaryButtonText = secondaryButtonText;
    if (secondaryLinkPath !== undefined) slide.secondaryLinkPath = secondaryLinkPath;
    if (order !== undefined) slide.order = Number(order);
    if (isActive !== undefined) slide.isActive = isActive === "true" || isActive === true;
    if (showStats !== undefined) slide.showStats = showStats === "true" || showStats === true;
    if (stat1Value !== undefined) slide.stat1Value = stat1Value;
    if (stat1Label !== undefined) slide.stat1Label = stat1Label;
    if (stat2Value !== undefined) slide.stat2Value = stat2Value;
    if (stat2Label !== undefined) slide.stat2Label = stat2Label;
    if (stat3Value !== undefined) slide.stat3Value = stat3Value;
    if (stat3Label !== undefined) slide.stat3Label = stat3Label;

    await slide.save();
    res.json({ success: true, slide });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/slides/:id/status — Toggle active status
export const updateSlideStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const slide = await Slide.findByIdAndUpdate(
      id,
      { isActive: Boolean(isActive) },
      { new: true }
    );
    if (!slide) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }
    res.json({ success: true, slide });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/slides/:id — Delete slide
export const deleteSlide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slide = await Slide.findById(id);
    if (!slide) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }

    if (slide.image && slide.image.startsWith("/uploads/")) {
      deleteFile(slide.image);
    }

    await slide.deleteOne();
    res.json({ success: true, message: "Slide deleted successfully" });
  } catch (error) {
    next(error);
  }
};
