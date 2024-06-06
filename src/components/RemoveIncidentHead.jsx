import React, {useState} from 'react'
import {doc, updateDoc, addDoc, arrayRemove, deleteField, increment  } from "firebase/firestore";
import { firestore } from "../config/firebase";

const RemoveIncidentHead = (props) => {
  const [selectedTag, setSelectedTag] = useState(null);
  const [success, setSuccess] = useState("");
  const [errorMsg, setErrorMsg] = useState('');

  const replaceIncidentHead = async () => {
    setErrorMsg('');
    setSuccess("");

    if(!selectedTag){
      setErrorMsg("Please select an incident first!");
    }
    const incidentDocRef = doc(firestore, "incidents", props.incident_head);
    const incidentGroupDocRef = doc(firestore, "incident_groups", props.incident_group);
    try{
      await updateDoc(incidentGroupDocRef, {
        incidents: increment(-1),
        in_group: arrayRemove(props.incident_head),
        head: selectedTag.trim(),
      });
      await updateDoc(incidentDocRef, {
        incident_group: deleteField(),
      });
      setSuccess("Successfully replaced and removed incident head");
    } catch(error){
      alert(error);
      console.log(error);
      setErrorMsg(error);
    }

  }

  return (
    <div>
        <span>Choose new incident head</span>
        <select name="" id="" className='dropdown' onChange={(e) => setSelectedTag(e.target.value)} placeholder="Choose tag">
          <option value="" selected disabled>Select an incident</option>
          {props.incidents.map((incident) => {
            if(props.incident_head != incident.id){
              return <option key={incident.id} value={incident.id}>{incident.title}</option>;
            }
          })}
        </select>
        <br />
        <br />
        {success && <div>
            <span className='status success'>{success}</span>
        </div>}
        {errorMsg && <div>
            <span className='status error'>{errorMsg}</span>
        </div>}
        <br />
        <button className="button filled" onClick={() => replaceIncidentHead()}>Save</button>
    </div>
  )
}

export default RemoveIncidentHead