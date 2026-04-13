import { z } from "zod";

const formatPath = (path) => {
  if (!path || path.length === 0) {
    return "root";
  }

  return path.reduce((acc, part) => {
    if (typeof part === "number") {
      return `${acc}[${part}]`;
    }
    return acc ? `${acc}.${part}` : String(part);
  }, "");
};

const normalizeValidationErrors = (issues, source) => {
  return issues.map((issue) => ({
    source,
    path: formatPath(issue.path),
    message: issue.message,
  }));
};

export const validateRequest = ({ body, query, params } = {}) => {
  return (req, res, next) => {
    const errors = [];

    const validators = [
      { source: "body", schema: body, payload: req.body },
      { source: "query", schema: query, payload: req.query },
      { source: "params", schema: params, payload: req.params },
    ];

    for (const validator of validators) {
      if (!validator.schema) {
        continue;
      }

      const result = validator.schema.safeParse(validator.payload);
      if (!result.success) {
        errors.push(...normalizeValidationErrors(result.error.issues, validator.source));
        continue;
      }

      req[validator.source] = result.data;
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    return next();
  };
};

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid identifier format");
