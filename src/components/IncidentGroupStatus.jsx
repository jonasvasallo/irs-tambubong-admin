import React, { useState } from 'react'
import { doc, updateDoc, getDoc, addDoc, serverTimestamp, collection } from "firebase/firestore";
import { firestore, auth } from "../config/firebase";

const IncidentGroupStatus = (props) => {
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
      const docRef = doc(firestore, 'incident_groups', props.id);
      const docCollectionRef = collection(docRef, "live_status");
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError('Incident group document does not exist.');
        return;
      }
  
      const data = docSnap.data();
      const incidentIds = data.in_group;

      const incident_head = data.head;

      /* 
      Check if head has responders or not before updating
      */
     if(status == "Resolved" || status == "Closed"){
      const headDocRef = doc(firestore, "incidents", incident_head);
      const headSnapshot = await getDoc(headDocRef);
      const headData = headSnapshot.data();

      if(headData.responders.length < 1){
        alert("You cannot set an incident to Resolved or Closed without assigning a person to handle that incident first!");
        return;
      }
     }
     
  
      if (incidentIds && incidentIds.length > 0) {
        const addStatusPromises = [];
    
        incidentIds.forEach(async (incidentId) => {
            try {
                const incidentDocRef = doc(firestore, 'incidents', incidentId);
                const newStatRef = updateDoc(incidentDocRef, { status: status.trim() });
                addStatusPromises.push(newStatRef);
                
                const incidentStatusCol = collection(incidentDocRef, "live_status");
                const newStatusRef = await addDoc(incidentStatusCol, {
                    status_content: `Incident status changed to ${status.trim()}`,
                    updated_by: auth.currentUser.uid,
                    timestamp: serverTimestamp(),
                });
                addStatusPromises.push(newStatusRef);
            } catch (error) {
                console.error("Error adding status to incident:", incidentId, error);
            }
        });

        await Promise.all(addStatusPromises);
    
        setSuccess('Status updated successfully for all incidents.');
      } else {
          setError('No incidents found in the incident group.');
      }
        await updateDoc(docRef, { status: status.trim() });
        await addDoc(docCollectionRef, {
          status_content: `Incident status changed to ${status.trim()}`,
          updated_by: auth.currentUser.uid,
          timestamp: serverTimestamp(),
        });
        setError('');
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

export default IncidentGroupStatus