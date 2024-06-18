import { updateDoc, collection, doc, query, where, getDocs  } from 'firebase/firestore';
import React, {useState} from 'react'
import { firestore } from '../../../../config/firebase';
import { useModal } from '../../../../core/ModalContext';

const UpdateIncidentTagModal = (props) => {
  const {closeModal} = useModal();
  const [initialTag, setInitialTag] = useState(props.name);
  const [incidentTag, setIncidentTag] = useState(props.name);
  const [errorMsg, setErrorMsg] = useState();
  const [success, setSuccess] = useState();

  const createTag = async ()=>{
      setErrorMsg("");
      if(!incidentTag){
          setErrorMsg("Please provide a name for the incident tag!");
          return;
      }
      if(initialTag == incidentTag){
        setErrorMsg("Tag name cannot be the same!")
        return;
      }
      const incidentTagDocRef = doc(firestore, "incident_tags", props.id);
      const incidentTagsCollectionRef = collection(firestore, "incident_tags");
      try{
        //validation
        const q = query(incidentTagsCollectionRef, where("tag_name", "==", incidentTag.trim()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            setErrorMsg("Tag name already exists!");
            return;
        }
          await updateDoc(incidentTagDocRef, {
              tag_name: incidentTag.trim(),
              priority: 'Low',
          })
          setSuccess("Successfully updated incident tag");
          setTimeout(() => closeModal(), 2000);
      } catch(error){
          setErrorMsg(error.message);
      }
  }
  return (
    <div>
        <div className="input-field">
            <input type="text" name="" id="" required value={incidentTag} onChange={(e) => setIncidentTag(e.target.value)} placeholder='Incident Tag Name'/>
        </div>
        <div>
            {errorMsg && <span className='status error'>{errorMsg}</span>}
            {success && <span className='status success'>{success}</span>}
        </div>
        <br />
        <button className="button filled" onClick={() => createTag()}>Update</button>
    </div>
  )
}

export default UpdateIncidentTagModal