#!/usr/bin/env python3
"""Unpack student assignment archives into eNN/<first-name>/ folders."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

JUNK_NAMES = {"__MACOSX", ".DS_Store"}
ARCHIVE_SUFFIXES = {".zip", ".rar"}
HTML_SUFFIXES = {".html", ".htm"}
TOKEN_RE = re.compile(r"[^A-Za-z]+")
ASSIGNMENT_RE = re.compile(r"^e\d{2}$")
REF_RE = re.compile(
    r"""(?:src|href)\s*=\s*["']([^"']*)["']|url\(\s*['"]?([^'")]+)['"]?\s*\)""",
    re.IGNORECASE,
)


def student_slugs(data_path: Path) -> list[str]:
    data = json.loads(data_path.read_text(encoding="utf-8"))
    students = data.get("students")
    if not isinstance(students, list):
        raise SystemExit(f"{data_path} has no students array")
    slugs: list[str] = []
    for student in students:
        if not isinstance(student, dict) or not student.get("firstName"):
            raise SystemExit(f"{data_path} has a student without firstName")
        slug = str(student["firstName"]).strip().lower().replace(" ", "-")
        if slug in slugs:
            raise SystemExit(f"Duplicate student slug: {slug}")
        slugs.append(slug)
    return slugs


def tokens(name: str) -> list[str]:
    return [token.lower() for token in TOKEN_RE.split(name) if token]


def match_name(name: str, slugs: list[str]) -> tuple[list[str], str]:
    words = tokens(Path(name).stem if Path(name).suffix else name)
    exact = [slug for slug in slugs if slug in words]
    if len(exact) == 1:
        return exact, "exact"
    if len(exact) > 1:
        return exact, "ambiguous"
    prefix = [
        slug
        for slug in slugs
        if any(word.startswith(slug) and word != slug for word in words)
    ]
    if len(prefix) == 1:
        return prefix, "prefix"
    if len(prefix) > 1:
        return prefix, "ambiguous"
    return [], "none"


def should_skip(relative: str) -> bool:
    parts = Path(relative).parts
    return any(
        part in JUNK_NAMES or part.startswith("._") or part == ""
        for part in parts
    )


def safe_relative(relative: str) -> str:
    path = Path(relative)
    if path.is_absolute() or ".." in path.parts:
        raise SystemExit(f"Unsafe archive path: {relative}")
    return path.as_posix()


def strip_common_roots(files: dict[str, Path]) -> dict[str, Path]:
    current = files
    while current:
        tops = {Path(name).parts[0] for name in current}
        if len(tops) != 1 or any(len(Path(name).parts) == 1 for name in current):
            break
        stripped: dict[str, Path] = {}
        for name, source in current.items():
            relative = safe_relative(str(Path(*Path(name).parts[1:])))
            stripped[relative] = source
        current = stripped
    return current


def collect_zip(archive: Path, temp: Path) -> dict[str, Path]:
    files: dict[str, Path] = {}
    with zipfile.ZipFile(archive) as zipped:
        for info in zipped.infolist():
            name = info.filename.replace("\\", "/")
            if name.endswith("/") or should_skip(name):
                continue
            relative = safe_relative(name)
            target = temp / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(zipped.read(info))
            files[relative] = target
    return files


def collect_rar(archive: Path, temp: Path) -> dict[str, Path]:
    if shutil.which("bsdtar") is None:
        raise SystemExit("bsdtar is required to unpack .rar files")
    subprocess.check_call(
        ["bsdtar", "-xf", str(archive), "-C", str(temp)],
        stdout=subprocess.DEVNULL,
    )
    files: dict[str, Path] = {}
    for path in temp.rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(temp).as_posix()
        if should_skip(relative):
            continue
        files[safe_relative(relative)] = path
    return files


def member_names(archive: Path) -> list[str]:
    if archive.suffix.lower() == ".zip":
        with zipfile.ZipFile(archive) as zipped:
            return [
                info.filename.replace("\\", "/")
                for info in zipped.infolist()
                if not info.filename.endswith("/")
            ]
    listing = subprocess.check_output(
        ["bsdtar", "-tf", str(archive)],
        text=True,
        errors="replace",
    )
    return [line.strip() for line in listing.splitlines() if line.strip()]


def match_archive(archive: Path, slugs: list[str]) -> tuple[list[str], str]:
    matched, how = match_name(archive.name, slugs)
    if matched:
        return matched, how
    found: dict[str, str] = {}
    for member in member_names(archive):
        if should_skip(member):
            continue
        member_match, member_how = match_name(Path(member).name, slugs)
        if len(member_match) == 1:
            found[member_match[0]] = member_how
        elif len(member_match) > 1:
            return member_match, "ambiguous"
    if len(found) == 1:
        slug = next(iter(found))
        return [slug], f"inside ({found[slug]})"
    if len(found) > 1:
        return list(found), "ambiguous"
    return [], "none"


def parse_maps(values: list[str], slugs: list[str]) -> dict[str, str]:
    mapping: dict[str, str] = {}
    for value in values:
        if "=" not in value:
            raise SystemExit(f"--map must look like student=filename, got {value}")
        slug, filename = value.split("=", 1)
        slug = slug.strip().lower()
        filename = filename.strip()
        if slug not in slugs:
            raise SystemExit(f"--map student is not on the roster: {slug}")
        if filename in mapping.values():
            raise SystemExit(f"--map uses {filename} more than once")
        mapping[filename] = slug
    return mapping


def source_files(source: Path) -> list[Path]:
    files = []
    for path in sorted(source.iterdir()):
        if not path.is_file() or should_skip(path.name):
            continue
        suffix = path.suffix.lower()
        if suffix in ARCHIVE_SUFFIXES or suffix in HTML_SUFFIXES:
            files.append(path)
    return files


def assign_files(
    files: list[Path], slugs: list[str], manual: dict[str, str]
) -> tuple[dict[str, list[Path]], list[str]]:
    assigned: dict[str, list[Path]] = {slug: [] for slug in slugs}
    problems: list[str] = []
    seen_manual: set[str] = set()
    for path in files:
        if path.name in manual:
            assigned[manual[path.name]].append(path)
            seen_manual.add(path.name)
            continue
        if path.suffix.lower() in HTML_SUFFIXES:
            matched, how = match_name(path.name, slugs)
            label = how
        else:
            matched, how = match_archive(path, slugs)
            label = how
        if len(matched) != 1:
            problems.append(
                f"{path.name}: {label}"
                + (f" ({', '.join(matched)})" if matched else "")
            )
            continue
        assigned[matched[0]].append(path)
        print(f"{matched[0]} <- {path.name} ({label})")
    missing_manual = sorted(set(manual) - seen_manual)
    for filename in missing_manual:
        problems.append(f"--map file not in source: {filename}")
    return assigned, problems


def write_loose_html(path: Path, dest: Path) -> None:
    target = dest / path.name
    if target.exists():
        raise SystemExit(f"Refusing to overwrite {target}")
    shutil.copy2(path, target)


def write_archive(archive: Path, dest: Path) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        temp = Path(tmp)
        suffix = archive.suffix.lower()
        collected = collect_zip(archive, temp) if suffix == ".zip" else collect_rar(archive, temp)
        flattened = strip_common_roots(collected)
        if not flattened:
            raise SystemExit(f"{archive.name} has no files after cleanup")
        for relative, source in flattened.items():
            target = dest / relative
            if target.exists():
                raise SystemExit(f"Refusing to overwrite {target}")
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)


def verify(dest: Path) -> list[str]:
    missing: list[str] = []
    for path in sorted(dest.rglob("*")):
        if path.suffix.lower() not in {".html", ".htm", ".css"}:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for match in REF_RE.finditer(text):
            ref = (match.group(1) if match.group(1) is not None else match.group(2)).strip()
            if not ref or ref.startswith(("#", "http://", "https://", "mailto:", "data:")):
                continue
            clean = ref.split("#", 1)[0].split("?", 1)[0]
            target = (path.parent / clean).resolve()
            try:
                target.relative_to(dest.resolve())
            except ValueError:
                missing.append(f"{path.relative_to(dest)} -> {ref} (outside assignment)")
                continue
            if not target.is_file():
                missing.append(f"{path.relative_to(dest)} -> {ref}")
    return missing


def repo_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / "landing" / "public" / "data.json").is_file():
            return candidate
    raise SystemExit(f"No landing/public/data.json found from {start}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--assignment", required=True, help="Folder name, such as e02")
    parser.add_argument("--source", required=True, type=Path, help="Directory of student archives")
    parser.add_argument("--repo", type=Path, help="Repository root. Defaults to the nearest checkout.")
    parser.add_argument("--dest", type=Path, help="Override the assignment directory. For tests.")
    parser.add_argument("--map", action="append", default=[], help="student=filename override")
    parser.add_argument("--dry-run", action="store_true", help="Print the mapping and write nothing")
    parser.add_argument("--force", action="store_true", help="Replace an existing assignment folder")
    args = parser.parse_args()

    assignment = args.assignment.strip().lower()
    if not ASSIGNMENT_RE.fullmatch(assignment):
        raise SystemExit("--assignment must look like e02")
    if not args.source.is_dir():
        raise SystemExit(f"Source directory not found: {args.source}")

    root = (args.repo or repo_root(Path.cwd())).resolve()
    slugs = student_slugs(root / "landing" / "public" / "data.json")
    manual = parse_maps(args.map, slugs)
    files = source_files(args.source)
    if not files:
        raise SystemExit(f"No zip, rar, or html files in {args.source}")

    print(f"assignment {assignment}")
    assigned, problems = assign_files(files, slugs, manual)
    for filename, slug in sorted(manual.items()):
        print(f"{slug} <- {filename} (map)")

    if problems:
        print("needs a decision:", file=sys.stderr)
        for problem in problems:
            print(f"  {problem}", file=sys.stderr)
        return 2
    unused = [slug for slug, paths in assigned.items() if not paths]
    if unused:
        print("no submission: " + ", ".join(unused))
    if args.dry_run:
        return 0

    dest = (args.dest or (root / assignment)).resolve()
    if dest.exists():
        if not args.force:
            raise SystemExit(f"{dest} already exists. Pass --force to replace it.")
        shutil.rmtree(dest)
    dest.mkdir(parents=True)

    for slug, paths in assigned.items():
        if not paths:
            continue
        student_dir = dest / slug
        student_dir.mkdir()
        for path in paths:
            if path.suffix.lower() in HTML_SUFFIXES:
                write_loose_html(path, student_dir)
            else:
                write_archive(path, student_dir)

    missing = verify(dest)
    for slug in slugs:
        student_dir = dest / slug
        if not student_dir.exists():
            continue
        count = sum(1 for path in student_dir.rglob("*") if path.is_file())
        noun = "file" if count == 1 else "files"
        print(f"{slug}: {count} {noun}")
    if missing:
        print("missing local files:")
        for item in missing:
            print(f"  {item}")
    else:
        print("all local refs resolve")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except subprocess.CalledProcessError as error:
        raise SystemExit(f"Archive command failed: {error}") from error
