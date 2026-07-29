import { AnimatePresence, motion } from "framer-motion";
import { Clock3, Edit3, Send, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";
import { formatMessageTime } from "../../lib/utils";

const formatCountdown = (target) => {
    const diff = Math.max(0, Math.floor((new Date(target) - new Date()) / 1000));
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    if (hours) return `${hours}h ${minutes}m`;
    if (minutes) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
};

const toLocalDateTimeValue = (value) => {
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const ScheduledMessagesPanel = ({ open, onClose, scheduledMessages, onEdit, onCancel, onSendNow }) => {
    const [_now, setNow] = useState(new Date());
    const [editingId, setEditingId] = useState(null);
    const [scheduledForDraft, setScheduledForDraft] = useState("");

    useEffect(() => {
        if (!open) return undefined;
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, [open]);

    const sorted = useMemo(() => [...scheduledMessages].sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor)), [scheduledMessages]);

    const beginEditing = (scheduled) => {
        setEditingId(scheduled._id);
        setScheduledForDraft(toLocalDateTimeValue(scheduled.scheduledFor));
    };

    const saveEdit = async (scheduled) => {
        if (!scheduledForDraft) return;
        const updated = await onEdit(scheduled, new Date(scheduledForDraft).toISOString());
        if (updated) {
            setEditingId(null);
            setScheduledForDraft("");
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.aside
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[var(--color-card)] border-l border-[var(--color-border)] shadow-[var(--shadow-lg)] overflow-y-auto"
                >
                    <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
                        <div>
                            <p className="text-sm text-[var(--color-muted)]">Scheduled Messages</p>
                            <h2 className="text-xl font-semibold">Deliver later</h2>
                        </div>
                        <button type="button" onClick={onClose} className="icon-btn" aria-label="Close scheduled messages panel">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-5 space-y-4">
                        {sorted.length === 0 ? (
                            <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 text-center">
                                <p className="text-sm text-[var(--color-text-secondary)]">No scheduled messages yet.</p>
                                <p className="mt-2 text-[var(--color-text)]">Use Send Later to schedule a message for delivery within 24 hours.</p>
                            </div>
                        ) : (
                            sorted.map((scheduled) => {
                                const scheduledFor = new Date(scheduled.scheduledFor);
                                const countdown = formatCountdown(scheduledFor);
                                return (
                                    <div key={scheduled._id} className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="grid place-items-center w-10 h-10 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                                <Clock3 className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[var(--color-text)] line-clamp-2">{scheduled.text || "Scheduled attachment"}</p>
                                                <p className="text-caption mt-1">To {scheduled.receiverId?.fullName || "Unknown user"}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                            <div className="rounded-[var(--radius-xl)] bg-[var(--color-card)] p-3">
                                                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">Delivery</p>
                                                <p className="mt-2 font-semibold text-[var(--color-text)]">{scheduledFor.toLocaleDateString()}</p>
                                                <p className="text-sm text-[var(--color-muted)] mt-1">{formatMessageTime(scheduledFor)}</p>
                                            </div>
                                            <div className="rounded-[var(--radius-xl)] bg-[var(--color-card)] p-3">
                                                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">Sending in</p>
                                                <p className="mt-2 font-semibold text-[var(--color-text)]">{countdown}</p>
                                                <p className="text-sm text-[var(--color-muted)] mt-1">Status: {scheduled.status}</p>
                                            </div>
                                        </div>
                                        {editingId === scheduled._id && (
                                            <div className="mt-4 rounded-[var(--radius-xl)] bg-[var(--color-card)] p-3">
                                                <label className="block text-sm text-[var(--color-text-secondary)]">
                                                    New delivery time
                                                    <input
                                                        type="datetime-local"
                                                        value={scheduledForDraft}
                                                        min={toLocalDateTimeValue(new Date())}
                                                        max={toLocalDateTimeValue(new Date(Date.now() + 24 * 60 * 60 * 1000))}
                                                        onChange={(event) => setScheduledForDraft(event.target.value)}
                                                        className="field mt-2 w-full"
                                                    />
                                                </label>
                                                <div className="mt-3 flex gap-2">
                                                    <Button type="button" onClick={() => saveEdit(scheduled)} className="flex-1 py-2 px-3 text-sm">Save</Button>
                                                    <Button type="button" variant="secondary" onClick={() => setEditingId(null)} className="flex-1 py-2 px-3 text-sm">Cancel</Button>
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <Button type="button" variant="secondary" onClick={() => beginEditing(scheduled)} className="flex-1 py-2 px-3 text-sm">
                                                <Edit3 className="w-4 h-4" /> Edit time
                                            </Button>
                                            <Button type="button" variant="secondary" onClick={() => onSendNow(scheduled)} className="flex-1 py-2 px-3 text-sm">
                                                <Send className="w-4 h-4" /> Send now
                                            </Button>
                                            <Button type="button" variant="danger" onClick={() => onCancel(scheduled)} className="flex-1 py-2 px-3 text-sm">
                                                Delete schedule
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
};

export default ScheduledMessagesPanel;
