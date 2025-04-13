import React, { useState } from 'react';
import './GroupChatModal.css';
import { ChatState } from '../../Context/ChatProvider';
import axios from 'axios';
import { toast } from 'react-toastify';

const GroupChatModal = ({ isOpen, onClose, user, fetchChats }) => {
  const { chats, setChats } = ChatState();

  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupPic, setGroupPic] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setSearchResult(data);
    } catch (error) {
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupPicUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      toast.warning('Please select an image');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'chat-app'); // Replace
    formData.append('cloud_name', 'dptvxjzxw'); // Replace

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dptvxjzxw/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setGroupPic(data.url);
      toast.success('Picture uploaded!');
    } catch (error) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addUser = (userToAdd) => {
    if (selectedUsers.find((u) => u._id === userToAdd._id)) {
      toast.warning('User already added');
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const removeUser = (userToRemove) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userToRemove._id));
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length < 2) {
      toast.warning('Group name and at least 2 users required');
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.post(
        '/api/chat/group',
        {
          name: groupName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
          pic: groupPic,
        },
        config
      );

      setChats([data, ...chats]);
      fetchChats();
      onClose();
    } catch (error) {
      toast.error('Failed to create group chat');
    }
  };

  return isOpen ? (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="group-modal">
        <h2>Create Group Chat</h2>

        <input
          type="text"
          placeholder="Group Name"
          className="group-input"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <div className="file-upload-wrapper">
          <label className="upload-label">
            Upload Group Picture
            <input type="file" accept="image/*" onChange={handleGroupPicUpload} />
          </label>
          {uploading && <p>Uploading...</p>}
          {groupPic && <img src={groupPic} alt="Group" className="group-preview-pic" />}
        </div>

        <input
          type="text"
          placeholder="Add users"
          className="group-input"
          onChange={(e) => handleSearch(e.target.value)}
        />

        <div className="selected-users">
          {selectedUsers.map((u) => (
            <div className="badge" key={u._id}>
              {u.name}
              <span onClick={() => removeUser(u)}>×</span>
            </div>
          ))}
        </div>

        <div className="search-result">
          {loading ? (
            <p>Searching...</p>
          ) : (
            searchResult.map((u) => (
              <div key={u._id} className="search-user-item" onClick={() => addUser(u)}>
                <img src={u.pic} alt={u.name} />
                <div>
                  <strong>{u.name}</strong>
                  <p>{u.email}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="create-btn" onClick={handleCreateGroup}>
          Create Group
        </button>
      </div>
    </>
  ) : null;
};

export default GroupChatModal;
