import React, { useEffect, useState } from 'react';
import "../styles/login.css";
import { InputField } from '../components/InputField';
import { InputButton } from '../components/InputButton';
import { auth, firestore } from '../config/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);

  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const navigate = useNavigate();

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 2 * 60 * 1000;

  useEffect(() => {
    let timerInterval;

    if (isLocked) {
      setLockoutTimer(LOCKOUT_DURATION / 1000); // Initialize timer in seconds

      timerInterval = setInterval(() => {
        setLockoutTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            setIsLocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [isLocked]);

  useEffect(() => {
    auth.signOut();
  }, []);

  const login = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (isLocked) {
      setErrorMsg(`Too many failed attempts. Please wait ${lockoutTimer} seconds before trying again.`);
      return;
    }

    setButtonLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.user_type !== 'admin' && userData.user_type !== 'moderator') {
          await signOut(auth);
          alert("You do not have the necessary permissions to access this system.");
          setErrorMsg("Unauthorized access.");
          return;
        }

        if(userData.mfa_enabled != null && userData.mfa_enabled == true){
          navigate('/phone-auth');
          return;
        }
      } else {
        setErrorMsg("User document does not exist");
        throw new Error("User document does not exist.");
      }
      
      setLoginAttempts(0);
      setEmail("");
      setPassword("");
      setErrorMsg("");
      navigate("/");
    } catch (error) {
      if(error.code == "auth/wrong-password"){
        setLoginAttempts(prev => prev + 1);
        if (loginAttempts + 1 >= MAX_ATTEMPTS) {
          setIsLocked(true);
          setErrorMsg("Too many failed attempts. Please wait 2 minutes before trying again.");
        } else {
          setErrorMsg(`Login failed. You have ${MAX_ATTEMPTS - (loginAttempts + 1)} attempt(s) left.`);
        }
      } else{
        setErrorMsg(error.message);
      }
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <div className='main'>
      <div className="head">
        <img
          src={logo}
          alt=""
          width={120}
          height={120}
          style={{'borderRadius' : '120px'}}
        />
        <span className='heading-m color-major'>Tambubong IRS</span>
      </div>

      <div className="form-container">
        {errorMsg && (
          <div className="statusContainer" id='error'>
            {errorMsg}
          </div>
        )}
        <form onSubmit={login}>
          <InputField
            label="Email Address"
            placeholder="Email Address"
            type="email"
            onChange={setEmail}
            msgError="Email must be valid!"
          />
          <InputField
            label="Password"
            placeholder="Password"
            type="password"
            onChange={setPassword}
            msgError="Password is required!"
            last={true}
          />
          <InputButton
            label={buttonLoading ? "Loading..." : "Sign In"}
            buttonType="filled"
            type="submit"
            onClick={() => setButtonLoading(true)}
          />
        </form>

        <Link to={'/forgot-password'} className='link'>Forgot Password?</Link>
      </div>
    </div>
  );
};

export default LoginPage;
