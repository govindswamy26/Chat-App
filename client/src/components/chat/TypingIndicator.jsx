const TypingIndicator = () => (
    <div className="flex items-center gap-1 px-4 py-3 rounded-2xl bubble-other w-fit shadow-[var(--shadow-sm)]" aria-label="Typing">
        <span className="w-2 h-2 rounded-full bg-[var(--color-muted)] typing-dot" />
        <span className="w-2 h-2 rounded-full bg-[var(--color-muted)] typing-dot" />
        <span className="w-2 h-2 rounded-full bg-[var(--color-muted)] typing-dot" />
    </div>
);

export default TypingIndicator;
