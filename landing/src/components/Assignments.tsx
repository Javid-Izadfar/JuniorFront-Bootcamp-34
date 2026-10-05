import { useState } from "react";
import type { Assignment, AssignmentStatus } from "../types.ts";

const LATEST_COUNT = 3;

const STATUS_LABELS: Record<AssignmentStatus, string> = {
  done: "Done",
  late: "Late",
  missing: "Missing",
};

function isKnownStatus(status: string): status is AssignmentStatus {
  return status in STATUS_LABELS;
}

function AssignmentRow({
  assignment,
  number,
}: {
  assignment: Assignment;
  number: number;
}) {
  const statusKey = String(assignment.status || "").toLowerCase();
  const known = isKnownStatus(statusKey);

  return (
    <li className="assignment">
      <span className="assignment-title">
        <span className="assignment-number">{String(number).padStart(2, "0")}</span>
        <span>{assignment.title || `Assignment ${number}`}</span>
      </span>
      <span className={`pill ${known ? statusKey : "unknown"}`}>
        {known ? STATUS_LABELS[statusKey] : assignment.status || "Unknown"}
      </span>
    </li>
  );
}

type AssignmentsProps = {
  assignments: Assignment[];
  assignmentCount: number;
};

export function Assignments({ assignments, assignmentCount }: AssignmentsProps) {
  const [expanded, setExpanded] = useState(false);
  const latestFirst = assignments.map((assignment, index) => ({
    assignment,
    number: index + 1,
  })).reverse();
  const visible = expanded ? latestFirst : latestFirst.slice(0, LATEST_COUNT);

  return (
    <section className="assignments">
      <h4>
        Assignments
        <span> of {assignmentCount}</span>
      </h4>
      {latestFirst.length === 0 ? (
        <p className="empty-note">No assignments yet.</p>
      ) : (
        <ul className="assignment-list">
          {visible.map(({ assignment, number }) => (
            <AssignmentRow key={number} assignment={assignment} number={number} />
          ))}
        </ul>
      )}
      {latestFirst.length > LATEST_COUNT ? (
        <button
          type="button"
          className="more"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Show less" : "See more"}
        </button>
      ) : null}
    </section>
  );
}
