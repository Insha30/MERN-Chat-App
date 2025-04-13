import React, { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import "./SideDrawer.css"; 
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const SideDrawer = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingChat , setLoadingChat] = useState(false);
  const [search , setSearch ] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user , setSelectedChat, chats, setChats } = ChatState();
  const navigate = useNavigate(); 

  const toggleDropdown = () => setShowMenu(!showMenu);
  
  const handleProfileClick = () => {
    setShowProfileModal(true);
    setShowMenu(false);
  };

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate('/');
  };

  const handleSearch = async () => {
    if (!search) {
      toast.warning("Please enter something to search");
      return;
    }
    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data);
    } catch (error) {
      toast.error("Failed to load search results.");
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    setLoadingChat(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post("/api/chat", { userId }, config);

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      setDrawerOpen(false);
    } catch (error) {
      toast.error("Failed to access chat");
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="sidedrawer">
      <button className="search-btn" onClick={() => setDrawerOpen(true)}>
        <i className="fa-solid fa-magnifying-glass"></i>&nbsp; Search User
      </button>

      <div className="sidedrawer-title">
        <img src='/logo2.jpg' alt="Yapper Logo" className="sidedrawer-logo"/>
        <span>Yapper</span>
      </div>

      <div className="right-section">
        <i className="fa-solid fa-bell bell-icon"></i>

        <div className="avatar-container" onClick={toggleDropdown}>
          <img
            src={user?.pic || "https://i.pravatar.cc/40"}
            alt={user?.name || "User Avatar"}
            className="avatar-img"
          />
          <LuChevronDown />
          {showMenu && (
            <ul className="dropdown-menu">
              <li className="dropdown-item" onClick={handleProfileClick}>👤 My Profile</li>
              <li className="dropdown-item" onClick={logoutHandler}>↪ Logout</li>
            </ul>
          )}
        </div>
      </div>

      {showProfileModal && (
        <ProfileModal
          user={user}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {drawerOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}></div>
          <div className="search-drawer open" onClick={(e) => e.stopPropagation()}>
            <h3>Search Users</h3>
            <div className="drawer-input-group">
              <input
                type="text"
                placeholder="Search by name or email"
                className="drawer-input"
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="drawer-search-btn" onClick={handleSearch}>
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>

            <div className="search-results">
              {loading ? (
                <div className="spinner-container">
                  <div className="spinner"></div>
                  <p>Searching...</p>
                </div>
              ) : searchResult.length > 0 ? (
                searchResult.map((user) => (
                  <div
                    key={user._id}
                    className="search-result-item"
                    onClick={() => accessChat(user._id)}
                  >
                    <img src={user.pic} alt={user.name} />
                    <div>
                      <p><strong>{user.name}</strong></p>
                      <p>{user.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                search && <p className="no-result-text">No results found.</p>
              )}
            </div>

            <button className="close-drawer" onClick={() => setDrawerOpen(false)}>Close</button>
          </div>
        </>
      )}
    </div>
  );
};

export default SideDrawer;
