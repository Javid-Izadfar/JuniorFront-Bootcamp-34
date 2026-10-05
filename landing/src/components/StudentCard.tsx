import type { Student } from "../types.ts";
import { Assignments } from "./Assignments.tsx";
import { Pizza } from "./Pizza.tsx";

type StudentCardProps = {
  student: Student;
  assignmentCount: number;
};

export function StudentCard({ student, assignmentCount }: StudentCardProps) {
  return (
    <article className="card">
      <h3>{student.firstName || "Student"}</h3>
      <Pizza slices={student.pizzaSlices} />
      <Assignments
        assignments={student.assignments || []}
        assignmentCount={assignmentCount}
      />
    </article>
  );
}
