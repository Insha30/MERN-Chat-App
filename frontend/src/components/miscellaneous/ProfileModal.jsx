import React, { useState } from "react";
import "./ProfileModal.css";

const ProfileModal = ({ user, isOpen , onClose }) => {
    if (!isOpen) return null;
    console.log("Rendering Profile Modal...");

  return (
    <>
      {isOpen && (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{user?.name}</h2>
            <img src={user?.pic} alt={user?.name} className="modal-avatar" />
            <p>Email: {user?.email}</p>
            <button onClick={onClose} className="close-button">Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModal;
