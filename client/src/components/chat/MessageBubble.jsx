import { motion } from "framer-motion";
import { CheckCheck, Copy, FileText, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatMessageTime } from "../../lib/utils";
import AudioPlayer from "./AudioPlayer";

const MessageBubble = ({ msg, isMine, onDelete, onAudioPlay }) => {
    const copyText = () => {
        if (msg?.text) {
            navigator.clipboard.writeText(msg.text);
            toast.success("Copied to clipboard");
        }
    };

    if (msg?.isDeleted) {
        return (
            <p className="px-4 py-2.5 rounded-[var(--radius-lg)] text-sm italic text-[var(--color-muted)] bg-[var(--color-bg-elevated)]/80">
                This message was deleted
            </p>
        );
    }

    let content = null;

    if (msg?.image) {
        content = (
            <div className={`bubble-body ${isMine ? "bubble-mine" : "bubble-other"}`}>
                <img src={msg.image} alt="Shared" className="max-w-full rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] max-h-80 object-cover" />
            </div>
        );
    } else if (msg?.audio) {
        content = (
            <div className={`bubble-body ${isMine ? "bubble-mine" : "bubble-other"}`}>
                <AudioPlayer src={msg.audio} duration={msg.audioDuration} isMine={isMine} onPlayStart={onAudioPlay} />
            </div>
        );
    } else if (msg?.documentUrl) {
        content = (
            <a href={msg.documentUrl} target="_blank" rel="noreferrer" className={`bubble-body ${isMine ? "bubble-mine" : "bubble-other"} block transition-transform hover:scale-[1.01]`}>
                <div className="flex items-start gap-3">
                    <FileText className="w-8 h-8 shrink-0 opacity-90" />
                    <div>
                        <p className="font-semibold text-sm">{msg.documentName || "Document"}</p>
                        <p className="text-xs opacity-75 mt-1">
                            {msg.documentType || "File"}
                            {msg.documentSize ? ` · ${Math.ceil(msg.documentSize / 1024)} KB` : ""}
                        </p>
                        <p className="text-xs mt-3 underline underline-offset-2">Open document</p>
                    </div>
                </div>
            </a>
        );
    } else {
        content = (
            <div className={`bubble-body ${isMine ? "bubble-mine" : "bubble-other"}`}>
                <p className="text-[0.9375rem] leading-relaxed whitespace-pre-wrap break-words">
                    {msg?.text || ""}
                </p>
            </div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`message-bubble ${isMine ? "mine" : "other"}`}
        >
            {content}

            <div className="message-meta">
                <span>{formatMessageTime(msg?.createdAt)}</span>
                {isMine && msg?.seen && <CheckCheck className="w-4 h-4 text-[var(--color-primary)]" aria-label="Seen" />}
            </div>

        </motion.div>
    );
};

export default MessageBubble;
