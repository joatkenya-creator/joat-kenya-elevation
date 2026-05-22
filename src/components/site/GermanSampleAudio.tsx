import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const SAMPLE_TEXT =
  "Wir müssen unseren Vertrieb in der Küstenregion vor der Urlaubssaison ausbauen.";

/**
 * Renders the German recording sample as a real playable clip using the browser's
 * Web Speech API (speechSynthesis). No audio file ships — every modern browser has
 * a built-in German TTS voice it can use.
 */
export function GermanSampleAudio() {
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggle = () => {
    if (!supported) return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(SAMPLE_TEXT);
    utter.lang = "de-DE";
    utter.rate = 0.95;
    utter.onend = () => setPlaying(false);
    utter.onerror = () => setPlaying(false);

    // Prefer a real German voice if the browser exposes one
    const voices = window.speechSynthesis.getVoices();
    const germanVoice =
      voices.find((v) => v.lang.toLowerCase().startsWith("de") && v.localService) ??
      voices.find((v) => v.lang.toLowerCase().startsWith("de"));
    if (germanVoice) utter.voice = germanVoice;

    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
    setPlaying(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!supported}
      aria-label={playing ? "Stop German sample playback" : "Play German sample"}
      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-(--joat-red)/15 text-(--joat-red) hover:bg-(--joat-red)/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      title={
        supported
          ? "Play the German sample using your browser's built-in voice"
          : "Speech synthesis isn't available in this browser"
      }
    >
      {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-px" />}
    </button>
  );
}
