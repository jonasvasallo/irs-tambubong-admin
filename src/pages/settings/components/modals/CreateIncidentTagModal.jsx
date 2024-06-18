import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import React, {useState} from 'react'
import { firestore } from '../../../../config/firebase';
import { useModal } from '../../../../core/ModalContext';

const CreateIncidentTagModal = () => {
    const {closeModal} = useModal();
    const [incidentTag, setIncidentTag] = useState("");
    const [errorMsg, setErrorMsg] = useState();
    const [success, setSuccess] = useState();

    const [isCreated, setIsCreated] = useState(false);

    const createTag = async ()=>{
        setSuccess("");
        setErrorMsg("");
        if(isCreated){
            setErrorMsg("Cannot create again!");
            return;
        }
        if(!incidentTag){
            setErrorMsg("Please provide a name for the incident tag!");
            return;
        }
        const incidentTagsCollectionRef = collection(firestore, "incident_tags");

        try{
            //validation
            const q = query(incidentTagsCollectionRef, where("tag_name", "==", incidentTag.trim()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setErrorMsg("Tag name already exists!");
                return;
            }

            await addDoc(incidentTagsCollectionRef, {
                tag_name: incidentTag.trim(),
                priority: 'Low',
            })
            setSuccess("Successfully created incident tag");
            setIsCreated(true);
            setTimeout(() => closeModal(), 2000);
        } catch(error){
            setErrorMsg(error.message);
        }
    }
  return (
    <div>
        <div className="input-field">
            <input type="text" name="" id="" required onChange={(e) => setIncidentTag(e.target.value)} placeholder='Incident Tag Name'/>
        </div>
        <div>
            {errorMsg && <span className='status error'>{errorMsg}</span>}
            {success && <span className='status success'>{success}</span>}
        </div>
        <br />
        <button className="button filled" onClick={() => createTag()}>Create</button>
    </div>
  )
}

export default CreateIncidentTagModal