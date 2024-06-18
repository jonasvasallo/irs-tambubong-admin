import React, { useState } from 'react';
import "../styles/login.css";
import { InputField } from '../components/InputField';
import { InputButton } from '../components/InputButton';
import { auth, firestore } from '../config/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setErrorMsg("");
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
      } else {
        throw new Error("User document does not exist.");
      }

      setEmail("");
      setPassword("");
      setErrorMsg("");
      navigate("/");
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <div className='main'>
      <div className="head">
        <img
          src="https://scontent.fmnl4-6.fna.fbcdn.net/v/t1.6435-9/36347143_115056176069864_1083116285908221952_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeHrCWnJOJQez0Io7WSUv8qolKwTUflGxR-UrBNR-UbFH_P7hdCfbZevBSBsCLOco4Y8DGT3ESTcPEAJt6tDlpu_&_nc_ohc=3Kl8tyEKm-EQ7kNvgF69L96&_nc_ht=scontent.fmnl4-6.fna&oh=00_AYCbYbPuRNCesdq17hVd1IxzcUR-5HyoKYxwjVvHkPPFVg&oe=6674F6C0"
          alt=""
          width={120}
          height={120}
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

        <a href="" className='link'>Forgot Password?</a>
      </div>
    </div>
  );
};

export default LoginPage;
