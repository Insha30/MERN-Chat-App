import React , {useState} from 'react'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

const Login = () => {

   const [ formData , setFormData] = useState({
      email : '',
      password : ''
    });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    setFormData((currData) => ({
      ...currData,
      [event.target.name]: event.target.value
    }));
  };

  //Using  toastify library from NPM for the form validations
  const validateForm = () => {
    const { email, password } = formData;

    if (!email || !password) {
      toast.error('All fields are required!',{
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
      toast.error('Please enter a valid email address!' ,{
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
      toast.error('Password must be at least 6 characters long!' ,{
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

  const submitHandler = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-type': 'application/json'
        }
      };

      const { data } = await axios.post(
        'http://localhost:5000/api/user/login',
        {
          email: formData.email,
          password: formData.password
        },
        config
      );

      toast.success('Login successful!', {
        position: 'top-right',
        autoClose: 3000,
        style: {
          backgroundColor: '#28a745',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px'
        }
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
      setFormData({ email: '', password: '' });
      setLoading(false);
      navigate('/chats');
    } catch (error) {
      console.error('Login Error:', error);
      toast.error(error.response?.data?.message || 'Something went wrong!', {
        position: 'top-right',
        autoClose: 3000,
        style: {
          backgroundColor: '#FF6B6B',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px'
        }
      });
      setLoading(false);
    }
  };

  return (
   <>
     <form onSubmit={submitHandler} className="login-form">
        <ToastContainer/>
        <div className="input-container">
          <input
            placeholder=""
            type="email"
            value={formData.email}
            id="email"
            name="email"
            onChange={handleInputChange}
          />
          <label htmlFor="email">Email</label>
        </div>

        <div className="input-container">
          <input
            placeholder=""
            type={showPassword ? "text" : "password"}
            value={formData.password}
            id="password"
            name="password"
            onChange={handleInputChange}
          />
          <label htmlFor="password">Password</label>
        </div>

        <div className="checkbox-container">
          <input
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          <label htmlFor="showPassword">Show Password</label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Submit'}
        </button>
      </form>
   </>
  )
};

export default Login
