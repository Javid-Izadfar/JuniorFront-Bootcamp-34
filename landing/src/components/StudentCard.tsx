import type { Student } from "../types.ts";
import { SLICES_PER_PIZZA } from "../pizza.ts";
import { Assignments } from "./Assignments.tsx";
import { Pizza } from "./Pizza.tsx";

type StudentCardProps = {
  student: Student;
  assignmentCount: number;
};

export function StudentCard({ student, assignmentCount }: StudentCardProps) {
  const slices = Number.isFinite(student.pizzaSlices) ? student.pizzaSlices : 0;
  const canCashIn = Math.floor(slices / SLICES_PER_PIZZA) > 0;

  return (
    <article className="card">
      <h3>
        {canCashIn ? <span className="cash-in" title="Pizza to cash in" /> : null}
        {student.firstName || "Student"}
      </h3>
      <Pizza slices={student.pizzaSlices} />
      <Assignments
        assignments={student.assignments || []}
        assignmentCount={assignmentCount}
      />
    </article>
  );
}
