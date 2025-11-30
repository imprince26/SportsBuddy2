import * as z from "zod"

export const eventSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  date: z.string().min(1, "Date is required"),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  location: z.object({
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().optional(),
  }),
  maxParticipants: z.number().min(2, "Minimum 2 participants").max(1000, "Maximum 1000 participants"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  eventType: z.enum(["casual", "tournament", "training"]),
  registrationFee: z.number().min(0, "Registration fee cannot be negative"),
  rules: z.array(z.string()).optional(),
  equipment: z
    .array(
      z.object({
        item: z.string(),
        required: z.boolean(),
      }),
    )
    .optional(),
})

export const defaultEventValues = {
  name: "",
  category: "",
  description: "",
  date: "",
  time: "",
  location: {
    address: "",
    city: "",
    state: "",
  },
  maxParticipants: 10,
  difficulty: "Beginner",
  eventType: "casual",
  registrationFee: 0,
  rules: [],
  equipment: [],
}