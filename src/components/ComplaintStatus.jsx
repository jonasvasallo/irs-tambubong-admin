import React, { useState } from 'react'
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, firestore } from "../config/firebase";

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
      console.log(props.complainant);
      console.log(props.respondent);
      console.log(status);

      if(props.complainant && status == "Dismissed"){
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
        if(props.respondent){
          const respondentDocRef = doc(firestore, "users", props.respondent);
          const respondentNotifRef = collection(respondentDocRef, "notifications");
          await addDoc(respondentNotifRef, {
            title: 'Complaint was dismissed',
            content: 'The complaint that you had received has been dismissed. If you have any questions please submit a support ticket.',
            timestamp: serverTimestamp(),
          })
        }
       

        const complaintDocRef = doc(firestore, "complaints", props.id);
        console.log(props.id);
        // Fetch the current complaint document
        const complaintDocSnapshot = await getDoc(complaintDocRef);
        if (complaintDocSnapshot.exists()) {
            const complaintData = complaintDocSnapshot.data();

            // Update the status of each hearing within the hearings array
            const updatedHearings = complaintData.hearings.map(hearing => ({
                ...hearing,
                status: "Dismissed"
            }));

            console.log(updatedHearings);

            // Update the complaint document with the new status and updated hearings array
            await updateDoc(complaintDocRef, {
                status: status.trim(),
                hearings: updatedHearings
            });

            setSuccess("Status updated successfully");
            setError('');
            window.location.reload();
            return;
        } else {
            setError("Complaint document does not exist");
            return;
        }
      }
      console.log("this happened why");
      const complaintDocRef = doc(firestore, "complaints", props.id);
      await updateDoc(complaintDocRef, {
        status: status.trim(),

      });
      await addDoc(collection(firestore, "audits"), {
        uid: auth.currentUser.uid,
        action: 'update',
        module: 'complaints',
        description: `Updated status to ${status.trim()} for complaint ID ${props.id}`,
        timestamp: serverTimestamp(),
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