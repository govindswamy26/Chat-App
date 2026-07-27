import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext();

export const ChatProvider = ({ children })=>{

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null)
    const [unseenMessages, setUnseenMessages] = useState({})
    const [isMessagesLoading, setIsMessagesLoading] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [friendData, setFriendData] = useState({ incomingRequests: [], outgoingRequests: [], discoverUsers: [], friendCount: 0 })

    const {socket, axios} = useContext(AuthContext);

    // function to get all users for sidebar
    const getUsers = async () =>{
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(Array.isArray(data.users) ? data.users : [])
                setUnseenMessages(data.unseenMessages && typeof data.unseenMessages === "object" ? data.unseenMessages : {})
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getFriendData = async () => {
        try {
            const { data } = await axios.get("/api/friends");
            if (data.success) {
                setUsers(data.friends || []);
                setFriendData({
                    incomingRequests: data.incomingRequests || [],
                    outgoingRequests: data.outgoingRequests || [],
                    discoverUsers: data.discoverUsers || [],
                    friendCount: data.friendCount || 0,
                });
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const sendFriendRequest = async (receiverId, message) => {
        try {
            const { data } = await axios.post("/api/friends/request", { receiverId, message });
            if (data.success) {
                toast.success(data.message);
                getFriendData();
            } else toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    }

    const respondToFriendRequest = async (requestId, action) => {
        try {
            const { data } = await axios.put(`/api/friends/request/${requestId}`, { action });
            if (data.success) {
                toast.success(data.message);
                getFriendData();
            } else toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    }

    // function to get messages for selected user
    const getMessages = async (userId)=>{
        try {
            setIsMessagesLoading(true)
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success){
                setMessages(Array.isArray(data.messages) ? data.messages : [])
            }
        } catch (error) {
            toast.error(error.message)
            setMessages([])
        } finally {
            setIsMessagesLoading(false)
        }
    }

    // function to send message to selected user
    const sendMessage = async (messageData)=>{
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if(data.success){
                setMessages((prevMessages)=>[...prevMessages, data.newMessage])
                return true;
            }else{
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    }

    const deleteMessage = async (messageId) => {
        try {
            const { data } = await axios.delete(`/api/messages/${messageId}`);
            if (data.success) {
                setMessages(prevMessages => prevMessages.map(message => message._id === messageId ? { ...message, isDeleted: true } : message));
                toast.success(data.message);
            } else toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    }

    // function to subscribe to messages for selected user
    const subscribeToMessages = async () =>{
        if(!socket) return;

        socket.on("newMessage", (newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMessages)=> [...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages, [newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        })
        socket.on("messageDeleted", ({ messageId, senderId }) => {
            setMessages(prevMessages => prevMessages.map(message => message._id === messageId ? { ...message, isDeleted: true } : message));
            if (!selectedUser || senderId === selectedUser._id) toast("A message was deleted");
        })
    }

    // function to unsubscribe from messages
    const unsubscribeFromMessages = ()=>{
        if(socket) {
            socket.off("newMessage");
            socket.off("messageDeleted");
        }
    }

    useEffect(()=>{
        subscribeToMessages();
        return ()=> {
            unsubscribeFromMessages();
        };
    },[socket, selectedUser])

    const value = {
        messages, users, selectedUser, getUsers, getFriendData, sendFriendRequest, respondToFriendRequest, friendData, getMessages, sendMessage, deleteMessage, setSelectedUser, unseenMessages, setUnseenMessages, isMessagesLoading, isProfileOpen, setIsProfileOpen
    }

    return (
    <ChatContext.Provider value={value}>
            { children }
    </ChatContext.Provider>
    )
}
