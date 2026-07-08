#!/usr/bin/env python3
from pathlib import Path

from faster_whisper import WhisperModel


OUTPUT_DIR = Path(__file__).resolve().parent / "Kontrollavsnitt"
LONG_AUDIO = Path("/Users/williamrydh/Downloads/Borås Tidning Intervju 2022-11-16 .m4a")
UNCUT_AUDIO = Path("/Users/williamrydh/Downloads/2022-11-16 : Borås Tidning intervju - Oklippt.m4a")

CLIPS = [
    ("A_fore_intervjun_provmanad_bindningstid", LONG_AUDIO, 9 * 60 + 45, 18 * 60 + 30),
    ("B_storyn_och_extern_aktor", UNCUT_AUDIO, 35 * 60 + 45, 38 * 60),
    ("C_kunduppgifter_och_skaderisk", UNCUT_AUDIO, 45 * 60 + 35, 49 * 60 + 20),
    ("D_missforstatt_hela_skiten_och_ansvar", UNCUT_AUDIO, 70 * 60 + 25, 72 * 60 + 25),
    ("E_yttersta_ansvar_och_saljchef", UNCUT_AUDIO, 78 * 60 + 25, 81 * 60 + 50),
    ("F_avtal_och_tagit_ansvar", UNCUT_AUDIO, 83 * 60 + 25, 84 * 60 + 35),
    ("G_externt_saljbolag_och_artikelrisk", UNCUT_AUDIO, 109 * 60 + 10, 111 * 60 + 40),
]

INITIAL_PROMPT = (
    "Svensk intervju med Borås Tidning. Talare: William Rydh, Matilda Spetz, "
    "Johan Valkonen. Begrepp: Nordic Digitalization, eRocket, Muna Ilja, "
    "bindningstid, provmånad, gratismånad, prestationsbaserad, BankID, säljbolag."
)


def timestamp(seconds: float) -> str:
    millis = round(seconds * 1000)
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    model = WhisperModel(
        "large-v3-turbo",
        device="cpu",
        compute_type="int8",
        cpu_threads=12,
        num_workers=1,
    )

    for name, source, start, end in CLIPS[2:]:
        segments, _ = model.transcribe(
            str(source),
            language="sv",
            beam_size=5,
            best_of=5,
            temperature=0,
            vad_filter=True,
            vad_parameters={"min_silence_duration_ms": 300},
            condition_on_previous_text=False,
            initial_prompt=INITIAL_PROMPT,
            word_timestamps=True,
            clip_timestamps=[start, end],
        )

        output_path = OUTPUT_DIR / f"{name}.md"
        with output_path.open("w", encoding="utf-8") as output:
            output.write(f"# Kontrolltranskript: {name}\n\n")
            output.write(f"- Originalfil: `{source}`\n")
            output.write(f"- Kontrollintervall: `{timestamp(start)} - {timestamp(end)}`\n")
            output.write("- Modell: large-v3-turbo, beam 5, ordtidskoder\n")
            output.write("- Kontrollera fortfarande ordagranna citat mot originalljudet.\n\n")
            for segment in segments:
                output.write(
                    f"**[{timestamp(segment.start)} - {timestamp(segment.end)}]** "
                    f"{segment.text.strip()}\n\n"
                )

        print(f"KLAR: {name}", flush=True)


if __name__ == "__main__":
    main()
