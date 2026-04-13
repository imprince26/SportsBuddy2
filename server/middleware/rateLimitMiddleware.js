import rateLimit from "express-rate-limit";

const toPositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildRateLimitMessage = (defaultMessage) => (req) => {
  const resetTime = req.rateLimit?.resetTime;
  const retryAfterSeconds = resetTime
    ? Math.max(1, Math.ceil((new Date(resetTime).getTime() - Date.now()) / 1000))
    : undefined;

  return {
    success: false,
    message: defaultMessage,
    retryAfterSeconds,
  };
};

const createRateLimiter = ({
  windowMs,
  max,
  message,
  standardHeaders = "draft-8",
  legacyHeaders = false,
  skipSuccessfulRequests = false,
}) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders,
    legacyHeaders,
    skipSuccessfulRequests,
    message: buildRateLimitMessage(message),
  });
};

export const apiGlobalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: toPositiveNumber(process.env.RATE_LIMIT_GLOBAL_MAX, 1200),
  message: "Too many requests. Please try again shortly.",
});

export const authLoginLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: toPositiveNumber(process.env.RATE_LIMIT_LOGIN_MAX, 8),
  message: "Too many login attempts. Please try again later.",
  skipSuccessfulRequests: true,
});

export const authRegisterLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: toPositiveNumber(process.env.RATE_LIMIT_REGISTER_MAX, 10),
  message: "Too many registration attempts. Please try again in some time.",
});

export const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: toPositiveNumber(process.env.RATE_LIMIT_PASSWORD_RESET_MAX, 6),
  message: "Too many password reset attempts. Please try again in some time.",
});

export const adminReadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: toPositiveNumber(process.env.RATE_LIMIT_ADMIN_READ_MAX, 240),
  message: "Admin read limit reached. Please retry shortly.",
});

export const adminWriteLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: toPositiveNumber(process.env.RATE_LIMIT_ADMIN_WRITE_MAX, 90),
  message: "Admin write limit reached. Please retry shortly.",
});

export const notificationSendLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: toPositiveNumber(process.env.RATE_LIMIT_NOTIFICATION_SEND_MAX, 30),
  message: "Too many notification operations. Please retry shortly.",
});

export const publicSearchLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: toPositiveNumber(process.env.RATE_LIMIT_PUBLIC_SEARCH_MAX, 120),
  message: "Too many search requests. Please retry shortly.",
});

export const userWriteLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: toPositiveNumber(process.env.RATE_LIMIT_USER_WRITE_MAX, 90),
  message: "Too many write requests. Please retry shortly.",
});

export const uploadLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: toPositiveNumber(process.env.RATE_LIMIT_UPLOAD_MAX, 40),
  message: "Upload request limit reached. Please retry shortly.",
});
