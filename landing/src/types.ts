export type AssignmentStatus = "done" | "late" | "missing";

export type Assignment = {
  title: string;
  status: AssignmentStatus | (string & {});
};

export type Student = {
  firstName: string;
  pizzaSlices: number;
  assignments: Assignment[];
};

export type LinkIcon = "github" | "telegram" | "site";

export type UsefulLink = {
  label: string;
  href: string;
  hint?: string;
  icon?: LinkIcon;
};

export type Bootcamp = {
  name: string;
  cohort: string;
  assignmentCount: number;
};

export type BoardData = {
  bootcamp?: Bootcamp;
  links: UsefulLink[];
  students: Student[];
};

export function isBoardData(value: unknown): value is BoardData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Partial<BoardData>;
  return Array.isArray(data.links) && Array.isArray(data.students);
}
