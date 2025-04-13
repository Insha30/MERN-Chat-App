import React, { useState } from 'react';
import axios from 'axios';
import { ChatState } from '../../Context/ChatProvider';
import { toast } from 'react-toastify';
import './GroupInfoModal.css';

const GroupInfoModal = ({ onClose }) => {
  const { selectedChat, setSelectedChat, user, fetchMessages } = ChatState();
  const [loading, setLoading] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);

  const handleRemove = async (userToRemove) => {
    if (selectedChat.groupAdmin._id !== user._id && userToRemove._id !== user._id) {
      toast.warn('Only Admins can remove someone!');
      return;
    }

    try {
      setLoading(true);
      setRemovingUserId(userToRemove._id);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        '/api/chat/groupremove',
        {
          chatId: selectedChat._id,
          userId: userToRemove._id,
        },
        config
      );

      setTimeout(() => {
        userToRemove._id === user._id ? setSelectedChat(null) : setSelectedChat(data);
        fetchMessages();
        setRemovingUserId(null);
        setLoading(false);
      }, 300);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Error removing user');
      setRemovingUserId(null);
      setLoading(false);
    }
  };

  const handleLeaveGroup = () => {
    handleRemove(user);
  };

  return (
    <div className="modal-overlay">
      <div className="group-info-modal">
        <div className="modal-header">
          <h2>{selectedChat.chatName}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <h4>Group Members</h4>
          <div className="group-users-list">
            {selectedChat.users.map((u) => (
              <div
                key={u._id}
                className={`group-user-badge ${removingUserId === u._id ? 'removing' : ''}`}
              >
                <span>{u.name}</span>
                {(selectedChat.groupAdmin._id === user._id || u._id === user._id) && (
                  <span
                    className="remove-icon"
                    title="Remove User"
                    onClick={() => handleRemove(u)}
                  >
                    &times;
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="leave-group-btn" onClick={handleLeaveGroup}>
            Leave Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;
