import AdminAuditLog from "../models/adminAuditLogModel.js";

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip;
};

export const logAdminAction = async ({
  req,
  action,
  entityType,
  entityId,
  status = "success",
  metadata = {},
}) => {
  try {
    if (!req?.user?._id) {
      return;
    }

    await AdminAuditLog.create({
      admin: req.user._id,
      action,
      entityType,
      entityId,
      status,
      metadata,
      ipAddress: getClientIp(req),
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error("Failed to write admin audit log", error);
  }
};
