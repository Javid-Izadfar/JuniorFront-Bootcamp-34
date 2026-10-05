import { useEffect, useState } from "react";
import { iconForLink, LinkIcon } from "./components/LinkIcon.tsx";
import { StudentCard } from "./components/StudentCard.tsx";
import { isBoardData, type BoardData } from "./types.ts";

export function App() {
  const [data, setData] = useState<BoardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data.json`);
        if (!response.ok) {
          throw new Error(`Could not load data.json (${response.status}).`);
        }

        const next: unknown = await response.json();
        if (!isBoardData(next)) {
          throw new Error("data.json is missing students or links.");
        }

        if (!cancelled) {
          setData(next);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load the bootcamp board.",
          );
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const assignmentCount = data?.bootcamp?.assignmentCount ?? 38;

  return (
    <div className="wrap">
      <header className="site-header">
        <p className="kicker">
          <a href="https://codingfront.dev/">CodingFront</a>
          <span>Junior Front-End Developer</span>
        </p>
        <h1>CF34</h1>
        <p className="lede">
          This board belongs to CodingFront. It tracks who owes pizza, and where
          the latest assignments stand.
        </p>
      </header>

      <main>
        <section className="roster-section" aria-labelledby="roster-heading">
          <h2 id="roster-heading">Students</h2>
          <div className="roster">
            {(data?.students ?? []).map((student) => (
              <StudentCard
                key={student.firstName}
                student={student}
                assignmentCount={assignmentCount}
              />
            ))}
          </div>
        </section>

        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}

        <section className="links-section" aria-labelledby="links-heading">
          <h2 id="links-heading">Useful links</h2>
          <ul className="links">
            {(data?.links ?? []).map((link) => (
              <li key={link.href}>
                <a
                  className="link-card"
                  href={link.href || "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="link-icon">
                    <LinkIcon name={iconForLink(link.href, link.icon)} />
                  </span>
                  <span className="link-copy">
                    <span className="link-label">{link.label || "Link"}</span>
                    <span className="link-hint">{link.hint ?? ""}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
