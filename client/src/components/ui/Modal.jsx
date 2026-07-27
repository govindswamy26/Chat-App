import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Button from "./Button";

const Modal = ({ open, onClose, title, description, children, footer }) => (
    <AnimatePresence>
        {open && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <motion.button
                    type="button"
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    aria-label="Close dialog"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 12 }}
                    transition={{ type: "spring", damping: 26, stiffness: 320 }}
                    className="relative w-full max-w-md card p-6 shadow-[var(--shadow-lg)]"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 id="modal-title" className="text-heading text-[var(--color-text)]">
                                {title}
                            </h2>
                            {description && <p className="text-caption mt-2 normal-case tracking-normal text-[var(--color-muted)]">{description}</p>}
                        </div>
                        <button type="button" onClick={onClose} className="icon-btn shrink-0" aria-label="Close">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="mt-5">{children}</div>
                    {footer && <div className="mt-6 flex gap-3 justify-end">{footer}</div>}
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

export const ConfirmModal = ({ open, onClose, onConfirm, title, description, confirmLabel = "Confirm", danger }) => (
    <Modal
        open={open}
        onClose={onClose}
        title={title}
        description={description}
        footer={
            <>
                <Button variant="ghost" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
                    {confirmLabel}
                </Button>
            </>
        }
    />
);

export default Modal;
