import { Clock3, LogOut, PhoneIncoming, UserPlus, Users } from "lucide-react";
import { createPortal } from "react-dom";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";
import SearchBar from "./ui/SearchBar";
import SidebarItem from "./ui/SidebarItem";
import { SidebarListSkeleton } from "./ui/Skeleton";
import Avatar from "./ui/Avatar";

const Sidebar = () => {
    const {
        getFriendData,
        users,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        friendData,
        sendFriendRequest,
        respondToFriendRequest,
        setIsProfileOpen,
    } = useContext(ChatContext);
    const { logout, onlineUsers, authUser } = useContext(AuthContext);

    const [input, setInput] = useState("");
    const [tab, setTab] = useState("chats");
    const [messages, setMessages] = useState({});
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();

    const filtered = input ? users.filter((user) => user.fullName?.toLowerCase().includes(input.toLowerCase())) : users;

    useEffect(() => {
        (async () => {
            setLoadingFriends(true);
            await getFriendData();
            setLoadingFriends(false);
        })();
    }, [onlineUsers]);


    const requestCount = friendData.incomingRequests.length;
    const activeFriends = users.filter((user) => onlineUsers.includes(user._id)).slice(0, 5);
    const callHistory = users.slice(0, 5).map((user, index) => ({
        id: `${user._id}-${index}`,
        user,
        type: index % 2 === 0 ? "Outgoing" : "Incoming",
        status: index % 3 === 0 ? "Missed" : "Completed",
        time: `${9 + index}:${index % 2 === 0 ? "15" : "40"} ${index % 2 === 0 ? "AM" : "PM"}`,
    }));

    const sendRequest = (id) => {
        sendFriendRequest(id, messages[id] || "");
        setMessages((prev) => ({ ...prev, [id]: "" }));
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(true);
    };

    const closeLogoutConfirm = () => {
        setShowLogoutConfirm(false);
    };

    const LogoutConfirmModal = ({ isOpen, onCancel, onConfirm }) => {
        if (!isOpen) return null;
        return createPortal(
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/25 p-4"
                onClick={onCancel}
            >
                <div
                    className="max-w-sm w-full rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-md)]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <p className="text-sm font-semibold">Confirm logout</p>
                    <p className="text-sm text-[var(--color-muted)] mt-1">Are you sure you want to sign out?</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="btn btn-danger h-10 w-full text-sm"
                        >
                            Yes
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-secondary h-10 w-full text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    const selectUser = (user) => {
        setSelectedUser(user);
        setIsProfileOpen(false);
        setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
        setTab("chats");
    };

    return (
        <>
            <aside className="min-h-0 flex flex-col p-4 sm:p-5 h-full">
                <div className="flex items-center gap-3 pb-1">
                    <img src={assets.logo_icon} alt="QuickChat logo" className="w-10 h-10 rounded-2xl bg-[var(--color-card)] p-2" />
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">QuickChat</p>
                </div>

            <div className="sidebar-profile-card">
                <div className="flex items-center justify-between gap-3">
                    <button type="button" onClick={() => navigate("/profile")} className="flex items-center gap-3 text-left rounded-[var(--radius-xl)] p-3 bg-[var(--color-surface)] hover:bg-[var(--color-card)] transition flex-1">
                        <Avatar src={authUser?.profilePic || assets.avatar_icon} alt={authUser?.fullName} size="md" online={onlineUsers.includes(authUser?._id)} />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{authUser?.fullName}</p>
                            <p className="text-[0.75rem] text-[var(--color-muted)] mt-0.5">Online · Available</p>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={confirmLogout}
                        className="btn btn-secondary h-10 px-3 text-sm"
                    >
                        Logout
                    </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    <span className="metric-chip">Friends {friendData.friendCount}</span>
                    <span className="metric-chip">Chats {users.length}</span>
                </div>
            </div>

            <div className="sidebar-tab-group">
                <button
                    type="button"
                    onClick={() => setTab("chats")}
                    className={`tab-pill ${tab === "chats" ? "active" : ""}`}
                >
                    Chats
                </button>
                <button
                    type="button"
                    onClick={() => setTab("calls")}
                    className={`tab-pill ${tab === "calls" ? "active" : ""}`}
                >
                    Calls
                </button>
                <button
                    type="button"
                    onClick={() => setTab("requests")}
                    className={`tab-pill ${tab === "requests" ? "active" : ""}`}
                >
                    Requests
                    {requestCount > 0 && <span className="tab-badge">{requestCount}</span>}
                </button>
            </div>

            {tab === "chats" ? (
                <>
                    <SearchBar
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onClear={() => setInput("")}
                        placeholder="Search friends"
                        className="mt-5"
                    />
                    <div className="mt-6 flex items-center justify-between px-1">
                        <p className="text-label">Friends</p>
                        <span className="text-caption">{friendData.friendCount}</span>
                    </div>
                    <div className="mt-3 flex-1 overflow-y-auto space-y-1 pr-1 -mr-1">
                        {loadingFriends ? (
                            <SidebarListSkeleton />
                        ) : filtered.length ? (
                            filtered.map((user) => (
                                <SidebarItem
                                    key={user._id}
                                    user={{ ...user, profilePic: user.profilePic || assets.avatar_icon }}
                                    selected={selectedUser?._id === user._id}
                                    online={onlineUsers.includes(user._id)}
                                    unseen={unseenMessages[user._id] || 0}
                                    preview={
                                        unseenMessages[user._id] > 0
                                            ? `${unseenMessages[user._id]} new message${unseenMessages[user._id] > 1 ? "s" : ""}`
                                            : onlineUsers.includes(user._id)
                                              ? "Online"
                                              : user.bio?.slice(0, 40) || "Tap to chat"
                                    }
                                    onSelect={() => selectUser(user)}
                                />
                            ))
                        ) : (
                            <EmptyState
                                icon={Users}
                                title="No friends yet"
                                description="Open Requests to discover people and send your first friend request."
                                actionLabel="View requests"
                                onAction={() => setTab("requests")}
                            />
                        )}
                    </div>
                </>
            ) : tab === "calls" ? (
                <div className="mt-5 flex-1 overflow-y-auto pr-1 space-y-6">
                    <div className="p-4 rounded-[var(--radius-2xl)] bg-[var(--color-bg-elevated)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold">Active now</p>
                                <p className="text-xs text-[var(--color-muted)]">Friends available for calls</p>
                            </div>
                            <PhoneIncoming className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <div className="mt-4 grid gap-3">
                            {activeFriends.length ? (
                                activeFriends.map((user) => (
                                    <button
                                        key={user._id}
                                        type="button"
                                        onClick={() => selectUser(user)}
                                        className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] p-3 text-left transition hover:bg-[var(--color-card)]"
                                    >
                                        <Avatar src={user.profilePic || assets.avatar_icon} alt={user.fullName} size="sm" online={true} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold truncate">{user.fullName}</p>
                                            <p className="text-[0.78rem] text-[var(--color-muted)]">Available to chat</p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-sm text-[var(--color-muted)]">No one is online right now.</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="text-label px-1">Recent calls</p>
                        <div className="mt-3 space-y-3">
                            {callHistory.length ? (
                                callHistory.map((call) => (
                                    <div key={call.id} className="call-card">
                                        <div className="flex items-center gap-3">
                                            <Avatar src={call.user.profilePic || assets.avatar_icon} alt={call.user.fullName} size="md" online={onlineUsers.includes(call.user._id)} />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-sm truncate">{call.user.fullName}</p>
                                                <p className="text-xs text-[var(--color-muted)] mt-0.5">
                                                    {call.type} call · {call.time}
                                                </p>
                                            </div>
                                            <span className={`call-status ${call.status === "Missed" ? "missed" : "completed"}`}>
                                                {call.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-[var(--color-muted)] px-2 py-4">No calls yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mt-5 flex-1 overflow-y-auto pr-1 space-y-6">
                    <section>
                        <div className="flex items-center justify-between px-1">
                            <p className="text-label">Incoming requests</p>
                            <span className="text-caption">{friendData.incomingRequests.length}</span>
                        </div>
                        <div className="mt-3 space-y-3">
                            {friendData.incomingRequests.length ? (
                                friendData.incomingRequests.map((request) => (
                                    <div key={request._id} className="card p-4">
                                        <div className="flex gap-3">
                                            <Avatar src={request.sender.profilePic || assets.avatar_icon} alt={request.sender.fullName} size="md" />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm truncate">{request.sender.fullName}</p>
                                                <p className="text-xs text-[var(--color-muted)] mt-1 line-clamp-2">
                                                    {request.message || "Would like to be friends."}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            <Button className="w-full py-2 text-xs" onClick={() => respondToFriendRequest(request._id, "accept")}> 
                                                Accept
                                            </Button>
                                            <Button variant="secondary" className="w-full py-2 text-xs" onClick={() => respondToFriendRequest(request._id, "reject")}> 
                                                Decline
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-[var(--color-muted)] px-2 py-4">No pending requests.</p>
                            )}
                        </div>
                    </section>
                    <section>
                        <p className="text-label px-1">Find people</p>
                        <div className="mt-3 space-y-3">
                            {friendData.discoverUsers.map((user) => (
                                <div key={user._id} className="card p-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar src={user.profilePic || assets.avatar_icon} alt={user.fullName} size="md" />
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm truncate">{user.fullName}</p>
                                            <p className="text-xs text-[var(--color-muted)] truncate">{user.bio || "New on QuickChat"}</p>
                                        </div>
                                    </div>
                                    <input
                                        value={messages[user._id] || ""}
                                        onChange={(e) => setMessages((prev) => ({ ...prev, [user._id]: e.target.value }))}
                                        maxLength="300"
                                        placeholder="Add a message (optional)"
                                        className="field text-xs py-2 mt-3"
                                    />
                                    <Button className="w-full py-2 mt-3 text-xs gap-2" onClick={() => sendRequest(user._id)}>
                                        <UserPlus className="w-4 h-4" />
                                        Send friend request
                                    </Button>
                                </div>
                            ))}
                            {friendData.outgoingRequests.length > 0 && (
                                <p className="text-xs text-[var(--color-muted)] px-2">
                                    {friendData.outgoingRequests.length} request{friendData.outgoingRequests.length > 1 ? "s" : ""} awaiting a response.
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            )}

            </aside>
            <LogoutConfirmModal
                isOpen={showLogoutConfirm}
                onCancel={closeLogoutConfirm}
                onConfirm={() => {
                    closeLogoutConfirm();
                    logout();
                }}
            />
        </>
    );
};

export default Sidebar;
