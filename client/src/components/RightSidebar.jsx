import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext)
  const { logout, onlineUsers } = useContext(AuthContext)
  const [msgImages, setMsgImages] = useState([])

  useEffect(() => {
    setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image))
  }, [messages])

  return (
    selectedUser && (
      <div className={`bg-gray-900/50 backdrop-blur-lg text-white w-full relative overflow-y-scroll ${selectedUser ? 'hidden md:block' : ''}`}>
        <div className="pt-14 flex flex-col items-center gap-4 text-sm mx-auto">
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt=""
            className="w-24 h-24 rounded-full border-2 border-violet-500 shadow-md"
          />
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
            {selectedUser.fullName}
          </h1>
          <p className="px-6 text-gray-300 text-center">{selectedUser.bio}</p>
        </div>

        <hr className="border-gray-700 my-5" />

        <div className="px-6 text-sm">
          <p className="font-medium text-gray-400 mb-3">Media</p>
          <div className="max-h-[220px] overflow-y-scroll grid grid-cols-2 gap-3">
            {msgImages.map((url, index) => (
              <div key={index} onClick={() => window.open(url)} className="cursor-pointer rounded overflow-hidden shadow">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-violet-700 text-white text-sm font-medium py-2 px-10 rounded-full shadow-md hover:opacity-90"
        >
          Logout
        </button>
      </div>
    )
  )
}

export default RightSidebar
