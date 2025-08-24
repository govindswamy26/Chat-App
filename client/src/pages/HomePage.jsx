import React from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import { useContext } from 'react'
import { ChatContext } from '../../context/ChatContext'

const HomePage = () => {

    const {selectedUser} = useContext(ChatContext)

  return (
   <div className='border w-full h-screen sm:px-[10%] sm:py-[3%] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
  <div className={`backdrop-blur-2xl border border-gray-700 rounded-3xl overflow-hidden h-full grid grid-cols-1 relative shadow-xl ${selectedUser ? 'md:grid-cols-[1fr_1.7fr_1fr] xl:grid-cols-[1fr_2.2fr_1fr]' : 'md:grid-cols-2'}`}>
    <Sidebar />
    <ChatContainer />
    <RightSidebar/>
  </div>
</div>

  )
}

export default HomePage
