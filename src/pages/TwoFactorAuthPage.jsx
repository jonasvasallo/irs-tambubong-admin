import React, { useState, useEffect } from "react";
import { auth } from "../config/firebase";
import "../styles/login.css";
import '../styles/input.css';
import { RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const TwoFactorAuthPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("+639666666666");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    
    if(auth.currentUser == null){
        alert("You must login first!");
        navigate('/login');
    } else{
        if(auth.currentUser.phoneNumber == null){
            navigate('/verify-phone');
        } else{
            setPhoneNumber(auth.currentUser.phoneNumber);
        }
    }
  }, []);

  // Set up reCAPTCHA verifier
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

  // Send verification code
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

  // Verify the code
  const handleVerifyCode = async () => {
    if (verificationCode.trim() === "") {
      setError("Please enter the verification code.");
      return;
    }
    try {
        // Use PhoneAuthProvider to create a credential from the verificationId and code
        const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
  
        // Sign in with the credential
        await signInWithCredential(auth, credential);
        setError("");
        navigate('/');
      } catch (err) {
        setError("Invalid verification code. Please try again.");
        console.error(err);
      }
  };

  return (
    <div className="main">
      <div className="form-container">
      <h2>Phone Number Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {step === 1 && (
        <>
          <div className="input-field">
            <input
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled
            />
          </div>
          <button className="button filled" onClick={handleSendCode}>Send Verification Code</button>
        </>
      )}

      {step === 2 && (
        <>
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
    </div>
  );
};

export default TwoFactorAuthPage;
