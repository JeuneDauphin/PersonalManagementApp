import type { ProjectStatus } from './types/types';

// Determine the effective UI status for a project based on its saved status and current progress
// Rule: if saved status is 'completed' but progress < 100, treat it as 'active' for UI purposes
export function effectiveProjectStatus(status: ProjectStatus, progress: number): ProjectStatus {
  if (status === 'completed' && (progress ?? 0) < 100) return 'active';
  return status;
}

// Helper: consider a project effectively completed only when both conditions are met
export function isProjectEffectivelyCompleted(status: ProjectStatus, progress: number): boolean {
  return status === 'completed' && (progress ?? 0) === 100;
}
