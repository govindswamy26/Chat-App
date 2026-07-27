import { motion } from "framer-motion";
import Button from "./Button";

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center text-center px-6 py-12"
    >
        {Icon && (
            <div className="w-16 h-16 rounded-2xl grid place-items-center mb-5 bg-gradient-to-br from-[var(--color-secondary)]/15 to-[var(--color-primary)]/20 text-[var(--color-primary)]">
                <Icon className="w-8 h-8" strokeWidth={1.5} />
            </div>
        )}
        <h3 className="font-display text-lg font-semibold text-[var(--color-text)]">{title}</h3>
        {description && <p className="text-body text-[var(--color-muted)] mt-2 max-w-sm">{description}</p>}
        {actionLabel && onAction && (
            <Button className="mt-6" onClick={onAction}>
                {actionLabel}
            </Button>
        )}
    </motion.div>
);

export default EmptyState;
