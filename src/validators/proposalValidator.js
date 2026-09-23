const { z } = require("zod");

const createProposalSchema = z.object({
  params: z.object({
    jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID"),
  }),
  body: z.object({
    coverLetter: z
      .string({ required_error: "Cover letter is required" })
      .trim()
      .min(20, "Cover letter must be at least 20 characters")
      .max(3000, "Cover letter must not exceed 3000 characters"),
    bidAmount: z
      .number({ required_error: "Bid amount is required" })
      .min(1, "Bid amount must be at least 1"), 
    estimatedDays: z
      .number({ required_error: "Estimated duration is required" })
      .min(1, "Estimated duration must be at least 1 day")
      .max(365, "Estimated duration cannot exceed 365 days"), 
    attachments: z
      .array(z.string().url("Each attachment must be a valid file URL"))
      .max(5, "Maximum 5 attachments allowed")
      .optional(), 
  }),
});

const updateProposalSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid proposal ID"),
  }),
  body: z.object({
    coverLetter: z.string().trim().min(20).max(3000).optional(),
    bidAmount: z.number().min(1).optional(),
    estimatedDays: z.number().min(1).max(365).optional(),
    attachments: z.array(z.string().url()).max(5).optional(),
  }),
});


const listProposalsSchema = z.object({
  params: z.object({
    jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid job ID"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

const myProposalsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

const proposalIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid proposal ID"),
  }),
});

module.exports = {
  createProposalSchema,
  updateProposalSchema,
  listProposalsSchema,
  myProposalsSchema,
  proposalIdSchema,
};