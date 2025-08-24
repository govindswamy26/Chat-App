import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext'

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages } = useContext(ChatContext)
  const { logout, onlineUsers } = useContext(AuthContext)

  const [input, setInput] = useState('')
  const navigate = useNavigate()

  const filteredUsers = input
    ? users.filter((user) => user.fullName.toLowerCase().includes(input.toLowerCase()))
    : users

  useEffect(() => {
    getUsers()
  }, [onlineUsers])

  return (
    <div className={`bg-gray-900/40 h-full p-6 rounded-r-2xl overflow-y-scroll text-white backdrop-blur-lg ${selectedUser ? 'max-md:hidden' : ''}`}>
      {/* top header */}
      <div className="pb-6">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="w-10" />
          <div className="relative group">
            <img src={assets.menu_icon} alt="Menu" className="h-6 cursor-pointer" />
            <div className="absolute top-full right-0 z-20 w-36 p-4 rounded-lg bg-gray-800 border border-gray-600 text-gray-100 hidden group-hover:block shadow-lg">
              <p onClick={() => navigate('/profile')} className="cursor-pointer text-sm hover:text-violet-400">
                Edit Profile
              </p>
              <hr className="my-2 border-gray-600" />
              <p onClick={() => logout()} className="cursor-pointer text-sm hover:text-red-400">
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* search box */}
        <div className="bg-gray-800 rounded-full flex items-center gap-3 py-3 px-4 mt-6">
          <img src={assets.search_icon} alt="Search" className="w-4" />
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-sm placeholder-gray-400 flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>

      {/* users list */}
      <div className="flex flex-col gap-2">
        {filteredUsers.map((user, index) => (
          <div
            onClick={() => {
              setSelectedUser(user)
              setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }))
            }}
            key={index}
            className={`relative flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-800/60 transition ${
              selectedUser?._id === user._id && 'bg-violet-600/40'
            }`}
          >
            <img src={user?.profilePic || assets.avatar_icon} alt="" className="w-10 h-10 rounded-full" />
            <div className="flex flex-col leading-tight">
              <p className="text-base font-medium">{user.fullName}</p>
              {onlineUsers.includes(user._id) ? (
                <span className="text-green-400 text-xs">Online</span>
              ) : (
                <span className="text-neutral-400 text-xs">Offline</span>
              )}
            </div>
            {unseenMessages[user._id] > 0 && (
              <p className="absolute top-3 right-3 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500 text-white">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sidebar
