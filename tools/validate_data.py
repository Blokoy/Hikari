#!/usr/bin/env python3
"""Validate generated N5 data against the ignored JMdict and KANJIDIC sources."""

import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any


TOOLS_DIR = Path(__file__).parent
SOURCE_DIR = TOOLS_DIR / "source"
DATA_DIR = TOOLS_DIR.parent / "data"


def find_source(pattern: str) -> Path:
    matches = list(SOURCE_DIR.glob(pattern))
    if not matches:
        raise FileNotFoundError(f"No files matched source pattern: {pattern}")
    if len(matches) > 1:
        return max(matches, key=lambda path: path.stat().st_mtime)
    return matches[0]


def load_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as source_file:
        return json.load(source_file)


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    vocab = load_json(DATA_DIR / "vocab.json")
    kanji = load_json(DATA_DIR / "kanji.json")
    jmdict = load_json(find_source("jmdict-eng*.json"))
    kanjidic = load_json(find_source("kanjidic2-en*.json"))
    words = {str(entry.get("id")): entry for entry in jmdict.get("words", [])}
    characters = {entry.get("literal") for entry in kanjidic.get("characters", [])}
    shared_ids: dict[str, list[int]] = defaultdict(list)

    for index, entry in enumerate(vocab):
        jmdict_id = str(entry.get("jmdict_id"))
        shared_ids[jmdict_id].append(index)
        source_entry = words.get(jmdict_id)
        if source_entry is None:
            print(f"VOCAB MISMATCH: index {index}, word {entry.get('word')!r}: jmdict_id {jmdict_id} not found")
            continue
        readings = {kana.get("text") for kana in source_entry.get("kana", [])}
        if entry.get("reading") not in readings:
            print(
                f"VOCAB MISMATCH: index {index}, word {entry.get('word')!r}, "
                f"jmdict_id {jmdict_id}: reading {entry.get('reading')!r} not in {sorted(readings)!r}"
            )

    for index, entry in enumerate(kanji):
        if entry.get("character") not in characters:
            print(f"KANJI MISMATCH: index {index}, character {entry.get('character')!r} not found")

    for jmdict_id, indexes in shared_ids.items():
        if len(indexes) > 1:
            print(f"SHARED JMdict ID: {jmdict_id} used by vocab indexes {indexes}")


if __name__ == "__main__":
    try:
        main()
    except (FileNotFoundError, KeyError, TypeError, ValueError) as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1)
