import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext)
  const { authUser, onlineUsers } = useContext(AuthContext)

  const scrollEnd = useRef()
  const [input, setInput] = useState('')

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (input.trim() === '') return
    await sendMessage({ text: input.trim() })
    setInput('')
  }

  const handleSendImage = async (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Select a valid image file')
      return
    }
    const reader = new FileReader()
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result })
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id)
    }
  }, [selectedUser])

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-xl bg-gray-900/40">
      {/* header */}
      <div className="flex items-center gap-4 py-4 px-6 border-b border-gray-700">
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-10 h-10 rounded-full" />
        <p className="flex-1 text-lg text-white font-medium flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
        </p>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className="md:hidden w-7 cursor-pointer" />
        <img src={assets.help_icon} alt="" className="hidden md:block w-5" />
      </div>

      {/* chat messages */}
      <div className="flex flex-col h-[calc(100%-140px)] overflow-y-scroll px-6 pb-10 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-3 ${msg.senderId === authUser._id ? 'justify-end' : 'justify-start'}`}>
            {msg.image ? (
              <img src={msg.image} alt="" className="max-w-[280px] border border-gray-600 rounded-xl shadow-md" />
            ) : (
              <p
                className={`px-4 py-2 text-base rounded-2xl break-words text-white shadow-sm ${
                  msg.senderId === authUser._id
                    ? 'bg-violet-600/70 rounded-br-none'
                    : 'bg-gray-700/70 rounded-bl-none'
                }`}
              >
                {msg.text}
              </p>
            )}
            <div className="text-center text-xs text-gray-400">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt=""
                className="w-8 h-8 rounded-full mb-1"
              />
              <p>{formatMessageTime(msg.createdAt)}</p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      {/* input area */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-4 bg-gray-800/40 backdrop-blur-md">
        <div className="flex-1 flex items-center bg-gray-700/40 px-4 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === 'Enter' ? handleSendMessage(e) : null)}
            type="text"
            placeholder="Type a message..."
            className="flex-1 text-base py-3 bg-transparent border-none outline-none text-white placeholder-gray-400"
          />
          <input onChange={handleSendImage} type="file" id="image" accept="image/png, image/jpeg" hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" className="w-6 mr-2 cursor-pointer" />
          </label>
        </div>
        <img onClick={handleSendMessage} src={assets.send_button} alt="" className="w-8 cursor-pointer" />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-4 text-gray-400 bg-gray-900/30 max-md:hidden">
      <img src={assets.logo_icon} className="w-16" alt="" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatContainer
