import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Clock3, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Button from "../ui/Button";
import { formatMessageTime } from "../../lib/utils";

const QUICK_OPTIONS = [
    { label: "In 15 minutes", offset: 15 },
    { label: "In 30 minutes", offset: 30 },
    { label: "In 1 hour", offset: 60 },
    { label: "Tonight 9:00 PM", time: "21:00" },
    { label: "Tomorrow 9:00 AM", dateOffset: 1, time: "09:00" },
];

const createDate = ({ date, time, dateOffset = 0 }) => {
    const selected = new Date(date || new Date());
    selected.setDate(selected.getDate() + dateOffset);
    const [hours, minutes] = (time || "").split(":").map(Number);
    if (!Number.isNaN(hours)) selected.setHours(hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);
    return selected;
};

const clampTo24h = (value) => {
    const now = new Date();
    const max = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (value <= now) return false;
    return value <= max;
};

const ScheduleMessageModal = ({ open, onClose, draft, onSchedule }) => {
    const now = useMemo(() => new Date(), []);
    const minDate = now.toISOString().slice(0, 10);
    const defaultTime = now.toTimeString().slice(0, 5);
    const [date, setDate] = useState(minDate);
    const [time, setTime] = useState(defaultTime);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        const nextMinute = new Date();
        nextMinute.setMinutes(nextMinute.getMinutes() + 5);
        setDate(nextMinute.toISOString().slice(0, 10));
        setTime(nextMinute.toTimeString().slice(0, 5));
        setError("");
    }, [open]);

    const scheduledFor = useMemo(() => createDate({ date, time }), [date, time]);
    const valid = clampTo24h(scheduledFor);
    const quickOptions = QUICK_OPTIONS.map((option) => {
        const scheduled = createDate({
            date: option.dateOffset ? new Date(minDate) : new Date(),
            time: option.time,
            dateOffset: option.dateOffset,
        });
        if (option.offset) scheduled.setMinutes(scheduled.getMinutes() + option.offset);
        return { ...option, value: scheduled };
    });

    const handleSchedule = () => {
        if (!valid) {
            setError("Please choose a time within the next 24 hours.");
            return;
        }
        onSchedule(scheduledFor);
    };

    const handleQuickOption = (option) => {
        setDate(option.value.toISOString().slice(0, 10));
        setTime(option.value.toTimeString().slice(0, 5));
        setError("");
    };

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.button
                        type="button"
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                        aria-label="Close schedule modal"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ type: "spring", damping: 28, stiffness: 320 }}
                        className="relative w-full max-w-md max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[var(--radius-2xl)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-lg)] border border-[var(--color-border)]"
                    >
                        <button type="button" onClick={onClose} className="absolute top-4 right-4 icon-btn" aria-label="Close schedule option">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-start">
                            <div className="grid place-items-center w-11 h-11 rounded-[1.5rem] bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                <CalendarDays className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Schedule message</h2>
                                <p className="text-sm text-[var(--color-muted)] mt-1 max-w-xl">
                                    Schedule delivery within the next 24 hours. The server will send it automatically.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                                Delivery date
                                <input
                                    type="date"
                                    value={date}
                                    min={minDate}
                                    max={new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="field w-full"
                                />
                            </label>
                            <label className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                                Delivery time
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="field w-full"
                                />
                            </label>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm font-semibold text-[var(--color-text)]">Quick schedule</p>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {quickOptions.map((option) => (
                                    <button
                                        key={option.label}
                                        type="button"
                                        onClick={() => handleQuickOption(option)}
                                        className="rounded-[var(--radius-xl)] border border-[var(--color-border)] px-3 py-2 text-left text-sm hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-elevated)] transition"
                                    >
                                        <p className="font-semibold">{option.label}</p>
                                        <p className="text-[var(--color-muted)] mt-1 text-xs">{formatMessageTime(option.value)}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 text-sm">
                            <div className="flex flex-col gap-2 text-[var(--color-text-secondary)]">
                                <div className="flex items-center gap-2">
                                    <Clock3 className="w-4 h-4" />
                                    <span>Scheduled for:</span>
                                </div>
                                <strong className="text-[var(--color-text)]">{scheduledFor.toLocaleString()}</strong>
                            </div>
                            {!valid && (
                                <p className="mt-3 text-sm text-[var(--color-error)]">Please choose a future time within the next 24 hours.</p>
                            )}
                        </div>

                        {error && <p className="mt-4 text-sm text-[var(--color-error)]">{error}</p>}

                        <div className="mt-6 flex flex-wrap gap-2 justify-end">
                            <Button variant="secondary" onClick={onClose} className="py-2 px-4 text-sm">
                                Cancel
                            </Button>
                            <Button onClick={handleSchedule} className="py-2 px-4 text-sm" disabled={!valid}>
                                Schedule message
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
};

export default ScheduleMessageModal;
