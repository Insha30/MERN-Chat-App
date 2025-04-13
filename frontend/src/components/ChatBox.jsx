import React, { useEffect, useState } from 'react';
import { ChatState } from '../Context/ChatProvider';
import './ChatBox.css';
import GroupInfoModal from './miscellaneous/GroupInfoModal';
import EmojiPicker from 'emoji-picker-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import io from 'socket.io-client';

const ENDPOINT = "http://localhost:5000";
let socket, selectedChatCompare;

const ChatBox = () => {
  const { selectedChat, user, setSelectedChat, setChats, chats } = ChatState();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => console.log("Socket connected"));

    socket.on("message received", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);

      socket.emit("message delivered", {
        messageId: newMessage._id,
        chatId: selectedChat._id,
      });
    });

    socket.on("message delivered", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, delivered: true } : msg
        )
      );
    });

    socket.on("message read", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, read: true } : msg
        )
      );
    });
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      socket.emit("join chat", selectedChat._id);
    }
  }, [selectedChat]);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoadingMessages(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoadingMessages(false);

      data.forEach((msg) => {
        socket.emit("message read", {
          messageId: msg._id,
          chatId: selectedChat._id,
        });
      });

    } catch (error) {
      console.error('Failed to load messages', error);
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "/api/message",
        { content: message, chatId: selectedChat._id },
        config
      );

      setMessage('');
      setMessages([...messages, data]);
      socket.emit("new message", data);

      const chatBody = document.querySelector('.chatbox-body');
      if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;

    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const getSender = (chat) => {
    const otherUser = chat?.users?.find((u) => u._id !== user._id);
    return otherUser?.username || chat.chatName || 'No Chat Selected';
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const updateChat = (updatedChat) => {
    setChats(chats.map(c => (c._id === updatedChat._id ? updatedChat : c)));
    setSelectedChat(updatedChat);
  };

  return (
    <motion.div className="chatbox-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="chatbox-header">
        <h3
          onClick={() => selectedChat?.isGroupChat && setIsInfoOpen(true)}
          style={{ cursor: selectedChat?.isGroupChat ? 'pointer' : 'default' }}
        >
          {selectedChat ? getSender(selectedChat) : 'Select a chat'}
        </h3>
        {selectedChat && (
          <button className="chatbox-close-btn" onClick={() => setSelectedChat(null)}>✖</button>
        )}
      </div>

      <div className="chatbox-body">
        {selectedChat ? (
          loadingMessages ? (
            <div className="loading-messages">Loading chats...</div>
          ) : (
            <div className="message-list">
              {messages.map((msg) => (
                <motion.div
                  className={`message ${msg.sender._id === user._id ? 'sent' : 'received'}`}
                  key={msg._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <img src={msg.sender.pic} alt="avatar" className="avatar" />
                  <div className="message-content">
                    <span className="sender-name">{msg.sender.username}</span>
                    <p>{msg.content}</p>
                    <p className="message-status">
                      {msg.read ? '✓✓ Read' : msg.delivered ? '✓ Delivered' : '✓ Sent'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <p style={{ color: '#999' }}>No chat selected yet</p>
        )}
      </div>

      {selectedChat && (
        <div className="chatbox-footer">
          {showEmojiPicker && (
            <div className="emoji-picker-wrapper">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <div className="input-wrapper">
            <button className="emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
            <input
              type="text"
              placeholder={isTyping ? 'Typing...' : 'Enter a message...'}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 1000);
              }}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button className="send-btn" onClick={sendMessage}>➤</button>
          </div>
        </div>
      )}

      {isInfoOpen && selectedChat?.isGroupChat && (
        <GroupInfoModal
          chat={selectedChat}
          onClose={() => setIsInfoOpen(false)}
          updateChat={updateChat}
        />
      )}
    </motion.div>
  );
};

export default ChatBox;
