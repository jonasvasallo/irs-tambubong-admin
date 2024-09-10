import React, { useState } from 'react'
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, firestore } from "../config/firebase";

const EmergencyStatus = (props) => {
  const [status, setStatus] = useState('');
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const saveStatus = async () => {
    setError('');
    if(!status){
      setError("Please select a status first");
      return;
    }
    const docRef = doc(firestore, "sos", props.id);
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
          alert("You cannot set an emergency to Resolved or Closed without assigning a person to handle that emergency first!");
          return;
        }
      }
      
      await updateDoc(docRef, {
          status: status.trim()
      });
      await addDoc(collection(firestore, "audits"), {
        uid: auth.currentUser.uid,
        action: 'update',
        module: 'sos',
        description: `Updated status to ${status.trim()} for sos ID ${props.id}`,
        timestamp: serverTimestamp(),
      });
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
            <option value="Active">Active</option>
            <option value="Handling">Handling</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Dismissed">Dismissed</option>
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

export default EmergencyStatus