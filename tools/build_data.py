#!/usr/bin/env python3
"""Build compact Hikari data files from the curated N5 source files."""

import json
import sys
from pathlib import Path
from typing import Any


TOOLS_DIR = Path(__file__).parent
SOURCE_DIR = TOOLS_DIR / "source"
DATA_DIR = TOOLS_DIR.parent / "data"

VOCAB_SOURCE = SOURCE_DIR / "n5-vocab.json"
KANJI_SOURCE = SOURCE_DIR / "n5-kanji.json"
VOCAB_OUTPUT = DATA_DIR / "vocab.json"
KANJI_OUTPUT = DATA_DIR / "kanji.json"

VOCAB_FIELDS = (
    "id",
    "word",
    "reading",
    "romaji",
    "meanings",
    "pos",
    "jmdict_id",
    "other_forms",
    "other_readings",
    "examples",
)
KANJI_FIELDS = (
    "character",
    "strokes",
    "grade",
    "freq",
    "radical",
    "onyomi",
    "kunyomi",
    "meanings",
    "words",
    "supplementary",
)


def load_array(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        raise FileNotFoundError(f"Missing input file: {path}")
    with path.open(encoding="utf-8") as source_file:
        data = json.load(source_file)
    if not isinstance(data, list) or not all(isinstance(item, dict) for item in data):
        raise ValueError(f"{path.name} must contain an array of objects.")
    return data


def select_fields(entries: list[dict[str, Any]], fields: tuple[str, ...]) -> list[dict[str, Any]]:
    return [{field: entry[field] for field in fields if field in entry} for entry in entries]


def write_json(path: Path, data: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as output_file:
        json.dump(data, output_file, ensure_ascii=False, separators=(",", ":"))


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    vocab = select_fields(load_array(VOCAB_SOURCE), VOCAB_FIELDS)
    kanji = select_fields(load_array(KANJI_SOURCE), KANJI_FIELDS)
    write_json(VOCAB_OUTPUT, vocab)
    write_json(KANJI_OUTPUT, kanji)
    print(f"Wrote {len(vocab)} vocabulary entries to {VOCAB_OUTPUT} ({VOCAB_OUTPUT.stat().st_size} bytes)")
    print(f"Wrote {len(kanji)} kanji entries to {KANJI_OUTPUT} ({KANJI_OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    try:
        main()
    except (FileNotFoundError, KeyError, ValueError) as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1)
