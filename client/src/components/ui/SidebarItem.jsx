import { motion } from "framer-motion";
import Avatar from "./Avatar";

const SidebarItem = ({ user, selected, online, preview, unseen, onSelect }) => (
    <motion.button
        type="button"
        layout
        onClick={onSelect}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`w-full flex items-center gap-3 p-3 rounded-[var(--radius-lg)] text-left transition-all duration-200 ${
            selected
                ? "bg-[var(--color-primary)]/14 shadow-[var(--shadow-sm)] ring-1 ring-[var(--color-primary)]/20"
                : "hover:bg-[var(--color-card)] hover:shadow-[var(--shadow-sm)]"
        }`}
    >
        <Avatar src={user.profilePic} alt={user.fullName} size="md" online={online} />
        <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
                <p className={`font-semibold truncate ${unseen > 0 ? "text-[var(--color-text)]" : "text-[var(--color-text)]"}`}>{user.fullName}</p>
                {unseen > 0 && (
                    <span className="min-w-5 h-5 px-1.5 flex justify-center items-center bg-[var(--color-primary)] rounded-full text-[10px] font-bold text-white shadow-[var(--shadow-glow)] shrink-0">
                        {unseen}
                    </span>
                )}
            </div>
            <p className={`text-xs mt-0.5 truncate ${unseen > 0 ? "text-[var(--color-primary)] font-medium" : "text-[var(--color-muted)]"}`}>
                {preview}
            </p>
        </div>
    </motion.button>
);

export default SidebarItem;
