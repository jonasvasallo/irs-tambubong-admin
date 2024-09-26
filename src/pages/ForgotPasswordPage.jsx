import React, { useState } from 'react'
import "../styles/login.css";
import { Link } from 'react-router-dom';
import '../styles/input.css';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
const ForgotPasswordPage = () => {

    const [email ,setEmail] = useState("");
    const [error, setErrorMsg] = useState("");
    const [success, setSuccess] = useState("");

    const sendEmailCode = async () => {
        setErrorMsg("");
        setSuccess("");
        if(email.length == 0) {
            setErrorMsg("Enter your email first!");
            return;
        }

        try{
            await sendPasswordResetEmail(auth, email);
            setSuccess("Password reset link has been sent to your email.");
        } catch(err){
            setErrorMsg(err.message);
        }
    }

  return (
    <div className="main">
        <div className="form-container">
            <div className="flex col gap-8">
                <span className="subheading-m color-major">Forgot Password</span>
                <span className="body-m color-minor">Enter your email and we'll send you a link to reset your password.</span>
                <div className="input-field">
                    <input type="email" name="" id="" placeholder='johndoe@email.com' onChange={(e) => setEmail(e.target.value)}/>
                </div>
                {error && <span className='status error'>{error}</span>}
                {success && <span className='status success'>{success}</span>}
                <button className="button filled" onClick={() => sendEmailCode()}>Submit</button>
                <Link to={'/login'} className='link'>Back to Login</Link>
            </div>
            
        </div>
    </div>
  )
}

export default ForgotPasswordPage