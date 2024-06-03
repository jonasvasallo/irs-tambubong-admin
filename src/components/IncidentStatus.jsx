import React, { useState } from 'react'
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../config/firebase";

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
    try {
      const docRef = doc(firestore, "incidents", props.id);
      await updateDoc(docRef, {
          status: status.trim()
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
            <option value="Verifying">Verifying</option>
            <option value="Verified">Verified</option>
            <option value="Handling">Handling</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
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