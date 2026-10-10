import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Student } from "../types.ts";
import { Dialog } from "./Dialog.tsx";

type GroupDialogProps = {
  open: boolean;
  students: Student[];
  onClose: () => void;
};

type Person = {
  id: string;
  name: string;
};

const DEFAULT_GROUP_COUNT = 4;
const FLIP_MS = 450;

function peopleFrom(students: Student[]): Person[] {
  return students.map((student, index) => ({
    id: `${student.firstName || "Student"}-${index}`,
    name: student.firstName || "Student",
  }));
}

function defaultGroupCount(studentCount: number) {
  if (studentCount < 2) return DEFAULT_GROUP_COUNT;
  return Math.min(DEFAULT_GROUP_COUNT, studentCount);
}

function clampGroupCount(value: number, studentCount: number) {
  if (!Number.isFinite(value)) return Math.min(DEFAULT_GROUP_COUNT, studentCount);
  return Math.min(studentCount, Math.max(2, Math.round(value)));
}

function shuffle<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [next[index], next[swap]] = [next[swap], next[index]];
  }
  return next;
}

function deal(people: readonly Person[], count: number): Person[][] {
  const groups = Array.from({ length: count }, () => [] as Person[]);
  shuffle(people).forEach((person, index) => {
    groups[index % count].push(person);
  });
  return groups;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function GroupIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="7.5" cy="8" r="2.25" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.5" cy="8" r="2.25" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M3.2 18.2c.5-2.3 2.2-3.6 4.3-3.6s3.8 1.3 4.3 3.6M12.2 18.2c.5-2.3 2.2-3.6 4.3-3.6s3.8 1.3 4.3 3.6"
      />
    </svg>
  );
}

export function GroupDialog({ open, students, onClose }: GroupDialogProps) {
  const groupButtonRef = useRef<HTMLButtonElement>(null);
  const chipRefs = useRef(new Map<string, HTMLLIElement>());
  const beforeRef = useRef<Map<string, DOMRect> | null>(null);
  const [countInput, setCountInput] = useState(String(DEFAULT_GROUP_COUNT));
  const [groups, setGroups] = useState<Person[][] | null>(null);
  const [seenOpen, setSeenOpen] = useState(open);

  if (open !== seenOpen) {
    setSeenOpen(open);
    if (open) {
      beforeRef.current = null;
      setGroups(null);
      setCountInput(String(defaultGroupCount(students.length)));
    }
  }

  const people = peopleFrom(students);
  const canGroup = people.length >= 2;

  useEffect(() => {
    if (!open) return;
    groupButtonRef.current?.focus();
  }, [open]);

  useLayoutEffect(() => {
    const before = beforeRef.current;
    if (!before || prefersReducedMotion()) {
      beforeRef.current = null;
      return;
    }

    const animations: Animation[] = [];

    for (const [id, el] of chipRefs.current) {
      if (!el.isConnected) continue;
      const first = before.get(id);
      if (!first) continue;

      const last = el.getBoundingClientRect();
      const dx = first.left - last.left;
      const dy = first.top - last.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;

      animations.push(
        el.animate(
          [
            { transform: `translate(${dx}px, ${dy}px)` },
            { transform: "translate(0, 0)" },
          ],
          { duration: FLIP_MS, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
        ),
      );
    }

    return () => {
      for (const animation of animations) animation.cancel();
    };
  }, [groups]);

  function setChipRef(id: string) {
    return (el: HTMLLIElement | null) => {
      if (el) chipRefs.current.set(id, el);
    };
  }

  function capture() {
    const rects = new Map<string, DOMRect>();
    for (const [id, el] of chipRefs.current) {
      if (!el.isConnected) {
        chipRefs.current.delete(id);
        continue;
      }
      rects.set(id, el.getBoundingClientRect());
    }
    return rects;
  }

  function handleGroup() {
    if (!canGroup) return;
    const nextCount = clampGroupCount(Number(countInput), people.length);
    setCountInput(String(nextCount));
    beforeRef.current = capture();
    setGroups(deal(people, nextCount));
  }

  return (
    <Dialog
      open={open}
      title="Groups"
      onClose={onClose}
      className="group-dialog"
    >
      {people.length === 0 ? (
        <p className="empty-note">No students to group.</p>
      ) : groups ? (
        <div className="group-columns">
          {groups.map((group, index) => (
            <section key={index} className="group-column" aria-label={`Group ${index + 1}`}>
              <h3>Group {index + 1}</h3>
              <ul>
                {group.map((person) => (
                  <li key={person.id} ref={setChipRef(person.id)} className="name-chip">
                    {person.name}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="name-list">
          {people.map((person) => (
            <li key={person.id} ref={setChipRef(person.id)} className="name-chip">
              {person.name}
            </li>
          ))}
        </ul>
      )}
      <form
        className="group-dialog-controls"
        onSubmit={(event) => {
          event.preventDefault();
          handleGroup();
        }}
      >
        <label className="group-count">
          Count
          <input
            type="number"
            inputMode="numeric"
            min={2}
            max={Math.max(people.length, 2)}
            value={countInput}
            disabled={!canGroup}
            onChange={(event) => setCountInput(event.target.value)}
          />
        </label>
        <button
          ref={groupButtonRef}
          type="submit"
          className="group-action"
          disabled={!canGroup}
        >
          Group
        </button>
      </form>
    </Dialog>
  );
}
