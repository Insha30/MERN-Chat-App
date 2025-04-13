import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChatState } from '../Context/ChatProvider';
import { toast } from 'react-toastify';
import './MyChats.css';
import GroupChatModal from './miscellaneous/GroupChatModal'; 
import { AiOutlineClose } from "react-icons/ai";
import { Tooltip } from 'react-tooltip';

const MyChats = () => {
  const { user, chats, setChats, selectedChat, setSelectedChat } = ChatState();
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get('/api/chat', config);
      setChats(data);
    } catch (error) {
      toast.error('Failed to load chats.');
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const getChatName = (chat) => {
    if (!chat.isGroupChat) {
      const otherUser = chat.users.find((u) => u._id !== user._id);
      return otherUser?.name || 'Unknown';
    }
    return chat.chatName;
  };

  const getChatAvatar = (chat) => {
    const otherUser = chat.users.find((u) => u._id !== user._id);
    return otherUser?.pic || '/default-avatar.png';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const removeUserFromGroup = async (chatId, userId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put("/api/chat/groupremove", { chatId, userId }, config);
      setChats(chats.map(c => c._id === data._id ? data : c));
      if (selectedChat && selectedChat._id === chatId) {
        setSelectedChat(data);
      }
      toast.success("User removed successfully");
    } catch (error) {
      toast.error("Failed to remove user");
    }
  };

  return (
    <>
      <div className="mychats-container">
        <div className="mychats-header">
          <h2>My Chats</h2>
          <button className="new-chat-btn" onClick={() => setGroupModalOpen(true)}>
            + Group
          </button>
        </div>
        <div className="chat-list">
          {chats.length === 0 ? (
            <p className="no-chats-text">No chats available</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                className={`chat-item ${selectedChat?._id === chat._id ? 'selected' : ''}`}
                onClick={() => setSelectedChat(chat)}
              >
                <img src={getChatAvatar(chat)} alt="avatar" className="chat-avatar" />
                <div className="chat-details">
                  <div className="chat-header">
                    <strong>{getChatName(chat)}</strong>
                    <span className="chat-time">
                      {formatTimestamp(chat.latestMessage?.updatedAt)}
                    </span>
                  </div>
                  <div className="chat-preview">
                    {chat.latestMessage ? (
                      <>
                        <span className="chat-sender">{chat.latestMessage.sender.name}: </span>
                        <span>{chat.latestMessage.content.slice(0, 30)}...</span>
                      </>
                    ) : (
                      <span>No messages yet</span>
                    )}
                  </div>
                </div>
                {chat.isGroupChat && chat.groupAdmin?._id === user._id && (
                  <AiOutlineClose
                    data-tooltip-id="tooltip"
                    data-tooltip-content="Remove a user from group"
                    className="remove-user-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.info("Use group chat settings to remove users.");
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <GroupChatModal
        user={user}
        isOpen={isGroupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        fetchChats={fetchChats}
      />
      <Tooltip id="tooltip" place="top" />
    </>
  );
};

export default MyChats;
