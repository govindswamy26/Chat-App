import { useEffect, useRef, useState } from "react";
import { Download, Pause, Play } from "lucide-react";
import { formatDuration } from "../../lib/utils";

const SPEEDS = [1, 1.5, 2];

const bars = [3, 5, 8, 4, 9, 6, 7, 4, 8, 5, 6, 9, 4, 7, 5, 8, 6, 4, 7, 5];

const AudioPlayer = ({ src, duration: metaDuration, isMine, onPlayStart }) => {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [current, setCurrent] = useState(0);
    const [duration, setDuration] = useState(metaDuration || 0);
    const [speedIdx, setSpeedIdx] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return undefined;

        const onTime = () => {
            setCurrent(audio.currentTime);
            setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
        };
        const onMeta = () => setDuration(audio.duration || metaDuration || 0);
        const onEnd = () => {
            setPlaying(false);
            setProgress(0);
            setCurrent(0);
        };

        audio.addEventListener("timeupdate", onTime);
        audio.addEventListener("loadedmetadata", onMeta);
        audio.addEventListener("ended", onEnd);
        return () => {
            audio.removeEventListener("timeupdate", onTime);
            audio.removeEventListener("loadedmetadata", onMeta);
            audio.removeEventListener("ended", onEnd);
        };
    }, [metaDuration]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.playbackRate = SPEEDS[speedIdx];
    }, [speedIdx]);

    const toggle = async () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) {
            audio.pause();
            setPlaying(false);
            return;
        }
        onPlayStart?.(audio);
        try {
            await audio.play();
            setPlaying(true);
        } catch {
            setPlaying(false);
        }
    };

    const seek = (event) => {
        const audio = audioRef.current;
        if (!audio || !audio.duration) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
        audio.currentTime = ratio * audio.duration;
    };

    const cycleSpeed = () => setSpeedIdx((i) => (i + 1) % SPEEDS.length);

    const displayDuration = duration || metaDuration || 0;

    return (
        <div
            className={`min-w-[240px] max-w-[280px] p-3 rounded-2xl ${
                isMine
                    ? "bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] text-white rounded-br-md"
                    : "bg-[var(--color-card)] text-[var(--color-text)] rounded-bl-md shadow-[var(--shadow-sm)]"
            }`}
        >
            <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={toggle}
                    className={`w-10 h-10 shrink-0 rounded-full grid place-items-center ${
                        isMine ? "bg-white/20 hover:bg-white/30" : "bg-[var(--color-primary)]/15 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/25"
                    }`}
                    aria-label={playing ? "Pause voice message" : "Play voice message"}
                >
                    {playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-end gap-[2px] h-8 mb-2 opacity-90" aria-hidden>
                        {bars.map((h, i) => (
                            <span
                                key={i}
                                className={`w-[3px] rounded-full ${playing ? "animate-pulse" : ""} ${isMine ? "bg-white/70" : "bg-[var(--color-primary)]/50"}`}
                                style={{ height: `${h + (playing ? Math.sin(i + current) * 2 : 0)}px` }}
                            />
                        ))}
                    </div>
                    <button type="button" className="w-full h-1.5 rounded-full bg-black/15 overflow-hidden" onClick={seek} aria-label="Seek voice message">
                        <span className={`block h-full rounded-full ${isMine ? "bg-white/90" : "bg-[var(--color-primary)]"}`} style={{ width: `${progress}%` }} />
                    </button>
                    <div className={`flex justify-between text-[11px] mt-1.5 ${isMine ? "text-white/80" : "text-[var(--color-muted)]"}`}>
                        <span>{formatDuration(current || 0)}</span>
                        <span>{formatDuration(displayDuration)}</span>
                    </div>
                </div>
            </div>
            <div className={`flex items-center gap-2 mt-2 pt-2 border-t ${isMine ? "border-white/15" : "border-[var(--color-border)]"}`}>
                <button
                    type="button"
                    onClick={cycleSpeed}
                    className={`text-[11px] font-semibold px-2 py-1 rounded-md ${isMine ? "bg-white/15" : "bg-[var(--color-bg-elevated)]"}`}
                >
                    {SPEEDS[speedIdx]}×
                </button>
                <a
                    href={src}
                    download="voice-message.webm"
                    className={`ml-auto p-1.5 rounded-md ${isMine ? "hover:bg-white/15" : "hover:bg-[var(--color-bg-elevated)]"}`}
                    aria-label="Download voice message"
                >
                    <Download className="w-3.5 h-3.5" />
                </a>
            </div>
        </div>
    );
};

export default AudioPlayer;
