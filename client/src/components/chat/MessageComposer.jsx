import { AnimatePresence, motion } from "framer-motion";
import { Film, Image, Mic, Paperclip, Send, Smile, Sparkles, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import Tooltip from "../ui/Tooltip";

const QUICK_EMOJIS = ["😀", "😂", "❤️", "👍", "🔥", "✨", "🎉", "🙏"];

const MessageComposer = ({
    input,
    setInput,
    onSend,
    onKeyDown,
    onPolish,
    aiSummary,
    onUseSummary,
    onRevertToOriginal,
    onCopySummary,
    onDismissSummary,
    isPolishing,
    isRecording,
    recordingSeconds,
    onStartRecording,
    onStopRecording,
    onCancelRecording,
    isUploadingVoice,
    attachmentMenuOpen,
    setAttachmentMenuOpen,
    onSendImage,
    onSendDocument,
    disabledAttach,
}) => {
    const textareaRef = useRef(null);
    const composerRef = useRef(null);
    const [emojiOpen, setEmojiOpen] = useState(false);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
    }, [input]);

    useEffect(() => {
        if (!attachmentMenuOpen && !emojiOpen) return undefined;
        const handleOutsideClick = (event) => {
            if (composerRef.current && !composerRef.current.contains(event.target)) {
                setAttachmentMenuOpen(false);
                setEmojiOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("touchstart", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("touchstart", handleOutsideClick);
        };
    }, [attachmentMenuOpen, emojiOpen, setAttachmentMenuOpen]);

    const insertEmoji = (emoji) => {
        setInput((prev) => prev + emoji);
        setEmojiOpen(false);
        textareaRef.current?.focus();
    };

    return (
        <form onSubmit={onSend} className="composer-float shrink-0">
            {aiSummary && (
                <div className="mb-3 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-sm)]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)]">AI summary</p>
                            <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
                                Your original message is preserved. Review the summary and choose what you want to send.
                            </p>
                        </div>
                        <button type="button" onClick={onDismissSummary} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
                            Dismiss
                        </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 mt-4">
                        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3">
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <p className="font-semibold text-sm text-[var(--color-text)]">Original</p>
                                <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-primary)]">Draft</span>
                            </div>
                            <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap break-words">{aiSummary.original}</p>
                        </div>
                        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3">
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <p className="font-semibold text-sm text-[var(--color-text)]">Summary</p>
                                <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-primary)]">
                                    {aiSummary.mode === "summary" ? "Selected" : "Preview"}
                                </span>
                            </div>
                            <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap break-words">{aiSummary.summary}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button type="button" className="py-2 px-4 text-sm" onClick={onUseSummary}>
                            Use summary
                        </Button>
                        <Button type="button" variant="secondary" className="py-2 px-4 text-sm" onClick={onRevertToOriginal}>
                            Revert to original
                        </Button>
                        <Button type="button" variant="ghost" className="py-2 px-4 text-sm" onClick={onCopySummary}>
                            Copy summary
                        </Button>
                    </div>
                </div>
            )}
            <div ref={composerRef} className="flex flex-wrap items-center gap-3 p-3 bg-[var(--composer-bg)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)]">
                <div className="relative">
                    <Tooltip label="Attach file">
                        <button
                            type="button"
                            onClick={() => {
                                setAttachmentMenuOpen((v) => !v);
                                setEmojiOpen(false);
                            }}
                            disabled={disabledAttach}
                            className="icon-btn shrink-0"
                            aria-label="Attachments"
                            aria-expanded={attachmentMenuOpen}
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>
                    </Tooltip>
                    <AnimatePresence>
                        {attachmentMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                className="absolute z-20 bottom-12 left-0 w-52 card p-2 shadow-[var(--shadow-md)]"
                            >
                                <label className="flex items-center gap-2.5 cursor-pointer px-3 py-2.5 rounded-xl text-sm hover:bg-[var(--color-bg-elevated)] transition-colors">
                                    <Image className="w-4 h-4 text-[var(--color-primary)]" />
                                    Photos
                                    <input onChange={onSendImage} type="file" accept="image/png,image/jpeg,image/webp" hidden />
                                </label>
                                <label className="flex items-center gap-2.5 cursor-pointer px-3 py-2.5 rounded-xl text-sm hover:bg-[var(--color-bg-elevated)] transition-colors">
                                    <Paperclip className="w-4 h-4 text-[var(--color-primary)]" />
                                    Document
                                    <input onChange={onSendDocument} type="file" accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.ppt,.pptx" hidden />
                                </label>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {isRecording ? (
                    <>
                        <div className="flex-1 field flex items-center gap-3 py-3 !border-[var(--color-error)]/30 !bg-[var(--color-error)]/8 text-[var(--color-error)]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-error)] animate-pulse" />
                            Recording · {recordingSeconds}s / 30s
                        </div>
                        <Button type="button" variant="secondary" onClick={onCancelRecording}>Cancel</Button>
                        <Button type="button" variant="danger" onClick={onStopRecording}>
                            <Square className="w-4 h-4 fill-current" /> Send
                        </Button>
                    </>
                ) : isUploadingVoice ? (
                    <div className="flex-1 field flex items-center gap-3 py-3 !border-[var(--color-primary)]/25 !bg-[var(--color-primary)]/8">
                        <span className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] animate-spin" />
                        Sending voice message…
                    </div>
                ) : (
                    <>
                        <div className="flex-1 min-w-0 flex items-center gap-3 rounded-[var(--radius-xl)] px-3 py-2 bg-[var(--color-bg-elevated)]/75 focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20 transition-all">
                            <div className="relative flex-shrink-0">
                                <Tooltip label="Emoji">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEmojiOpen((v) => !v);
                                            setAttachmentMenuOpen(false);
                                        }}
                                        className="icon-btn p-0"
                                        aria-label="Insert emoji"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>
                                </Tooltip>
                                <AnimatePresence>
                                    {emojiOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 6 }}
                                            className="absolute bottom-14 left-0 min-w-[220px] grid grid-cols-4 gap-2 p-3 rounded-[var(--radius-xl)] bg-[var(--color-card)] border border-[var(--color-border)] shadow-[var(--shadow-md)]"
                                        >
                                            {QUICK_EMOJIS.map((e) => (
                                                <button key={e} type="button" className="w-10 h-10 text-lg rounded-2xl hover:bg-[var(--color-bg-elevated)] transition-colors" onClick={() => insertEmoji(e)}>
                                                    {e}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                rows={1}
                                placeholder="Type a message"
                                className="flex-1 bg-transparent border-0 outline-none resize-none max-h-36 py-2 text-[var(--color-text)] placeholder:text-[var(--color-muted)]"
                                aria-label="Message input"
                            />
                            <Tooltip label="AI polish">
                                <button
                                    type="button"
                                    onClick={onPolish}
                                    disabled={!input.trim() || isPolishing}
                                    className="icon-btn"
                                    aria-label="AI grammar polish"
                                >
                                    {isPolishing ? (
                                        <span className="w-4 h-4 rounded-full border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] animate-spin block" />
                                    ) : (
                                        <Sparkles className="w-4 h-4" />
                                    )}
                                </button>
                            </Tooltip>
                            <Tooltip label="GIF (coming soon)">
                                <button
                                    type="button"
                                    onClick={() => toast("GIF picker coming soon", { icon: "🎬" })}
                                    className="icon-btn hidden sm:grid"
                                    aria-label="Send GIF"
                                >
                                    <Film className="w-5 h-5" />
                                </button>
                            </Tooltip>
                        </div>
                        <Tooltip label="Voice message">
                            <button type="button" onClick={onStartRecording} className="icon-btn" aria-label="Record voice message">
                                <Mic className="w-5 h-5" />
                            </button>
                        </Tooltip>
                        <Tooltip label="Send">
                            <button type="submit" className="w-12 h-12 rounded-[var(--radius-xl)] btn-primary grid place-items-center" aria-label="Send message">
                                <Send className="w-5 h-5" />
                            </button>
                        </Tooltip>
                    </>
                )}
            </div>
        </form>
    );
};

export default MessageComposer;
