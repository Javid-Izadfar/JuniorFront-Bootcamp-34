---
name: import-assignment
description: >-
  Unpack a folder of student assignment archives (zip, rar, or loose HTML)
  into eNN/first-name folders for the CF34 bootcamp repo. Use when the user
  adds an assignment, imports submissions, unpacks student zips or rars, or
  mentions e01, e02, or an exercise inbox.
---

# Import assignment

Unpack one exercise into `eNN/<first-name>/`. Student slugs come from `firstName` in `landing/public/data.json`. The Pages workflow publishes only `landing/`; do not copy the assignment into that build.

Do not commit or push unless the user asks.

## Workflow

1. Get the assignment id (`e02`) and the inbox directory. Use the path the user gives. A typical inbox is `/Users/jay/Personal/CF/SNN`.
2. Dry-run from the repo root:

```bash
python3 .cursor/skills/import-assignment/scripts/import_assignment.py \
  --assignment e02 \
  --source /path/to/inbox \
  --dry-run
```

3. If the script exits 2, it found an archive that matches nobody or more than one student. Show that list and ask. Rerun with one `--map student=filename` per decision. `--map` can be repeated.
4. Run the same command without `--dry-run`. If that assignment folder already exists, pass `--force` only after the user agrees to replace it.
5. Report the per-student file counts and any missing local image or stylesheet refs. Leave broken student HTML unchanged.

A student with no file is a missing submission, not an error. Do not create an empty folder for them.

## What the script preserves

- Original HTML and asset filenames, including spaces and names like `Crêpes.jpg`.
- Inner folders the page already uses (`fonts/`, `img/`, `assets/`).
- A loose `.html` file keeps its own filename.

It drops `__MACOSX`, `.DS_Store`, and AppleDouble `._*` files, and it removes a shared outer wrapper directory only while every remaining file is still inside that one directory.

## Overrides

```bash
python3 .cursor/skills/import-assignment/scripts/import_assignment.py \
  --assignment e02 \
  --source /path/to/inbox \
  --map sina=tm1.zip \
  --map amin=amin_alirezay.zip
```
