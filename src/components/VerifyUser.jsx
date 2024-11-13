import { FieldValue, addDoc, collection, deleteField, doc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import React, {useState} from 'react'
import { Link } from 'react-router-dom';
import { auth, firestore } from '../config/firebase';

const VerifyUser = (props) => {
    const userDocRef = doc(firestore, "users", props.id);
    const [isDenySectionVisible, setIsDenySectionVisible] = useState(false);
    const [denyReason, setDenyReason] = useState();
    const [denyType, setDenyType] = useState();
    
    const showDenyField = () => {
        setIsDenySectionVisible(true);
    }

    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState("");

    const acceptVerification = async () =>{
        setSuccess("");
        setErrorMsg('');

        if(props.temporary != null && props.temporary == true){
            if(props.proof == null || props.proof == ''){
                setErrorMsg("This is a temporary resident and they do not have a proof of temporary residence yet!");
                return;
            }
        }
        try{
            await updateDoc(userDocRef, {
                verified: true,
            });
            await addDoc(collection(firestore, "audits"), {
                uid: auth.currentUser.uid,
                action: 'update',
                module: 'users',
                description: `Verified a user with an id of ${props.id}`,
                timestamp: serverTimestamp(),
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
        if(!denyType){
            setErrorMsg("Please choose the deny type!");
            return;
        }
        if(!denyReason){
            setErrorMsg("Please input denial reason!");
            return;
        }
        
        const notificationCollectionRef = collection(userDocRef, "notifications");

        try{

            switch(denyType){
                case 'id':
                    await updateDoc(userDocRef, {
                        denyVerificationCount : increment(1),
                        verified: false,
                        verification_photo : deleteField(),
                    });
                    break;
                case 'proof':
                    await updateDoc(userDocRef, {
                        denyVerificationCount : increment(1),
                        verified: false,
                        temporary_proof : deleteField(),
                        landlord_name : deleteField(),
                        landlord_contact : deleteField(),
                    });
                    break;
                case 'both':
                    await updateDoc(userDocRef, {
                        denyVerificationCount : increment(1),
                        verified: false,
                        verification_photo : deleteField(),
                        temporary_proof : deleteField(),
                        landlord_name : deleteField(),
                        landlord_contact : deleteField(),
                    });
                    break;
                default: 
                    setErrorMsg("Unidentified deny type!")
                    return;
            }
            await addDoc(notificationCollectionRef, {
                title: 'Account verification denied',
                content: `Your account verification has been denied. Reason: ${denyReason}. Please upload your identification once again in update profile section.`,
                timestamp: serverTimestamp(),
            })
            await addDoc(collection(firestore, "audits"), {
                uid: auth.currentUser.uid,
                action: 'update',
                module: 'users',
                description: `Denied verification for a user with an id of ${props.id}`,
                timestamp: serverTimestamp(),
            });
            
            setSuccess("Verification has been denied.");
            window.location.reload();
        } catch(error){
            setErrorMsg(error.message);
        }
    }
  return (
    <div className='flex col gap-8'>
        <div>
            <span className="subheading-s">ID Card</span>
            {
                (props.image != null && props.image != '') ?
                <Link to={props.image}><img src={props.image} alt="" className='w-100' height={150} style={{objectFit: 'cover'}}/></Link>
                :
                <div>
                    <span className="status error">User has not uploaded their ID yet.</span>
                </div>
            }
            
            
            {(props.proof != null && props.proof != '') ? 
            <>
                <span className="subheading-s">Temporary Residency Proof</span>
                <Link to={props.proof}><img src={props.proof} alt="" className='w-100' height={150} style={{objectFit: 'cover'}}/></Link>
            </>
            : <></>}
        </div>
        {!isDenySectionVisible && (
                <div id='approve-section' className="flex main-between gap-8">
                    {(props.verification == false && props.image != null && props.image != '') ? <button className="button secondary w-100" onClick={() => acceptVerification()}>Approve</button> : <></>}
                    {(props.image || props.proof) ? <button className='button filled w-100' onClick={showDenyField}>Deny</button> : <></>}
                </div>
            )}
        {isDenySectionVisible && (
            <div id="deny-section">
                <div>
                <span className="subheading-s">Denial Type</span>
                <select name="" id="" className='dropdown' placeholder='Select denial type...' onChange={(e) => setDenyType(e.target.value)}>
                    <option value="" selected disabled>Select denial type...</option>
                    {
                        (props.image != null && props.image != '') ?
                        <option value="id">Identification </option> :
                        <></>
                    }
                    {
                        (props.proof != null && props.proof != '') ?
                        <>
                        <span>{denyType}</span>
                        <option value="proof">Residency Proof</option>
                        </> :
                        <></>
                    }
                    {((props.image != null && props.image != '') && (props.proof != null && props.proof != '')) ? 
                    <option value="both">Identification & Residency Proof</option>
                    :
                    <></>
                    }
                </select>
                </div>
                <br />
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