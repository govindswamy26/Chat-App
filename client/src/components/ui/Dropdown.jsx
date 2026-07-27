import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

const Dropdown = ({ open, onClose, anchor = "bottom-left", className = "", children }) => {
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose?.();
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open, onClose]);

    const anchorClass = {
        "bottom-left": "top-full left-0 mt-2",
        "bottom-right": "top-full right-0 mt-2",
        "top-left": "bottom-full left-0 mb-2",
    }[anchor];

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className={`absolute z-50 min-w-[180px] rounded-[var(--radius-lg)] p-1.5 bg-[var(--color-card)] shadow-[var(--shadow-md)] border border-[var(--color-border)] ${anchorClass} ${className}`}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const DropdownItem = ({ icon: Icon, label, onClick, danger }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
            danger ? "text-[var(--color-error)] hover:bg-[var(--color-error)]/10" : "hover:bg-[var(--color-bg-elevated)]"
        }`}
    >
        {Icon && <Icon className="w-4 h-4 shrink-0 opacity-80" />}
        {label}
    </button>
);

export default Dropdown;
