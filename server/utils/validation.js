import { z } from "zod"; 

// Location schema
const locationSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City name must be at least 2 characters"),
  state: z.string().optional(),
  coordinates: z
    .array(z.number())
    .length(2, "Coordinates must contain latitude and longitude")
    .optional(),
});

// Base event schema
const eventSchema = z.object({
  name: z
    .string()
    .min(3, "Event name must be at least 3 characters")
    .max(100, "Event name cannot exceed 100 characters"),
    
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
    
  date: z
    .string()
    .refine((date) => new Date(date) > new Date(), {
      message: "Event date must be in the future",
    }),
    
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"),
    
  location: locationSchema,
  
  maxParticipants: z
    .number()
    .int()
    .min(2, "Minimum 2 participants required")
    .max(100, "Maximum 100 participants allowed"),
    
  category: z.enum([
    "Basketball",
    "Football",
    "Cricket",
    "Tennis",
    "Volleyball",
    "Badminton",
    "Table Tennis",
    "Running",
    "Cycling",
    "Swimming",
    "Yoga",
    "Fitness",
    "Other"
  ], {
    errorMap: () => ({ message: "Invalid sport category" })
  }),
  
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"], {
    errorMap: () => ({ message: "Invalid difficulty level" })
  }),
  
  eventType: z.enum(["casual", "competitive", "training"], {
    errorMap: () => ({ message: "Invalid event type" })
  }),
  
  registrationFee: z
    .number()
    .min(0, "Registration fee cannot be negative")
    .default(0),
    
  rules: z
    .array(z.string())
    .min(0)
    .max(10, "Maximum 10 rules allowed")
    .optional()
    .default([]),
    
  equipment: z
    .array(z.string())
    .min(0)
    .max(10, "Maximum 10 equipment items allowed")
    .optional()
    .default([]),
});

export const validateEvent = (data) => {
  try {
    // Parse date if it's a string
    if (typeof data.date === 'string') {
      data.date = new Date(data.date).toISOString().split('T')[0];
    }

    // Convert maxParticipants to number if it's a string
    if (typeof data.maxParticipants === 'string') {
      data.maxParticipants = parseInt(data.maxParticipants, 10);
    }

    // Convert registrationFee to number if it's a string
    if (typeof data.registrationFee === 'string') {
      data.registrationFee = parseFloat(data.registrationFee);
    }

    // Parse location if it's a string
    if (typeof data.location === 'string') {
      data.location = JSON.parse(data.location);
    }

    // Parse arrays if they're strings
    if (typeof data.rules === 'string') {
      data.rules = JSON.parse(data.rules);
    }
    if (typeof data.equipment === 'string') {
      data.equipment = JSON.parse(data.equipment);
    }

    const validatedData = eventSchema.parse(data);
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error.errors) {
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

// Additional validation functions for specific use cases
export const validateEventUpdate = (data) => {
  // Create a partial schema that makes all fields optional
  const updateSchema = eventSchema.partial();
  
  try {
    const validatedData = updateSchema.parse(data);
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    return {
      success: false,
      errors: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }))
    };
  }
};

// Validate location coordinates
export const validateCoordinates = (lat, lng) => {
  const coordSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  });

  try {
    coordSchema.parse({ latitude: lat, longitude: lng });
    return true;
  } catch {
    return false;
  }
};

// Export additional utility functions
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && date > new Date();
};

export const isValidTime = (timeString) => {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString);
};
