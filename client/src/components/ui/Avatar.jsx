const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-24 h-24 text-lg",
};

const Avatar = ({ src, alt = "", size = "md", online, className = "" }) => (
    <div className={`relative shrink-0 ${className}`}>
        {src ? (
            <img src={src} alt={alt} className={`${sizes[size]} rounded-full object-cover ring-2 ring-[var(--color-border)]`} />
        ) : (
            <div
                className={`${sizes[size]} rounded-full grid place-items-center font-semibold bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] text-white`}
                aria-hidden
            >
                {(alt || "?").charAt(0).toUpperCase()}
            </div>
        )}
        {online !== undefined && (
            <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--color-surface)] ${
                    online ? "bg-[var(--color-success)]" : "bg-[var(--color-muted)]"
                }`}
                aria-label={online ? "Online" : "Offline"}
            />
        )}
    </div>
);

export default Avatar;
