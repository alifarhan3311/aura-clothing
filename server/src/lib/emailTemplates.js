// ── Shared helpers ─────────────────────────────────────────────────────────────

const PKR = (n) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);

const baseStyle = `
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #f5f5f0;
  margin: 0;
  padding: 0;
`;

const STATUS_LABELS = {
  pending:    { label: "Pending",    color: "#d97706", bg: "#fef3c7" },
  confirmed:  { label: "Confirmed",  color: "#065f46", bg: "#d1fae5" },
  dispatched: { label: "Dispatched", color: "#1d4ed8", bg: "#dbeafe" },
  delivered:  { label: "Delivered",  color: "#166534", bg: "#dcfce7" },
  cancelled:  { label: "Cancelled",  color: "#991b1b", bg: "#fee2e2" },
  rejected:   { label: "Rejected",   color: "#7f1d1d", bg: "#fecaca" },
};

// ── Item rows for order summary table ─────────────────────────────────────────

function itemRows(items) {
  return items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;">
        ${item.name}
        ${item.selectedSize ? `<span style="color:#9ca3af;font-size:11px;"> · ${item.selectedSize}</span>` : ""}
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;text-align:center;">
        ${item.quantity}
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;font-weight:600;text-align:right;">
        ${PKR(item.price * item.quantity)}
      </td>
    </tr>`
    )
    .join("");
}

// ── Layout wrapper ─────────────────────────────────────────────────────────────

function layout(title, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="${baseStyle}">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#111827 0%,#292524 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:0.15em;font-family:'Georgia',serif;">
                Fade Find
              </h1>
              <p style="margin:6px 0 0;color:#d6d3d1;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">
                Premium Fashion
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 4px;font-size:12px;color:#6b7280;">
                © ${new Date().getFullYear()} Fade Find · All rights reserved
              </p>
              <p style="margin:0;font-size:11px;color:#9ca3af;">
                This is an automated message, please do not reply directly.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── 1. Order Confirmation (to user) ──────────────────────────────────────────

export function orderConfirmationEmail(order) {
  const name = `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`;
  const { status } = order;
  const badge = STATUS_LABELS[status] || STATUS_LABELS.pending;

  const body = `
    <h2 style="margin:0 0 6px;font-size:22px;color:#111827;font-weight:800;">
      Order Received! 🎉
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
      Hi ${name}, thank you for shopping with us. We've received your order and will process it shortly.
    </p>

    <!-- Status badge -->
    <div style="display:inline-block;background:${badge.bg};color:${badge.color};font-size:12px;font-weight:700;padding:6px 14px;border-radius:999px;margin-bottom:24px;letter-spacing:0.05em;text-transform:uppercase;">
      Status: ${badge.label}
    </div>

    <!-- Order meta -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
      <tr>
        <td style="padding:14px 20px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e5e7eb;">
          Order Details
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#374151;padding-bottom:8px;width:50%;">
                <strong>Order ID:</strong><br/>
                <span style="font-family:monospace;font-size:12px;color:#6b7280;">${order._id}</span>
              </td>
              <td style="font-size:13px;color:#374151;padding-bottom:8px;">
                <strong>Date:</strong><br/>
                <span style="color:#6b7280;">${new Date(order.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}</span>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#374151;">
                <strong>Payment:</strong><br/>
                <span style="color:#6b7280;">${order.paymentMethod === "cod" ? "Cash on Delivery" : "Card"}</span>
              </td>
              <td style="font-size:13px;color:#374151;">
                <strong>Shipping:</strong><br/>
                <span style="color:#6b7280;">${order.shippingMethod === "express" ? "Express (1–2 days)" : "Standard (3–5 days)"}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Items table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="padding:10px 8px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;text-align:left;">Item</th>
          <th style="padding:10px 8px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;text-align:center;">Qty</th>
          <th style="padding:10px 8px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows(order.items)}
      </tbody>
    </table>

    <!-- Totals -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="font-size:13px;color:#6b7280;padding:4px 0;">Subtotal</td>
        <td style="font-size:13px;color:#374151;font-weight:500;text-align:right;">${PKR(order.subtotal)}</td>
      </tr>
      ${order.discount > 0 ? `
      <tr>
        <td style="font-size:13px;color:#059669;padding:4px 0;">Coupon (${order.couponCode})</td>
        <td style="font-size:13px;color:#059669;font-weight:500;text-align:right;">−${PKR(order.discount)}</td>
      </tr>` : ""}
      <tr>
        <td style="font-size:13px;color:#6b7280;padding:4px 0;">Shipping</td>
        <td style="font-size:13px;color:#374151;font-weight:500;text-align:right;">${PKR(order.shippingCost)}</td>
      </tr>
      <tr>
        <td colspan="2" style="border-top:2px solid #e5e7eb;padding-top:10px;"></td>
      </tr>
      <tr>
        <td style="font-size:15px;color:#111827;font-weight:800;padding-top:6px;">Total</td>
        <td style="font-size:15px;color:#b45309;font-weight:800;text-align:right;padding-top:6px;">${PKR(order.total)}</td>
      </tr>
    </table>

    <!-- Shipping address -->
    <div style="background:#fef9f0;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.06em;">
        Shipping To
      </p>
      <p style="margin:0;font-size:13px;color:#374151;line-height:1.7;">
        ${name}<br/>
        ${order.shippingInfo.address}<br/>
        ${order.shippingInfo.city}, ${order.shippingInfo.postalCode}<br/>
        ${order.shippingInfo.country}<br/>
        📞 ${order.shippingInfo.phone}
      </p>
    </div>

    <p style="margin:0;font-size:13px;color:#6b7280;">
      We'll send you another email when your order ships. If you have any questions, reply to this email or contact support.
    </p>
  `;

  return layout("Order Confirmation – Fade Find", body);
}

// ── 2. Admin new-order notification ───────────────────────────────────────────

export function adminNewOrderEmail(order) {
  const customer = `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`;

  const body = `
    <h2 style="margin:0 0 6px;font-size:20px;color:#111827;font-weight:800;">
      🛒 New Order Received
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
      A new order has been placed and is awaiting your review.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
      <tr>
        <td style="padding:14px 20px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e5e7eb;">
          Order Summary
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#374151;padding-bottom:8px;width:50%;">
                <strong>Order ID:</strong><br/>
                <span style="font-family:monospace;font-size:12px;color:#6b7280;">${order._id}</span>
              </td>
              <td style="font-size:13px;color:#374151;padding-bottom:8px;">
                <strong>Customer:</strong><br/>
                <span style="color:#6b7280;">${customer}</span>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#374151;padding-bottom:8px;">
                <strong>Email:</strong><br/>
                <span style="color:#6b7280;">${order.shippingInfo.email}</span>
              </td>
              <td style="font-size:13px;color:#374151;padding-bottom:8px;">
                <strong>Phone:</strong><br/>
                <span style="color:#6b7280;">${order.shippingInfo.phone}</span>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#374151;">
                <strong>City:</strong><br/>
                <span style="color:#6b7280;">${order.shippingInfo.city}</span>
              </td>
              <td style="font-size:13px;color:#374151;">
                <strong>Total:</strong><br/>
                <span style="color:#b45309;font-weight:700;font-size:14px;">${PKR(order.total)}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Items -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="padding:10px 8px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;text-align:left;">Item</th>
          <th style="padding:10px 8px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;text-align:center;">Qty</th>
          <th style="padding:10px 8px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows(order.items)}
      </tbody>
    </table>

    <!-- Totals -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${order.discount > 0 ? `
      <tr>
        <td style="font-size:13px;color:#059669;padding:4px 0;">Coupon discount (${order.couponCode})</td>
        <td style="font-size:13px;color:#059669;text-align:right;">−${PKR(order.discount)}</td>
      </tr>` : ""}
      <tr>
        <td style="font-size:13px;color:#6b7280;padding:4px 0;">Shipping (${order.shippingMethod})</td>
        <td style="font-size:13px;color:#374151;text-align:right;">${PKR(order.shippingCost)}</td>
      </tr>
      <tr>
        <td colspan="2" style="border-top:2px solid #e5e7eb;padding-top:8px;"></td>
      </tr>
      <tr>
        <td style="font-size:15px;font-weight:800;color:#111827;">Grand Total</td>
        <td style="font-size:15px;font-weight:800;color:#b45309;text-align:right;">${PKR(order.total)}</td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#6b7280;">
      Log in to the admin panel to manage this order.
    </p>
  `;

  return layout("New Order – Fade Find Admin", body);
}

// ── 3. Status Update email (to user) ─────────────────────────────────────────

export function orderStatusUpdateEmail(order, note = "") {
  const name = `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`;
  const badge = STATUS_LABELS[order.status] || STATUS_LABELS.pending;

  const statusMessages = {
    confirmed:  "Great news! Your order has been confirmed and is being prepared.",
    dispatched: "Your order is on its way! It has been dispatched and will arrive soon.",
    delivered:  "Your order has been delivered. We hope you love your new items! 🎉",
    cancelled:  "Your order has been cancelled. If this was unexpected, please contact support.",
    rejected:   "Unfortunately your order has been rejected. Please contact support for details.",
  };

  const body = `
    <h2 style="margin:0 0 6px;font-size:22px;color:#111827;font-weight:800;">
      Order Status Update
    </h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
      Hi ${name}, here's an update on your order.
    </p>

    <!-- Status badge -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:${badge.bg};color:${badge.color};font-size:14px;font-weight:700;padding:10px 24px;border-radius:999px;letter-spacing:0.05em;text-transform:uppercase;">
        ${badge.label}
      </div>
    </div>

    <p style="margin:0 0 20px;font-size:14px;color:#374151;text-align:center;line-height:1.6;">
      ${statusMessages[order.status] || "Your order status has been updated."}
    </p>

    ${note ? `
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#0369a1;"><strong>Note from team:</strong> ${note}</p>
    </div>` : ""}

    <!-- Order snapshot -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;margin-bottom:24px;">
      <tr>
        <td style="padding:14px 20px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e5e7eb;">
          Order Info
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#374151;padding-bottom:8px;">
                <strong>Order ID:</strong>
                <span style="font-family:monospace;color:#6b7280;font-size:12px;"> ${order._id}</span>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#374151;">
                <strong>Total Paid:</strong>
                <span style="color:#b45309;font-weight:700;"> ${PKR(order.total)}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#6b7280;">
      For any questions, contact our support team. Thank you for choosing Fade Find!
    </p>
  `;

  return layout(`Order ${badge.label} – Fade Find`, body);
}

// ── 5. Admin cancel request notification ─────────────────────────────────────

export function adminCancelRequestEmail(order, reason) {
  const customer = `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`;
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const adminUrl  = `${clientUrl}/admin/orders`;

  const body = `
    <h2 style="margin:0 0 6px;font-size:20px;color:#111827;font-weight:800;">
      ⚠️ Cancel Request Received
    </h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
      A customer has requested cancellation of their order. Please review and take action.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;overflow:hidden;margin-bottom:24px;">
      <tr>
        <td style="padding:14px 20px;font-size:12px;color:#9a3412;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #fed7aa;">
          Cancel Request Details
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#374151;padding-bottom:8px;width:50%;">
                <strong>Order ID:</strong><br/>
                <span style="font-family:monospace;font-size:12px;color:#6b7280;">${order._id}</span>
              </td>
              <td style="font-size:13px;color:#374151;padding-bottom:8px;">
                <strong>Customer:</strong><br/>
                <span style="color:#6b7280;">${customer}</span>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#374151;padding-bottom:8px;">
                <strong>Email:</strong><br/>
                <span style="color:#6b7280;">${order.shippingInfo.email}</span>
              </td>
              <td style="font-size:13px;color:#374151;padding-bottom:8px;">
                <strong>Order Total:</strong><br/>
                <span style="color:#b45309;font-weight:700;">${PKR(order.total)}</span>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="font-size:13px;color:#374151;padding-top:4px;">
                <strong>Current Status:</strong>
                <span style="color:#6b7280;text-transform:capitalize;"> ${order.status}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Reason -->
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:0.06em;">
        Reason for Cancellation
      </p>
      <p style="margin:0;font-size:14px;color:#374151;font-style:italic;">
        "${reason || 'No reason provided'}"
      </p>
    </div>

    <!-- Items -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="padding:10px 8px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;text-align:left;">Item</th>
          <th style="padding:10px 8px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;text-align:center;">Qty</th>
          <th style="padding:10px 8px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows(order.items)}
      </tbody>
    </table>

    <!-- CTA -->
    <div style="text-align:center;margin-top:24px;">
      <a href="${adminUrl}"
         style="display:inline-block;background:#111827;color:#ffffff;font-size:13px;font-weight:700;padding:12px 28px;border-radius:999px;text-decoration:none;">
        Review in Admin Panel →
      </a>
    </div>
  `;

  return layout("Cancel Request – Fade Find Admin", body);
}

// ── 6. Cancel request acknowledgment (to user) ────────────────────────────────

export function cancelRequestAckEmail(order, reason) {
  const name = `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`;

  const body = `
    <h2 style="margin:0 0 6px;font-size:22px;color:#111827;font-weight:800;">
      Cancel Request Received 📋
    </h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
      Hi ${name}, we've received your cancellation request and our team will review it shortly.
    </p>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#9a3412;text-transform:uppercase;letter-spacing:0.06em;">
        Your Request
      </p>
      <p style="margin:0;font-size:13px;color:#374151;">
        <strong>Order ID:</strong> <span style="font-family:monospace;color:#6b7280;">${order._id}</span><br/>
        <strong>Reason:</strong> <span style="font-style:italic;">"${reason || 'No reason provided'}"</span>
      </p>
    </div>

    <p style="margin:0 0 12px;font-size:13px;color:#374151;">
      Our team will process your request within <strong>24 hours</strong>. Once approved:
    </p>
    <ul style="margin:0 0 20px;padding-left:20px;font-size:13px;color:#6b7280;line-height:1.8;">
      <li>Your order will be cancelled</li>
      <li>Stock will be released</li>
      <li>You'll receive a confirmation email</li>
    </ul>

    <p style="margin:0;font-size:13px;color:#9ca3af;">
      If you have questions, please contact our support team. Thank you for your patience.
    </p>
  `;

  return layout("Cancel Request Received – Fade Find", body);
}

export function orderTrackingEmail(order) {
  const name = `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`;
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const trackingUrl = `${clientUrl}/track/${order.trackingNumber}`;

  const body = `
    <h2 style="margin:0 0 6px;font-size:22px;color:#111827;font-weight:800;">
      Your Order is Confirmed ✅
    </h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
      Hi ${name}, your order has been confirmed! Here's your tracking information.
    </p>

    <!-- Tracking number highlight -->
    <div style="background:linear-gradient(135deg,#111827 0%,#292524 100%);border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 8px;font-size:11px;color:#d6d3d1;text-transform:uppercase;letter-spacing:0.1em;">
        Your Tracking Number
      </p>
      <p style="margin:0;font-size:22px;font-weight:900;color:#fbbf24;font-family:monospace;letter-spacing:0.12em;">
        ${order.trackingNumber}
      </p>
    </div>

    <!-- Track button -->
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${trackingUrl}"
         style="display:inline-block;background:#b45309;color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;letter-spacing:0.04em;">
        Track My Order →
      </a>
    </div>

    <!-- Order items summary -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="padding:10px 8px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;text-align:left;">Item</th>
          <th style="padding:10px 8px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;text-align:center;">Qty</th>
          <th style="padding:10px 8px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows(order.items)}
      </tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${order.discount > 0 ? `
      <tr>
        <td style="font-size:13px;color:#059669;padding:4px 0;">Coupon (${order.couponCode})</td>
        <td style="font-size:13px;color:#059669;text-align:right;">−${PKR(order.discount)}</td>
      </tr>` : ""}
      <tr>
        <td style="font-size:13px;color:#6b7280;padding:4px 0;">Shipping</td>
        <td style="font-size:13px;color:#374151;text-align:right;">${PKR(order.shippingCost)}</td>
      </tr>
      <tr>
        <td colspan="2" style="border-top:2px solid #e5e7eb;padding-top:8px;"></td>
      </tr>
      <tr>
        <td style="font-size:15px;font-weight:800;color:#111827;">Total</td>
        <td style="font-size:15px;font-weight:800;color:#b45309;text-align:right;">${PKR(order.total)}</td>
      </tr>
    </table>

    <!-- ETA -->
    <div style="background:#fef9f0;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;">
      <p style="margin:0;font-size:13px;color:#92400e;">
        🚚 <strong>Estimated Delivery:</strong>
        ${order.shippingMethod === "express" ? "1–2 business days" : "3–5 business days"}
      </p>
    </div>
  `;

  return layout("Order Confirmed & Tracking – Fade Find", body);
}

// ── 7. Contact Acknowledgment (to User) ───────────────────────────────────────

export function contactUserAckEmail(contact) {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  const body = `
    <h2 style="margin:0 0 6px;font-size:22px;color:#111827;font-weight:800;">
      We've Received Your Message! ✉️
    </h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
      Hi ${contact.name}, thank you for reaching out to Fade Find. Our support team has received your message and will get back to you shortly.
    </p>

    <!-- Message snapshot -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid #e5e7eb;">
      <tr>
        <td style="padding:14px 20px;font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e5e7eb;background:#f3f4f6;">
          Inquiry Summary
        </td>
      </tr>
      <tr>
        <td style="padding:18px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#374151;padding-bottom:10px;">
                <strong>Subject:</strong> <span style="color:#111827;font-weight:600;">${contact.subject || 'General Inquiry'}</span>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#374151;padding-bottom:10px;">
                <strong>Ticket ID:</strong> <span style="font-family:monospace;color:#6b7280;font-size:12px;">${contact._id}</span>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#374151;padding-bottom:10px;">
                <strong>Status:</strong> <span style="display:inline-block;padding:2px 8px;background:#fef3c7;color:#d97706;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;">Pending Review</span>
              </td>
            </tr>
          </table>

          <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin-top:8px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;">Your Message</p>
            <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;white-space:pre-wrap;">${contact.message}</p>
          </div>
        </td>
      </tr>
    </table>

    <div style="background:#fef9f0;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
        ⏱️ Our average response time is within <strong>24 business hours</strong>. You can also track the status of your inquiry directly from your account dashboard.
      </p>
    </div>

    <div style="text-align:center;margin-top:24px;">
      <a href="${clientUrl}/profile"
         style="display:inline-block;background:#111827;color:#ffffff;font-size:13px;font-weight:700;padding:12px 28px;border-radius:999px;text-decoration:none;">
        View Account Dashboard →
      </a>
    </div>
  `;

  return layout("Message Received – Fade Find", body);
}

// ── 8. Contact Notification (to Admin) ────────────────────────────────────────

export function contactAdminNotificationEmail(contact) {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const adminUrl = `${clientUrl}/admin/messages`;

  const body = `
    <h2 style="margin:0 0 6px;font-size:20px;color:#111827;font-weight:800;">
      💬 New Customer Inquiry Received
    </h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
      A customer has submitted a new inquiry via the contact form.
    </p>

    <!-- Details Card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:24px;">
      <tr>
        <td style="padding:14px 20px;font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e5e7eb;background:#f3f4f6;">
          Customer & Inquiry Details
        </td>
      </tr>
      <tr>
        <td style="padding:18px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#374151;padding-bottom:8px;width:50%;">
                <strong>Name:</strong><br/>
                <span style="color:#111827;font-weight:600;">${contact.name}</span>
              </td>
              <td style="font-size:13px;color:#374151;padding-bottom:8px;">
                <strong>Email:</strong><br/>
                <a href="mailto:${contact.email}" style="color:#1d4ed8;text-decoration:none;">${contact.email}</a>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#374151;padding-bottom:8px;">
                <strong>Phone:</strong><br/>
                <span style="color:#6b7280;">${contact.phone || 'N/A'}</span>
              </td>
              <td style="font-size:13px;color:#374151;padding-bottom:8px;">
                <strong>Ticket ID:</strong><br/>
                <span style="font-family:monospace;font-size:12px;color:#6b7280;">${contact._id}</span>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="font-size:13px;color:#374151;padding-top:4px;padding-bottom:8px;">
                <strong>Subject:</strong><br/>
                <span style="color:#111827;font-weight:600;">${contact.subject || 'General Inquiry'}</span>
              </td>
            </tr>
          </table>

          <!-- Message Box -->
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-top:10px;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;">Message</p>
            <p style="margin:0;font-size:14px;color:#1f2937;line-height:1.6;white-space:pre-wrap;">${contact.message}</p>
          </div>
        </td>
      </tr>
    </table>

    <div style="text-align:center;margin-top:24px;">
      <a href="${adminUrl}"
         style="display:inline-block;background:#111827;color:#ffffff;font-size:13px;font-weight:700;padding:12px 28px;border-radius:999px;text-decoration:none;">
        Respond in Admin Portal →
      </a>
    </div>
  `;

  return layout("New Contact Inquiry – Fade Find Admin", body);
}

// ── 9. Contact Status Update & Reply (to User) ────────────────────────────────

export function contactStatusUpdateEmail(contact, adminReply = "") {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  const CONTACT_STATUS_MAP = {
    pending:     { label: "Pending",     color: "#d97706", bg: "#fef3c7" },
    in_progress: { label: "In Progress", color: "#1d4ed8", bg: "#dbeafe" },
    resolved:    { label: "Resolved",    color: "#166534", bg: "#dcfce7" },
    closed:      { label: "Closed",      color: "#4b5563", bg: "#f3f4f6" },
  };

  const badge = CONTACT_STATUS_MAP[contact.status] || CONTACT_STATUS_MAP.pending;

  const statusMessages = {
    in_progress: "Our team is actively looking into your inquiry and working on a resolution.",
    resolved:    "Your inquiry has been marked as resolved! We hope our answer was helpful.",
    closed:      "This support inquiry has now been closed.",
    pending:     "Your inquiry has been received and is pending review.",
  };

  const body = `
    <h2 style="margin:0 0 6px;font-size:22px;color:#111827;font-weight:800;">
      Update on Your Inquiry 📬
    </h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
      Hi ${contact.name}, there has been an update on your support request.
    </p>

    <!-- Status badge -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:${badge.bg};color:${badge.color};font-size:13px;font-weight:700;padding:8px 20px;border-radius:999px;letter-spacing:0.05em;text-transform:uppercase;">
        Status: ${badge.label}
      </div>
    </div>

    <p style="margin:0 0 20px;font-size:14px;color:#374151;text-align:center;line-height:1.6;">
      ${statusMessages[contact.status] || "Your inquiry status has been updated."}
    </p>

    ${adminReply ? `
    <!-- Team response -->
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px 20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:0.05em;">
        Response from Fade Find Team
      </p>
      <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.6;white-space:pre-wrap;">
        ${adminReply}
      </p>
    </div>` : ""}

    <!-- Ticket snapshot -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;margin-bottom:24px;">
      <tr>
        <td style="padding:14px 20px;">
          <p style="margin:0 0 6px;font-size:13px;color:#374151;">
            <strong>Ticket ID:</strong> <span style="font-family:monospace;color:#6b7280;">${contact._id}</span>
          </p>
          <p style="margin:0 0 6px;font-size:13px;color:#374151;">
            <strong>Subject:</strong> <span style="color:#111827;">${contact.subject || 'General Inquiry'}</span>
          </p>
          <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5;">
            <strong>Original Message:</strong> "${contact.message.length > 150 ? contact.message.slice(0, 150) + '...' : contact.message}"
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;font-size:13px;color:#6b7280;text-align:center;">
      If you have further questions or need additional assistance, you can submit a new message anytime or visit your dashboard.
    </p>

    <div style="text-align:center;">
      <a href="${clientUrl}/profile"
         style="display:inline-block;background:#111827;color:#ffffff;font-size:13px;font-weight:700;padding:12px 28px;border-radius:999px;text-decoration:none;">
        Open User Dashboard →
      </a>
    </div>
  `;

  return layout(`Inquiry ${badge.label} – Fade Find`, body);
}

