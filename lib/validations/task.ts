import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  due_date: z.string().optional(),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;