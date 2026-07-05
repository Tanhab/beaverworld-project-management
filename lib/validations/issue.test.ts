import { describe, it, expect } from 'vitest';
import { createIssueSchema, addCommentSchema } from './issue';

const validIssue = {
  title: 'Login button does nothing',
  description: 'Clicking the login button on the auth page has no effect.',
  priority: 'high' as const,
  assignedTo: ['123e4567-e89b-12d3-a456-426614174000'],
};

describe('createIssueSchema', () => {
  it('accepts a valid issue', () => {
    const result = createIssueSchema.safeParse(validIssue);
    expect(result.success).toBe(true);
  });

  it('accepts a valid issue without the optional category', () => {
    const result = createIssueSchema.safeParse({ ...validIssue, category: undefined });
    expect(result.success).toBe(true);
  });

  it('rejects a title shorter than 3 characters', () => {
    const result = createIssueSchema.safeParse({ ...validIssue, title: 'ab' });
    expect(result.success).toBe(false);
  });

  it('rejects a description shorter than 10 characters', () => {
    const result = createIssueSchema.safeParse({ ...validIssue, description: 'too short' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty assignee list', () => {
    const result = createIssueSchema.safeParse({ ...validIssue, assignedTo: [] });
    expect(result.success).toBe(false);
  });

  it('rejects a non-uuid assignee', () => {
    const result = createIssueSchema.safeParse({ ...validIssue, assignedTo: ['not-a-uuid'] });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown priority', () => {
    const result = createIssueSchema.safeParse({ ...validIssue, priority: 'critical' });
    expect(result.success).toBe(false);
  });
});

describe('addCommentSchema', () => {
  it('accepts a normal comment', () => {
    expect(addCommentSchema.safeParse({ text: 'Looks good to me' }).success).toBe(true);
  });

  it('rejects an empty comment', () => {
    expect(addCommentSchema.safeParse({ text: '' }).success).toBe(false);
  });

  it('rejects a comment longer than 2000 characters', () => {
    expect(addCommentSchema.safeParse({ text: 'a'.repeat(2001) }).success).toBe(false);
  });
});
