import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    pic: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading , setLoading] = useState(false);
  const navigate = useNavigate();
  
  const postDetails = async (pics) => {
    setLoading(true);
  
    if (!pics) {
      toast.error('Please select an image!', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#ff4d4d', color: 'white', fontWeight: 'bold' },
      });
      setLoading(false);
      return;
    }
  
    if (pics.type !== 'image/jpeg' && pics.type !== 'image/png') {
      toast.error('Only JPEG and PNG formats are allowed!', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#ff4d4d', color: 'white', fontWeight: 'bold' },
      });
      setLoading(false);
      return;
    }
    
    const formData = new FormData();
    formData.append("file", pics);

    try {
      const res = await fetch("http://localhost:5000/api/user/upload", {
        method: 'POST',
        body: formData,
      });
  
      if (!res.ok) {
        throw new Error('Failed to upload image');
      }
  
      const result = await res.json();
      setFormData((prev) => ({
        ...prev,
        pic: result.url,
      }));
      toast.success('Image uploaded successfully!', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#28a745', color: 'white', fontWeight: 'bold' },
      });
    } catch (error) {
      toast.error('Image upload failed! Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#ff4d4d', color: 'white', fontWeight: 'bold' },
      });
    } finally {
      setLoading(false);
    }
  };  

  const handleInputChange = (event) => {
    setFormData((currData) => {
      return { ...currData, [event.target.name]: event.target.value };
    });
  };

  const validateForm = () => {
    const { username, email, password } = formData;

    if (!username || !email || !password) {
      toast.error('All fields are required!',{
        position: 'top-right',
        autoClose: 3000,
        style: {
          backgroundColor: '#ff4d4d',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px'
        }
      });
      return false;
    };

    if (username.length < 3) {
      toast.error('Username must be at least 3 characters long!',{
        position: 'top-right',
        autoClose: 3000,
        style: {
          backgroundColor: '#FF6B6Bd',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px'
        }
      });
      return false;
    };

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address!',{
        position: 'top-right',
        autoClose: 3000,
        style: {
          backgroundColor: '#FF6B6Bd',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px'
        }
      });
      return false;
    };

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long!',{
        position: 'top-right',
        autoClose: 3000,
        style: {
          backgroundColor: '#FF6B6Bd',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px'
        }
      });
      return false;
    };
    return true;
  };

  const submitHandler = async() => {
    setLoading(true);

    const { username, email, password } = formData;

    if (!username || !email || !password ) {
      toast.warning("Please fill out the feilds.." , {position:'top-right'});
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers : {
          "Content-type" : "application/json"
        },
      };  

      const { data } = await axios.post("http://localhost:5000/api/user/register",{
        username: formData.username,
        email: formData.email,
        password: formData.password,
        pic: formData.pic,
      }, config);
      
      toast.success("Registration Successfull" , {position : 'top-right'});

      localStorage.setItem('userInfo',JSON.stringify(data));  
      setLoading(false);
      navigate('/chats');

    } catch (error) {
      console.error("Signup Error:", error);

      toast.error(error.response?.data?.message || "Something went wrong!", {
        position: "top-right",
      });
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  
    if (validateForm()) {
      submitHandler();
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="signup-form">
      <ToastContainer />
      
      <div className="input-container">
        <input
          placeholder=" "
          type="text"
          value={formData.username}
          id="username"
          name="username"
          onChange={handleInputChange}
        />
        <label htmlFor="username">Username</label>
      </div>

      <div className="input-container">
        <input
          placeholder=" "
          type="email"
          value={formData.email}
          id="email"
          name="email"
          onChange={handleInputChange}
        />
        <label htmlFor="email">Email</label>
      </div>

      <div className="input-container password-container">
        <input
          placeholder=" "
          type={showPassword ? "text" : "password"}
          value={formData.password}
          id="password"
          name="password"
          onChange={handleInputChange}
        />
        <label htmlFor="password">Password</label>
        <input
          type="checkbox"
          id="showPassword"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
          className="show-password-checkbox"
        />
      </div>

      <div className="file-input-container">
          <label htmlFor="pic">Upload Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            id="pic"
            name="pic"
            onChange={(e) => postDetails(e.target.files[0])}
            className="file-input"
          />
          <button
            type="button"
            className="upload-button"
            onClick={() => document.getElementById('pic').click()}
          >
            Choose File
          </button>
        </div>

      <button 
        type="submit"
        >Submit
      </button>
    </form>
    </> 
  );
};

export default Signup;
