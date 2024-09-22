
import "../styles/login.css";
import React, {useState} from 'react'
import { InputField } from '../components/InputField';
import { InputButton } from '../components/InputButton';

const UpdatePasswordPage = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const updatePassword = async (e) => {
        e.preventDefault();

        const data = new FormData(e.target);

        setErrorMessage("");

        if(currentPassword.length == 0 || newPassword.length == 0 || confirmPassword.length == 0){
            setErrorMessage("You are missing some fields");
            return;
        }


    }
  return (
    <div className="main">
        <div className="head">
            <div className="form-container flex col">
                <span className="subheading-l color-major">Your password is expired.</span>
                <br />
                <span className="body-m color-minor">Please update your password to reduce the chance of your account being compromised.</span>
                <InputField
                    label="Current Password"
                    placeholder="Your current password"
                    type="password"
                    onChange={setCurrentPassword}
                    msgError="Password must be 12 characters long, has a special character, and one uppercase letter"
                />
                <InputField
                    label="New Password"
                    placeholder="Your new password"
                    type="password"
                    onChange={setNewPassword}
                    msgError="Password must be 12 characters long, has a special character, and one uppercase letter"
                />
                <InputField
                    label="Confirm Password"
                    placeholder="Must match your new password"
                    type="password"
                    onChange={setConfirmPassword}
                    msgError="Password must be 12 characters long, has a special character, and one uppercase letter"
                />
                {errorMessage && <span className="status error">{errorMessage}</span>}
                <br />
                <InputButton
                    label={"Update Password"}
                    buttonType="filled"
                    type="submit"
                    onClick={() => updatePassword()}
                />
            </div>
        </div>
    </div>
  )
}

export default UpdatePasswordPage