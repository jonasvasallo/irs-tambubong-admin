import React, { useState } from 'react'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { firestore } from "../config/firebase";

const ComplaintStatus = (props) => {
    const [status, setStatus] = useState('');
    const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dismissalReason, setDismissalReason] = useState("");

  const saveStatus = async () => {
    setError('');
    if(!status){
      setError("Please select a status first");
      return;
    }

    try{
      if(props.complainant && props.respondent && status == "Dismissed"){
        if(!dismissalReason){
          setError("Please add a dismissal reason first!");
          return;
        }
        const complainantDocRef = doc(firestore, "users", props.complainant);
        const complainantNotifRef = collection(complainantDocRef, "notifications");
        await addDoc(complainantNotifRef, {
          title: "Your complaint has been dismissed",
          content: `Your complaint got dismissed. Reason: ${dismissalReason}.`,
          timestamp: serverTimestamp(),
        })
        const respondentDocRef = doc(firestore, "users", props.respondent);
        const respondentNotifRef = collection(respondentDocRef, "notifications");
        await addDoc(respondentNotifRef, {
          title: 'Complaint was dismissed',
          content: 'The complaint that you had received has been dismissed. If you have any questions please submit a support ticket.',
          timestamp: serverTimestamp(),
        })
      }

      console.log("this happened why");
      const complaintDocRef = doc(firestore, "complaints", props.id);
      await updateDoc(complaintDocRef, {
        status: status.trim(),
      });
      
      setSuccess("Status updated successfully");
      setError('');
      window.location.reload();
    } catch(error){
      console.log(error.message);
      setError(error.message);
    }
    
  }
  return (
    <div>
        <select name="" id="" className="dropdown" onChange={(e) => setStatus(e.target.value)}>
          <option value="" selected disabled>Select a status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
            <option value="Dismissed">Dismissed</option>
        </select>
        {(status == "Dismissed") ? <textarea name="" id="" className='multi-line' rows={5} placeholder='Reason for dismissal' style={{marginTop: '16px'}} onChange={(e) => setDismissalReason(e.target.value)}></textarea> : <></>}
        <br />
        <br />
        {success && <span className='status success'>{success}</span>}
        {error && <span className='status error'>{error}</span>}
        <br />
        <button className="button filled" onClick={() => saveStatus()}>Save</button>
    </div>
  )
}

export default ComplaintStatus