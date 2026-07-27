import { AnimatePresence, motion } from "framer-motion";
import { useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import ChatPanelBoundary from "../components/ChatPanelBoundary";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
    const { selectedUser, isProfileOpen, setIsProfileOpen } = useContext(ChatContext);

    return (
        <main className="app-shell">
            <div className={`panel panel-sidebar overflow-hidden ${selectedUser ? "max-md:hidden" : "max-md:flex"}`}>
                <Sidebar />
            </div>

            <div className={`panel panel-chat overflow-hidden ${!selectedUser ? "max-md:hidden" : "max-md:flex"}`}>
                <ChatPanelBoundary resetKey={selectedUser?._id}>
                    <ChatContainer />
                </ChatPanelBoundary>
            </div>

            {isProfileOpen && selectedUser && (
                <div className={`panel panel-profile overflow-hidden is-open ${selectedUser ? "" : ""}`}>
                    <ChatPanelBoundary resetKey={selectedUser._id}>
                        <RightSidebar />
                    </ChatPanelBoundary>
                </div>
            )}

            <AnimatePresence>
                {isProfileOpen && selectedUser && (
                    <>
                        <motion.button
                            type="button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-md"
                            onClick={() => setIsProfileOpen(false)}
                            aria-label="Close profile panel"
                        />
                        <RightSidebar mobile key="profile-drawer" />
                    </>
                )}
            </AnimatePresence>
        </main>
    );
};

export default HomePage;
