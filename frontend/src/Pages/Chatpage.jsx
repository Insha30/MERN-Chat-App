import React from 'react';
import { ChatState } from '../Context/ChatProvider';
import { Box } from '@chakra-ui/react';
import SideDrawer from '../components/miscellaneous/SideDrawer';
import MyChats from '../components/MyChats';
import ChatBox from '../components/ChatBox';
import './Chatpage.css';

const Chatpage = () => {
  const { user, selectedChat, chats } = ChatState();

  const showChatSection = chats.length > 0;

  return (
    <div className="chatpage-bg">
      {user && <SideDrawer />}
      <Box className="chat-container">
        {user && showChatSection && <MyChats />}
        {user && selectedChat && <ChatBox />}
      </Box>
    </div>
  );
};

export default Chatpage;
