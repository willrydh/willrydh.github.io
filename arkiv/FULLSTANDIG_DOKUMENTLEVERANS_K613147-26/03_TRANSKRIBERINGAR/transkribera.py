#!/usr/bin/env python3
import argparse
import json
import re
import sys
import time
from pathlib import Path

from faster_whisper import WhisperModel


INITIAL_PROMPT = (
    "Intervju på svenska med Borås Tidning. Namn och begrepp som kan förekomma: "
    "William Rydh, Borås Tidning, Nordic Digitalization, eRocket, Adwisemedia, "
    "Muna Ilja, Matilda, Johan, Davor, Fortnox, Telavox."
)


def timestamp(seconds: float, srt: bool = False) -> str:
    millis = round(seconds * 1000)
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    separator = "," if srt else "."
    return f"{hours:02d}:{minutes:02d}:{secs:02d}{separator}{millis:03d}"


def safe_stem(path: Path) -> str:
    return re.sub(r'[<>:"/\\|?*]+', "_", path.stem).strip()


def transcribe(model: WhisperModel, audio_path: Path, output_dir: Path) -> None:
    stem = safe_stem(audio_path)
    jsonl_path = output_dir / f"{stem}.segment.jsonl"
    markdown_path = output_dir / f"{stem}.transkript.md"
    srt_path = output_dir / f"{stem}.srt"

    started = time.time()
    segments, info = model.transcribe(
        str(audio_path),
        language="sv",
        beam_size=1,
        best_of=1,
        temperature=0,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 500},
        condition_on_previous_text=True,
        initial_prompt=INITIAL_PROMPT,
        word_timestamps=False,
    )

    header = (
        f"# Maskintranskript: {audio_path.name}\n\n"
        f"- Originalfil: `{audio_path}`\n"
        f"- Språk: svenska\n"
        f"- Modell: large-v3-turbo, int8\n"
        f"- Tidskoder: segmentnivå\n"
        f"- Viktigt: Kontrollera mot originalljudet innan ordagranna citat används.\n\n"
    )

    with (
        jsonl_path.open("w", encoding="utf-8") as jsonl,
        markdown_path.open("w", encoding="utf-8") as markdown,
        srt_path.open("w", encoding="utf-8") as srt,
    ):
        markdown.write(header)
        for index, segment in enumerate(segments, start=1):
            text = segment.text.strip()
            record = {
                "index": index,
                "start": round(segment.start, 3),
                "end": round(segment.end, 3),
                "text": text,
                "avg_logprob": segment.avg_logprob,
                "no_speech_prob": segment.no_speech_prob,
            }
            jsonl.write(json.dumps(record, ensure_ascii=False) + "\n")
            jsonl.flush()

            markdown.write(
                f"**[{timestamp(segment.start)} - {timestamp(segment.end)}]** "
                f"{text}\n\n"
            )
            markdown.flush()

            srt.write(
                f"{index}\n"
                f"{timestamp(segment.start, srt=True)} --> "
                f"{timestamp(segment.end, srt=True)}\n"
                f"{text}\n\n"
            )
            srt.flush()

            if index % 25 == 0:
                elapsed = time.time() - started
                print(
                    f"{audio_path.name}: segment {index}, "
                    f"ljudtid {timestamp(segment.end)}, körtid {timestamp(elapsed)}",
                    flush=True,
                )

    elapsed = time.time() - started
    print(
        f"KLAR: {audio_path.name}, uppskattad längd "
        f"{timestamp(info.duration)}, körtid {timestamp(elapsed)}",
        flush=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("audio", nargs="+", type=Path)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--cpu-threads", type=int, default=12)
    args = parser.parse_args()

    args.output_dir.mkdir(parents=True, exist_ok=True)
    missing = [path for path in args.audio if not path.is_file()]
    if missing:
        for path in missing:
            print(f"Saknad fil: {path}", file=sys.stderr)
        raise SystemExit(1)

    model = WhisperModel(
        "large-v3-turbo",
        device="cpu",
        compute_type="int8",
        cpu_threads=args.cpu_threads,
        num_workers=1,
    )
    for audio_path in args.audio:
        transcribe(model, audio_path, args.output_dir)


if __name__ == "__main__":
    main()
