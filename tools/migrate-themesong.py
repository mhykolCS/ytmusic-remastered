#!/usr/bin/env python3
"""Read ThemeSong's small Chrome LevelDB journal without opening/locking the DB.

Only allowlisted preference keys are exported. The original database is untouched.
This intentionally refuses compacted SST databases instead of exporting stale data.
Run before the first install, then build. Output must remain local and untracked.
"""
import argparse
import json
import os
import struct
from pathlib import Path

KEYS = {"themePrefs", "visualizerPrefs", "popupPrefs", "extensionPrefs", "piecePrefs", "utilitiesPrefs"}


def varint(buf, pos):
    value = 0
    for shift in range(0, 35, 7):
        byte = buf[pos]
        pos += 1
        value |= (byte & 127) << shift
        if not byte & 128:
            return value, pos
    raise ValueError("Invalid LevelDB length")


def records(data):
    pending = b""
    for start in range(0, len(data), 32768):
        block = data[start:start + 32768]
        pos = 0
        while pos + 7 <= len(block):
            _, size, kind = struct.unpack_from("<IHB", block, pos)
            pos += 7
            if kind == 0 or pos + size > len(block):
                break  # Padding, or an unflushed trailing write.
            chunk = block[pos:pos + size]
            pos += size
            if kind == 1:
                yield chunk
            elif kind == 2:
                pending = chunk
            elif kind == 3:
                pending += chunk
            elif kind == 4:
                yield pending + chunk
                pending = b""


def read_preferences(directory):
    if list(directory.glob("*.ldb")) or list(directory.glob("*.sst")):
        raise SystemExit("Compacted database: this journal-only migration cannot safely read it.")
    values = {}
    for path in sorted(directory.glob("*.log")):
        for record in records(path.read_bytes()):
            if len(record) < 12:
                continue
            sequence, count = struct.unpack_from("<QI", record)
            pos = 12
            for index in range(count):
                operation = record[pos]
                pos += 1
                size, pos = varint(record, pos)
                key = record[pos:pos + size].decode("utf8")
                pos += size
                if operation == 1:
                    size, pos = varint(record, pos)
                    value = record[pos:pos + size]
                    pos += size
                elif operation == 0:
                    value = None
                else:
                    raise ValueError("Unknown LevelDB operation")
                if key in KEYS and sequence + index > values.get(key, (-1, None))[0]:
                    values[key] = (sequence + index, value)
    result = {key: json.loads(value) for key, (_, value) in values.items() if value is not None}
    if not result:
        raise SystemExit("No ThemeSong preferences found; no file written.")
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--profile", type=Path, default=Path.home() / ".config/google-chrome/Default")
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "local/install-preferences.json")
    args = parser.parse_args()
    preferences = read_preferences(args.profile / "Local Extension Settings/bgfiegdbajagebogifobkhambpljbfmk")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(args.output, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as file:
        json.dump(preferences, file, indent=2)
        file.write("\n")
    print(f"Saved {len(preferences)} preference groups to {args.output}; no media/history exported.")
