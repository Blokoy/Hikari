#!/usr/bin/env python3
"""Inspect the JMdict and KANJIDIC JSON source shapes without downloading them."""

import json
import sys
from pathlib import Path
from typing import Any


SOURCE_DIR = Path(__file__).parent / "source"


def find_source(pattern: str) -> Path:
    matches = list(SOURCE_DIR.glob(pattern))
    if not matches:
        raise FileNotFoundError(f"No files matched source pattern: {pattern}")
    if len(matches) > 1:
        chosen = max(matches, key=lambda path: path.stat().st_mtime)
        print(f"Multiple files matched {pattern}; using newest: {chosen.name}")
        return chosen
    return matches[0]


def load_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(
            f"Missing {path.name}. Download the release archive, extract the JSON, "
            f"and place it in {SOURCE_DIR}."
        )
    with path.open(encoding="utf-8") as source_file:
        data = json.load(source_file)
    if not isinstance(data, dict):
        raise ValueError(f"{path.name} must contain a top-level JSON object.")
    return data


def find_jmdict_sample(entries: list[dict[str, Any]], text: str) -> dict[str, Any] | None:
    for entry in entries:
        if any(item.get("text") == text for item in entry.get("kanji", [])):
            return entry
        if any(item.get("text") == text for item in entry.get("kana", [])):
            return entry
    return None


def find_kanjidic_sample(characters: list[dict[str, Any]], literal: str) -> dict[str, Any] | None:
    return next(
        (character for character in characters if character.get("literal") == literal),
        None,
    )


def print_source_summary(name: str, data: dict[str, Any], entries_key: str, sample: Any) -> None:
    entries = data.get(entries_key)
    if not isinstance(entries, list):
        raise ValueError(f"{name} does not contain a list at top-level key {entries_key!r}.")
    print(f"{name}")
    print(f"  top-level keys: {', '.join(data.keys())}")
    print(f"  entry count: {len(entries)}")
    print(f"  sample entry: {json.dumps(sample, ensure_ascii=False, indent=2)}")


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    jmdict = load_json(find_source("jmdict-eng*.json"))
    kanjidic = load_json(find_source("kanjidic2-en*.json"))
    jmdict_entries = jmdict.get("words", [])
    kanjidic_entries = kanjidic.get("characters", [])
    if not isinstance(jmdict_entries, list) or not isinstance(kanjidic_entries, list):
        raise ValueError("Unexpected source shape: entries/characters must be lists.")
    jmdict_sample = find_jmdict_sample(jmdict_entries, "駅")
    kanjidic_sample = find_kanjidic_sample(kanjidic_entries, "駅")
    if jmdict_sample is None:
        raise ValueError("Could not find 駅 in the JMdict entries.")
    if kanjidic_sample is None:
        raise ValueError("Could not find 駅 in the KANJIDIC characters.")

    print_source_summary(
        "JMdict English",
        jmdict,
        "words",
        jmdict_sample,
    )
    print_source_summary(
        "KANJIDIC English",
        kanjidic,
        "characters",
        kanjidic_sample,
    )


if __name__ == "__main__":
    try:
        main()
    except (FileNotFoundError, ValueError) as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1)
