import { FieldValue, addDoc, collection, deleteField, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, {useState} from 'react'
import { Link } from 'react-router-dom';
import { firestore } from '../config/firebase';

const VerifyUser = (props) => {
    const userDocRef = doc(firestore, "users", props.id);
    const [isDenySectionVisible, setIsDenySectionVisible] = useState(false);
    const [denyReason, setDenyReason] = useState();
    
    const showDenyField = () => {
        setIsDenySectionVisible(true);
    }

    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState("");

    const acceptVerification = async () =>{
        setSuccess("");
        setErrorMsg('');
        try{
            await updateDoc(userDocRef, {
                verified: true,
            });

            setSuccess("User has been verified");
            window.location.reload();
        } catch(error){
            setErrorMsg(error.message);
        }
    }


    const denyVerification = async () => {
        setSuccess("");
        setErrorMsg('');
        if(!denyReason){
            setErrorMsg("Please input denial reason!");
            return;
        }
        
        const notificationCollectionRef = collection(userDocRef, "notifications");

        try{
            await updateDoc(userDocRef, {
                verification_photo : deleteField(),
            });
            await addDoc(notificationCollectionRef, {
                title: 'Account verification denied',
                content: `Your account verification has been denied. Reason: ${denyReason}. Please upload your identification once again in update profile section.`,
                timestamp: serverTimestamp(),
            })

            
            setSuccess("Verification has been denied.");
            window.location.reload();
        } catch(error){
            setErrorMsg(error.message);
        }
    }
  return (
    <div className='flex col gap-8'>
        <div>
            <Link to={props.image}><img src={props.image} alt="" className='w-100' height={150} style={{objectFit: 'cover'}}/></Link>
        </div>
        {!isDenySectionVisible && (
                <div id='approve-section' className="flex main-between gap-8">
                    <button className="button secondary w-100" onClick={() => acceptVerification()}>Approve</button>
                    <button className='button filled w-100' onClick={showDenyField}>Deny</button>
                </div>
            )}
        {isDenySectionVisible && (
            <div id="deny-section">
                <textarea name="" id="" className="multi-line" rows={5} placeholder='Reason for denial...' onChange={(e) => setDenyReason(e.target.value)}></textarea>
                <div className="flex gap-8">
                    <button className="button filled" onClick={() => denyVerification()}>Confirm</button>
                    <button className="button outlined" onClick={() => setIsDenySectionVisible(false)}>Go Back</button>
                </div>
            </div>
        )}
        <div>
            {errorMsg && <span className='status error'>{errorMsg}</span>}
            {success && <span className='status success'>{success}</span>}
        </div>
    </div>
  )
}

export default VerifyUser