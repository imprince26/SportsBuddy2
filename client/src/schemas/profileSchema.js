import * as z from "zod"

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username cannot exceed 30 characters"),
  email: z.string().email("Please enter a valid email"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().or(z.literal("")),
  location: z.object({
    city: z.string().optional().or(z.literal("")),
    state: z.string().optional().or(z.literal("")),
    country: z.string().optional().or(z.literal("")),
  }),
  socialLinks: z.object({
    facebook: z.string().optional().or(z.literal("")),
    twitter: z.string().optional().or(z.literal("")),
    instagram: z.string().optional().or(z.literal("")),
  }),
  sportsPreferences: z
    .array(
      z.object({
        sport: z.enum([
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
        skillLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
      }),
    )
    .optional(),
})

export const achievementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
})