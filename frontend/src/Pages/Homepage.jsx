import React, { useState, useEffect } from "react";
import Signup from "../components/Authentication/Signup";
import Login from "../components/Authentication/Login";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../Context/ChatProvider";

const Homepage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const { setUser } = ChatState();
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
      setUser(userInfo);
      navigate("/chats");
    }
  }, [navigate, setUser]);

  return (
    <div className="container">
      <div className="header">
        <h1>Yapper</h1>
      </div>

      <div className="tabs">
        <div className="tab-list">
          <div
            className={`tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </div>
          <div
            className={`tab ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => setActiveTab("signup")}
          >
            Signup
          </div>
        </div>
        <div className="tab-content">
          {activeTab === "login" ? <Login /> : <Signup />}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
