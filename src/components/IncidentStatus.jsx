import React, { useState } from 'react'
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, firestore } from "../config/firebase";

const IncidentStatus = (props) => {
  const [status, setStatus] = useState('');
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const saveStatus = async () => {
    setError('');
    if(!status){
      setError("Please select a status first");
      return;
    }

    const docRef = doc(firestore, "incidents", props.id);
    try {
      /* 
      VALIDATION
      - There must be assigned personnel before updating to Resolved or Closed
      */

      if(status == "Resolved" || status == "Closed"){
        const docSnapshot = await getDoc(docRef);
        const docData = docSnapshot.data();
        console.log(docData.responders.length);
        if(docData.responders.length < 1){
          alert("You cannot set an incident to Resolved or Closed without assigning a person to handle that incident first!");
          return;
        }
      }


      await updateDoc(docRef, {
          status: status.trim()
      });
      const userDocRef = doc(firestore, "users", props.reported_by);
      const notificationsCollectionRef = collection(userDocRef, "notifications");

      switch(status){
        case 'Verified':
          await addDoc(notificationsCollectionRef, {
            'title' : `Incident No. ${props.id} has been verified`,
            'content' : 'Your report has been acknowledged. Please wait while the authorities handle your case.',
            'timestamp' : serverTimestamp(),
          })
          break;
        case 'Resolved':
          await addDoc(notificationsCollectionRef, {
            'title' : `Incident No. ${props.id} marked as Resolved`,
            'content' : 'You may send your feedback through the My Incidents section of the Profile Page so that we may be able to improve our service quality.',
            'timestamp' : serverTimestamp(),
          })
          break;
        default:
          break;
      }
      setSuccess('Status updated successfully.');
      setError('');
      window.location.reload();
    } catch (error) {
        console.error("Error updating status: ", error);
        setError('Error updating status.');
        setSuccess('');
    }
  }
  return (
    <div>
        <select name="" id="" className="dropdown" onChange={(e) => setStatus(e.target.value)}>
          <option value="" selected disabled>Select a status</option>
            <option value="Verifying">Verifying</option>
            <option value="Verified">Verified</option>
            <option value="Handling">Handling</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Rejected">Rejected</option>
        </select>
        <br />
        <br />
        {success && <span className='status success'>{success}</span>}
        {error && <span className='status error'>{error}</span>}
        <br />
        <button className="button filled" onClick={() => saveStatus()}>Save</button>

    </div>
  )
}

export default IncidentStatus