import { describe, it, expect } from 'vitest';
import { sortIssues, formatDeadline, getPriorityColor } from './utils';
import type { IssueWithRelations } from '../types/database';

function makeIssue(overrides: Partial<IssueWithRelations>): IssueWithRelations {
  return {
    id: 'x',
    status: 'open',
    priority: 'medium',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  } as unknown as IssueWithRelations;
}

const DAY = 86_400_000;

describe('sortIssues', () => {
  it('keeps closed issues last in the default status-aware sort', () => {
    const issues = [
      makeIssue({ id: 'closed-new', status: 'closed', updated_at: '2026-06-01T00:00:00Z' }),
      makeIssue({ id: 'open-old', status: 'open', updated_at: '2026-01-01T00:00:00Z' }),
    ];
    const sorted = sortIssues(issues, 'updated-desc', false);
    expect(sorted.map((i) => i.id)).toEqual(['open-old', 'closed-new']);
  });

  it('ignores status when explicit filters are active', () => {
    const issues = [
      makeIssue({ id: 'closed-new', status: 'closed', updated_at: '2026-06-01T00:00:00Z' }),
      makeIssue({ id: 'open-old', status: 'open', updated_at: '2026-01-01T00:00:00Z' }),
    ];
    const sorted = sortIssues(issues, 'updated-desc', true);
    expect(sorted.map((i) => i.id)).toEqual(['closed-new', 'open-old']);
  });

  it('orders by priority for priority-high', () => {
    const issues = [
      makeIssue({ id: 'low', priority: 'low' }),
      makeIssue({ id: 'urgent', priority: 'urgent' }),
      makeIssue({ id: 'medium', priority: 'medium' }),
    ];
    const sorted = sortIssues(issues, 'priority-high', true);
    expect(sorted.map((i) => i.id)).toEqual(['urgent', 'medium', 'low']);
  });

  it('does not mutate the input array', () => {
    const issues = [makeIssue({ id: 'a' }), makeIssue({ id: 'b' })];
    const before = issues.map((i) => i.id);
    sortIssues(issues, 'priority-high', true);
    expect(issues.map((i) => i.id)).toEqual(before);
  });
});

describe('formatDeadline', () => {
  it('marks past deadlines as overdue', () => {
    expect(formatDeadline(new Date(Date.now() - 2 * DAY))).toContain('overdue');
  });

  it('labels a deadline later today as Today', () => {
    expect(formatDeadline(new Date(Date.now() + DAY / 24))).toBe('Today');
  });

  it('labels a deadline about a day away as Tomorrow', () => {
    expect(formatDeadline(new Date(Date.now() + DAY + DAY / 24))).toBe('Tomorrow');
  });
});

describe('getPriorityColor', () => {
  it('returns the urgent styles for urgent', () => {
    expect(getPriorityColor('urgent')).toBe('text-red-600 bg-red-50 border-red-200');
  });

  it('falls back to muted styles for an unknown priority', () => {
    expect(getPriorityColor('whatever')).toContain('muted');
  });
});
