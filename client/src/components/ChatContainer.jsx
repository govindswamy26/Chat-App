import { useContext, useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { formatMessageDate, isSameDay } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import ChatHeader from "./chat/ChatHeader";
import MessageBubble from "./chat/MessageBubble";
import MessageComposer from "./chat/MessageComposer";
import ScheduledMessagesPanel from "./chat/ScheduledMessagesPanel";
import EmptyState from "./ui/EmptyState";
import { ConfirmModal } from "./ui/Modal";
import { MessageListSkeleton } from "./ui/Skeleton";
import assets from "../assets/assets";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

const ChatContainer = () => {
    const {
        messages,
        setMessages,
        selectedUser,
        setSelectedUser,
        sendMessage,
        deleteMessage,
        getMessages,
        getScheduledMessages,
        scheduleMessage,
        updateScheduledMessage,
        cancelScheduledMessage,
        sendScheduledMessageNow,
        isMessagesLoading,
        isProfileOpen,
        setIsProfileOpen,
    } = useContext(ChatContext);
    const { authUser, onlineUsers, axios } = useContext(AuthContext);

    const endRef = useRef(null);
    const audioListRef = useRef(null);
    const recorderRef = useRef(null);
    const streamRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const startedAtRef = useRef(0);
    const discardRecordingRef = useRef(false);

    const [input, setInput] = useState("");
    const [aiSummary, setAiSummary] = useState(null);
    const [aiError, setAiError] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isUploadingVoice, setIsUploadingVoice] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
    const [isPolishing, setIsPolishing] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [scheduledMessages, setScheduledMessages] = useState([]);
    const [isScheduledPanelOpen, setIsScheduledPanelOpen] = useState(false);

    const send = async (event) => {
        event?.preventDefault();
        if (!input.trim()) return;
        await sendMessage({ text: input });
        setInput("");
        setAiSummary(null);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const deleted = await deleteMessage(deleteTarget);
        if (deleted) setDeleteTarget(null);
    };

    const handleMessageKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            send();
        }
    };

    const polishDraft = async () => {
        if (!input.trim()) {
            setAiError("Write a message first to use AI polish.");
            return toast.error("Write a message first");
        }

        setAiError("");
        setIsPolishing(true);
        try {
            const { data } = await axios.post("/api/ai/polish-message", { text: input });
            if (!data.success) {
                setAiError(data.message || "Could not polish this draft");
                return toast.error(data.message || "Could not polish this draft");
            }
            setAiSummary({ original: input, summary: data.text, mode: "original" });
            toast.success("AI summary ready — review it before using");
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || "Could not polish this draft";
            setAiError(message);
            toast.error(message);
        } finally {
            setIsPolishing(false);
        }
    };

    const useSummary = () => {
        if (!aiSummary) return;
        setInput(aiSummary.summary);
        setAiSummary((summary) => ({ ...summary, mode: "summary" }));
    };

    const loadScheduledMessages = async () => {
        if (!selectedUser) {
            setScheduledMessages([]);
            return;
        }

        const messages = await getScheduledMessages();
        if (Array.isArray(messages)) {
            setScheduledMessages(messages.filter((message) => message.receiverId?._id === selectedUser._id));
        }
    };

    const handleScheduleMessage = async (scheduledFor) => {
        if (!input.trim()) return toast.error("Write a message first");
        const scheduled = await scheduleMessage(selectedUser._id, { text: input, scheduledFor });
        if (scheduled) {
            setInput("");
            setAiSummary(null);
            loadScheduledMessages();
            setIsScheduledPanelOpen(true);
        }
    };

    const openScheduledPanel = () => {
        setIsScheduledPanelOpen(true);
        loadScheduledMessages();
    };

    const handleSendScheduledNow = async (scheduled) => {
        const delivered = await sendScheduledMessageNow(scheduled._id);
        if (delivered && selectedUser?._id === scheduled.receiverId?._id) {
            setMessages((prevMessages) => [...prevMessages, delivered]);
        }
        loadScheduledMessages();
    };

    const handleCancelScheduled = async (scheduled) => {
        const success = await cancelScheduledMessage(scheduled._id);
        if (success) loadScheduledMessages();
    };

    const handleEditScheduled = async (scheduled, scheduledFor) => {
        const updated = await updateScheduledMessage(scheduled._id, { scheduledFor });
        if (updated) {
            await loadScheduledMessages();
            return true;
        }
        return false;
    };

    const handleCloseScheduledPanel = () => {
        setIsScheduledPanelOpen(false);
    };

    const revertToOriginal = () => {
        if (!aiSummary) return;
        setInput(aiSummary.original);
        setAiSummary((summary) => ({ ...summary, mode: "original" }));
        toast.success("Original draft restored");
    };

    const copySummary = () => {
        if (!aiSummary?.summary) return;
        navigator.clipboard.writeText(aiSummary.summary);
        toast.success("Summary copied");
    };

    const dismissSummary = () => {
        setAiSummary(null);
    };

    const sendImage = (event) => {
        const file = event.target.files[0];
        event.target.value = "";
        setAttachmentMenuOpen(false);
        if (!file?.type.startsWith("image/")) return toast.error("Select a valid image file");
        if (file.size > MAX_FILE_BYTES) return toast.error("Images must be under 2 MB");
        const reader = new FileReader();
        reader.onloadend = async () => {
            await sendMessage({ image: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const sendDocument = (event) => {
        const file = event.target.files[0];
        event.target.value = "";
        setAttachmentMenuOpen(false);
        if (!file) return;
        if (file.size > MAX_FILE_BYTES) return toast.error("Documents must be under 2 MB");
        const reader = new FileReader();
        reader.onloadend = async () => {
            await sendMessage({
                document: reader.result,
                documentName: file.name,
                documentType: file.type,
                documentSize: file.size,
            });
        };
        reader.readAsDataURL(file);
    };

    const stopTracks = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    };

    const stopRecording = () => {
        if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    };

    const cancelRecording = () => {
        discardRecordingRef.current = true;
        stopRecording();
    };

    const pauseOtherVoiceNotes = (current) => {
        audioListRef.current?.querySelectorAll("audio").forEach((audio) => {
            if (audio !== current) audio.pause();
        });
    };

    const startRecording = async () => {
        if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
            return toast.error("Voice recording is not supported in this browser");
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            chunksRef.current = [];
            discardRecordingRef.current = false;
            const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
            const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
            recorderRef.current = recorder;
            recorder.ondataavailable = (event) => {
                if (event.data.size) chunksRef.current.push(event.data);
            };
            recorder.onstop = () => {
                clearInterval(timerRef.current);
                const duration = Math.min(30, Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)));
                const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
                stopTracks();
                setIsRecording(false);
                setRecordingSeconds(0);
                if (discardRecordingRef.current) {
                    discardRecordingRef.current = false;
                    return;
                }
                if (blob.size > MAX_FILE_BYTES) return toast.error("Voice message is too large. Please record a shorter note.");
                const reader = new FileReader();
                reader.onloadend = async () => {
                    setIsUploadingVoice(true);
                    try {
                        await sendMessage({ audio: reader.result, audioDuration: duration });
                    } finally {
                        setIsUploadingVoice(false);
                    }
                };
                reader.readAsDataURL(blob);
            };
            recorder.start();
            startedAtRef.current = Date.now();
            setIsRecording(true);
            setRecordingSeconds(0);
            timerRef.current = setInterval(() => {
                const seconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
                setRecordingSeconds(seconds);
                if (seconds >= 30) stopRecording();
            }, 500);
        } catch (error) {
            stopTracks();
            toast.error(error.name === "NotAllowedError" ? "Microphone permission was denied" : "Unable to start voice recording");
        }
    };

    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id);
            loadScheduledMessages();
        }
    }, [selectedUser]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(
        () => () => {
            clearInterval(timerRef.current);
            stopTracks();
        },
        [],
    );

    const callPlaceholder = (type) =>
        toast(`${type} call UI is ready. Call connectivity will be added with WebRTC.`, { icon: type === "Video" ? "📹" : "☎" });

    if (!selectedUser) {
        return (
            <section className="hidden md:flex min-h-0 flex-1 flex-col items-center justify-center text-center p-10">
                <EmptyState
                    icon={MessageCircle}
                    title="Your conversations, all in one place"
                    description="Choose a friend from the sidebar to start chatting securely and in real time."
                />
                <img src={assets.logo_icon} alt="" className="w-14 opacity-20 mt-[-2rem] pointer-events-none" aria-hidden />
            </section>
        );
    }

    const messageList = Array.isArray(messages) ? messages : [];
    const isOnline = onlineUsers.includes(selectedUser._id);

    return (
        <section className="min-w-0 min-h-0 h-full flex flex-col bg-[var(--color-bg-elevated)]/30">
            <ChatHeader
                user={selectedUser}
                isOnline={isOnline}
                showBack
                onBack={() => setSelectedUser(null)}
                onToggleProfile={() => setIsProfileOpen((value) => !value)}
                isProfileOpen={isProfileOpen}
                onVoiceCall={() => callPlaceholder("Voice")}
                onVideoCall={() => callPlaceholder("Video")}
                onSearch={() => toast("In-chat search will arrive in a future update.", { icon: "🔍" })}
                onOpenScheduledMessages={openScheduledPanel}
            />

            <div ref={audioListRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-6">
                {isMessagesLoading ? (
                    <MessageListSkeleton />
                ) : (
                    <div className="space-y-4">
                        {messageList.map((msg, index) => {
                            const isMine = msg?.senderId === authUser?._id;
                            const prev = messageList[index - 1];
                            const showDate = !isSameDay(msg?.createdAt, prev?.createdAt);

                            return (
                                <div key={msg?._id || index} className={`${showDate ? "" : "message-group"}`}>
                                    {showDate && (
                                        <div className="flex justify-center my-6">
                                            <span className="message-divider">{formatMessageDate(msg?.createdAt)}</span>
                                        </div>
                                    )}
                                    <MessageBubble
                                        msg={msg}
                                        isMine={isMine}
                                        onDelete={setDeleteTarget}
                                        onAudioPlay={pauseOtherVoiceNotes}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
                <div ref={endRef} />
            </div>

            <MessageComposer
                input={input}
                setInput={setInput}
                onSend={send}
                onKeyDown={handleMessageKeyDown}
                onPolish={polishDraft}
                aiSummary={aiSummary}
                aiError={aiError}
                onDismissAiError={() => setAiError("")}
                onUseSummary={useSummary}
                onRevertToOriginal={revertToOriginal}
                onCopySummary={copySummary}
                onDismissSummary={dismissSummary}
                isPolishing={isPolishing}
                isRecording={isRecording}
                recordingSeconds={recordingSeconds}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                onCancelRecording={cancelRecording}
                isUploadingVoice={isUploadingVoice}
                attachmentMenuOpen={attachmentMenuOpen}
                setAttachmentMenuOpen={setAttachmentMenuOpen}
                onSendImage={sendImage}
                onSendDocument={sendDocument}
                onSchedule={handleScheduleMessage}
                disabledAttach={isUploadingVoice}
            />
            <ScheduledMessagesPanel
                open={isScheduledPanelOpen}
                onClose={handleCloseScheduledPanel}
                scheduledMessages={scheduledMessages}
                onEdit={handleEditScheduled}
                onCancel={handleCancelScheduled}
                onSendNow={handleSendScheduledNow}
            />

            <ConfirmModal
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Delete message?"
                description="This removes the message for everyone in this chat."
                confirmLabel="Delete"
                danger
            />
        </section>
    );
};

export default ChatContainer;
