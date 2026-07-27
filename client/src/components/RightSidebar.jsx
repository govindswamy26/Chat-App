import { motion } from "framer-motion";
import { ImageIcon, Phone, Video, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import CallActionButton from "./chat/CallActionButton";
import EmptyState from "./ui/EmptyState";

const RightSidebar = ({ mobile = false }) => {
    const { selectedUser, messages, setIsProfileOpen } = useContext(ChatContext);
    const { onlineUsers } = useContext(AuthContext);
    const [images, setImages] = useState([]);

    useEffect(() => {
        setImages((Array.isArray(messages) ? messages : []).filter((message) => message?.image).map((message) => message.image));
    }, [messages]);

    if (!selectedUser) return null;

    const showCallPlaceholder = (type) => toast(`${type} calls will be available when WebRTC is connected.`, { icon: type === "Video" ? "📹" : "☎" });
    const isOnline = onlineUsers.includes(selectedUser._id);

    const Wrapper = mobile ? motion.aside : motion.aside;
    const mobileProps = mobile
        ? {
              initial: { x: "100%" },
              animate: { x: 0 },
              exit: { x: "100%" },
              transition: { type: "spring", damping: 28, stiffness: 320 },
              className: "lg:hidden fixed right-0 top-0 bottom-0 z-[60] w-full max-w-sm flex flex-col bg-[var(--color-surface)] shadow-[var(--shadow-lg)] overflow-hidden",
          }
        : {
              initial: { opacity: 0, x: 16 },
              animate: { opacity: 1, x: 0 },
              exit: { opacity: 0, x: 16 },
              className: "hidden lg:flex min-h-0 flex-col bg-[var(--color-surface)] border-l border-[var(--color-border)] overflow-hidden",
          };

    return (
        <Wrapper {...mobileProps}>
            <div className="h-28 bg-gradient-to-br from-[var(--color-secondary)]/40 via-[var(--color-primary)]/30 to-transparent relative shrink-0">
                <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="absolute top-3 right-3 icon-btn bg-[var(--color-card)]/90 backdrop-blur p-2"
                    aria-label="Close profile"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="px-6 -mt-12 flex flex-col flex-1 overflow-y-auto pb-6">
                <div className="text-center">
                    <Avatar src={selectedUser.profilePic || assets.avatar_icon} alt={selectedUser.fullName} size="xl" online={isOnline} className="mx-auto" />
                    <h2 className="font-display text-xl font-bold mt-4 text-[var(--color-text)]">{selectedUser.fullName}</h2>
                    <p className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed px-2">{selectedUser.bio || "No bio yet."}</p>

                    <div className="flex justify-center gap-3 mt-6">
                        <CallActionButton icon={Phone} label="Voice call" onClick={() => showCallPlaceholder("Voice")} />
                        <CallActionButton icon={Video} label="Video call" onClick={() => showCallPlaceholder("Video")} />
                    </div>
                    <p className="text-[11px] text-[var(--color-muted)] mt-3">Call controls are ready for WebRTC connection.</p>
                </div>

                <div className="mt-8 card p-4">
                    <div className="flex justify-between items-center">
                        <p className="text-label">Shared media</p>
                        <span className="text-caption">{images.length}</span>
                    </div>
                    {images.length ? (
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {images.map((url, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => window.open(url)}
                                    className="aspect-square overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-[var(--color-primary)]"
                                >
                                    <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={ImageIcon} title="No shared media" description="Photos you exchange will appear here." />
                    )}
                </div>

                <Button variant="secondary" className="mt-6 w-full" onClick={() => setIsProfileOpen(false)}>
                    Close panel
                </Button>
            </div>
        </Wrapper>
    );
};

export default RightSidebar;
