import React, { useState, useEffect } from "react";
import { auth } from "../config/firebase";
import "../styles/login.css";
import '../styles/input.css';
import { RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, linkWithCredential } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const VerifyPhonePage = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationId, setVerificationId] = useState("");
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const setUpRecaptcha = () => {
        window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: (response) => {
              console.log("Recaptcha verified");
            },
            "expired-callback": () => {
              setError("Recaptcha expired. Please refresh and try again.");
            },
          },
        );
      };

      const handleSendCode = async () => {
        if (phoneNumber.trim() === "") {
          setError("Please enter a phone number.");
          return;
        }
        try {
          setUpRecaptcha();
          const appVerifier = window.recaptchaVerifier;
    
          const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
          setVerificationId(confirmationResult.verificationId);
          setStep(2); // Move to the verification step
          setError("");
        } catch (err) {
          setError("Failed to send verification code. Please try again.");
          console.error(err);
        }
      };

      const handleVerifyCode = async () => {
        if (verificationCode.trim() === "") {
          setError("Please enter the verification code.");
          return;
        }
        try {
          // Create a phone credential using the verification code
          const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    
          // Check if user is authenticated
          if (auth.currentUser) {
            // Link the phone number to the current logged-in user
            await linkWithCredential(auth.currentUser, credential);
            setError("");
            navigate('/');
          } else {
            setError("No user is logged in. Please log in first.");
            navigate('/login');
          }
        } catch (err) {
          setError(`Invalid verification code or failed to link phone number. ${err.message}`);
          console.error(err);
        }
      };

  return (
    <div className="main">
        <div className="form-container">
            <span className="subheading-m color-major">Verify your phone number</span>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {step === 1 && (
        <>
          <div className="input-field">
            <input
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <button className="button filled" onClick={handleSendCode}>Send Verification Code</button>
        </>
      )}

      {step === 2 && (
        <>
        
        <div>
        <span className="status success">OTP sent to {phoneNumber}</span>
        </div>
          <div className="input-field">
          <input
            type="text"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          </div>
          <button className="button filled" onClick={handleVerifyCode}>Verify Code</button>
        </>
      )}

      <div id="recaptcha-container"></div>
        </div>

        <Link to={'/login'}>Go back to Login</Link>
    </div>
  )
}

export default VerifyPhonePage