import { ArrowLeft, Clock3, Phone, Search, Video } from "lucide-react";
import Avatar from "../ui/Avatar";
import CallActionButton from "./CallActionButton";
import Dropdown, { DropdownItem } from "../ui/Dropdown";

const ChatHeader = ({
    user,
    isOnline,
    onBack,
    onToggleProfile,
    onVoiceCall,
    onVideoCall,
    onSearch,
    onOpenScheduledMessages,
    showBack,
}) => {
    return (
        <header className="header-float shrink-0 flex items-center gap-3">
            {showBack && (
                <button type="button" onClick={onBack} className="icon-btn md:hidden shrink-0" aria-label="Back to conversations">
                    <ArrowLeft className="w-5 h-5" />
                </button>
            )}
            <button type="button" onClick={onToggleProfile} className="flex min-w-0 flex-1 items-center gap-3 text-left group">
                <Avatar src={user.profilePic} alt={user.fullName} online={isOnline} />
                <div className="min-w-0">
                    <h2 className="font-display text-base sm:text-lg font-bold truncate group-hover:text-[var(--color-primary)] transition-colors">
                        {user.fullName}
                    </h2>
                    <p className="text-caption normal-case tracking-normal">
                        {isOnline ? "Active now" : "Offline"}
                    </p>
                </div>
            </button>
            <div className="flex items-center gap-1 shrink-0">
                <CallActionButton icon={Search} label="Search in chat" onClick={onSearch} />
                <CallActionButton icon={Clock3} label="View scheduled messages" onClick={onOpenScheduledMessages} />
                <CallActionButton icon={Phone} label="Start voice call" onClick={onVoiceCall} />
                <CallActionButton icon={Video} label="Start video call" onClick={onVideoCall} />
            </div>
        </header>
    );
};

export default ChatHeader;
