const { z } = require("zod");

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "Name must be at least 2 characters"
    )
    .max(
      100,
      "Name cannot exceed 100 characters"
    ),

  email: z
    .string()
    .trim()
    .email(
      "Please provide a valid email address"
    )
    .transform((value) =>
      value.toLowerCase()
    ),

  password: z
    .string()
    .min(
      8,
      "Password must be at least 8 characters"
    )
    .max(
      72,
      "Password cannot exceed 72 characters"
    )
    .regex(
      /[A-Z]/,
      "Password must contain at least one uppercase letter"
    )
    .regex(
      /[a-z]/,
      "Password must contain at least one lowercase letter"
    )
    .regex(
      /[0-9]/,
      "Password must contain at least one number"
    ),

  role: z
    .enum([
      "CLIENT",
      "FREELANCER"
    ])
    .default("FREELANCER")
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email(
      "Please provide a valid email address"
    )
    .transform((value) =>
      value.toLowerCase()
    ),

  password: z
    .string()
    .min(
      1,
      "Password is required"
    )
});

module.exports = {
  registerSchema,
  loginSchema
};