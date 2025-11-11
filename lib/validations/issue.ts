import { z } from "zod";

/**
 * Zod schema for creating a new issue
 */
export const createIssueSchema = z.object({
  // Required fields
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),

  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must not exceed 5000 characters"),

  priority: z.enum(["low", "medium", "high", "urgent"] as const, {
    error: "Priority is required",
  }),

  assignedTo: z
    .array(z.string().uuid("Invalid user ID"))
    .min(1, "At least one assignee is required")
    .max(10, "Cannot assign more than 10 users"),

  // Optional fields
  deadline: z.date().optional().nullable(),

  category: z
    .enum(["ui", "dev", "media", "default"])
    .default("default")
    .optional(),

  buildVersion: z
    .string()
    .max(50, "Build version must not exceed 50 characters")
    .optional()
    .nullable()
    .or(z.literal("")),

  solvedCommitNumber: z
    .string()
    .max(100, "Commit number must not exceed 100 characters")
    .optional()
    .nullable()
    .or(z.literal("")),

  // For linking to scenario
  scenarioId: z.string().uuid().optional().nullable(),
  scenarioName: z.string().max(200).optional().nullable(),
});

/**
 * Zod schema for updating an issue
 */
export const updateIssueSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .optional(),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must not exceed 5000 characters")
    .optional(),

  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .optional(),

  status: z
    .enum(["open", "pending_approval", "closed"])
    .optional(),

  category: z
    .enum(["ui", "dev", "media", "default"])
    .optional(),

  deadline: z.date().optional().nullable(),

  buildVersion: z
    .string()
    .max(50, "Build version must not exceed 50 characters")
    .optional()
    .nullable(),

  solvedCommitNumber: z
    .string()
    .max(100, "Commit number must not exceed 100 characters")
    .optional()
    .nullable(),

  scenarioId: z.string().uuid().optional().nullable(),
  scenarioName: z.string().max(200).optional().nullable(),
  
  isArchived: z.boolean().optional(),
});

/**
 * Zod schema for issue filters
 */
export const issueFiltersSchema = z.object({
  status: z.array(z.enum(["open", "pending_approval", "closed"])).optional(),
  priority: z.array(z.enum(["low", "medium", "high", "urgent"])).optional(),
  category: z.array(z.enum(["ui", "dev", "media", "default"])).optional(),
  assignedTo: z.array(z.string().uuid()).optional(),
  createdBy: z.string().uuid().optional(),
  search: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  isArchived: z.boolean().optional(),
});

/**
 * Zod schema for adding a comment/activity
 */
export const addCommentSchema = z.object({
  text: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must not exceed 2000 characters"),
});

/**
 * Zod schema for closing an issue
 */
export const closeIssueSchema = z.object({
  solvedCommitNumber: z
    .string()
    .max(100, "Commit number must not exceed 100 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
});

// Type exports for use in components
export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
export type IssueFiltersInput = z.infer<typeof issueFiltersSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type CloseIssueInput = z.infer<typeof closeIssueSchema>;