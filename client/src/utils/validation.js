import * as z from "zod";

// User validation schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Event validation schema
export const eventSchema = z.object({
  name: z
    .string()
    .min(3, "Event name must be at least 3 characters")
    .max(100, "Event name cannot exceed 100 characters"),
  category: z.enum([
    "Football",
    "Basketball",
    "Tennis",
    "Running",
    "Cycling",
    "Swimming",
    "Volleyball",
    "Cricket",
    "Other",
  ]),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  date: z.string().refine((val) => new Date(val) > new Date(), {
    message: "Event date must be in the future",
  }),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  location: z.object({
    address: z.string().min(3, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().optional(),
  }),
  maxParticipants: z.coerce
    .number()
    .int("Must be a whole number")
    .min(1, "At least 1 participant required")
    .max(1000, "Maximum 1000 participants allowed"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  registrationFee: z.coerce
    .number()
    .min(0, "Fee cannot be negative")
    .optional(),
});

// Location sub-schema
const locationSchema = z.object({
  address: z.string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address cannot exceed 200 characters"),
  city: z.string()
    .min(2, "City name must be at least 2 characters")
    .max(100, "City name cannot exceed 100 characters"),
  state: z.string()
    .max(100, "State name cannot exceed 100 characters")
    .optional(),
  coordinates: z.array(z.number())
    .length(2, "Coordinates must contain latitude and longitude")
    .optional()
});

// Equipment sub-schema
const equipmentSchema = z.object({
  item: z.string()
    .min(2, "Equipment name must be at least 2 characters")
    .max(100, "Equipment name cannot exceed 100 characters"),
  required: z.boolean().default(false)
});

// Main event schema
export const eventSchema = z.object({
  name: z.string()
    .min(3, "Event name must be at least 3 characters")
    .max(100, "Event name cannot exceed 100 characters")
    .trim(),

  category: z.enum([
    "Basketball",
    "Football",
    "Cricket",
    "Tennis",
    "Volleyball",
    "Badminton",
    "Running",
    "Cycling",
    "Swimming",
    "Yoga",
    "Fitness",
    "Other"
  ], {
    required_error: "Please select a category",
    invalid_type_error: "Invalid category selected"
  }),

  description: z.string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description cannot exceed 2000 characters")
    .trim(),

  date: z.string()
    .refine(date => {
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }, "Event date must be in the future"),

  time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (use HH:MM)"),

  location: locationSchema,

  maxParticipants: z.number()
    .int("Must be a whole number")
    .min(2, "Minimum 2 participants required")
    .max(1000, "Maximum 1000 participants allowed"),

  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"], {
    required_error: "Please select a difficulty level",
    invalid_type_error: "Invalid difficulty level"
  }),

  eventType: z.enum(["casual", "competitive", "training"], {
    required_error: "Please select an event type",
    invalid_type_error: "Invalid event type"
  }),

  registrationFee: z.number()
    .min(0, "Registration fee cannot be negative")
    .default(0),

  rules: z.array(
    z.string()
      .min(3, "Rule must be at least 3 characters")
      .max(200, "Rule cannot exceed 200 characters")
  )
    .max(20, "Maximum 20 rules allowed")
    .optional()
    .default([]),

  equipment: z.array(equipmentSchema)
    .max(20, "Maximum 20 equipment items allowed")
    .optional()
    .default([]),

  images: z.array(
    z.object({
      url: z.string().url("Invalid image URL"),
      public_id: z.string(),
    })
  )
    .max(5, "Maximum 5 images allowed")
    .optional()
    .default([]),
});

// Helper function to validate event data
export const validateEvent = (data) => {
  try {
    // Convert string numbers to actual numbers
    const parsedData = {
      ...data,
      maxParticipants: Number(data.maxParticipants),
      registrationFee: Number(data.registrationFee || 0),
    };

    const validatedData = eventSchema.parse(parsedData);
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return {
      success: false,
      errors: [{ message: 'Validation failed' }]
    };
  }
};

// Export utility functions for specific validations
export const validateDate = (date) => {
  const eventDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
};

export const validateTime = (time) => {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG and WebP are allowed'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size too large. Maximum size is 5MB'
    };
  }

  return { isValid: true };
};
