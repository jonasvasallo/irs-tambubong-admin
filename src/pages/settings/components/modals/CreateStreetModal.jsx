import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import React, {useState} from 'react'
import { firestore } from '../../../../config/firebase';
import { useModal } from '../../../../core/ModalContext';

const CreateStreetModal = () => {
    const {closeModal} = useModal();
    
    const [streetName, setStreetName] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState("");

    const [isCreated, setIsCreated] = useState(false);

    const createStreet = async ()=> {
        setSuccess("");
        setErrorMsg("");
        if(isCreated){
            setErrorMsg("Cannot create again!");
            return;
        }
        if(!streetName){
            setErrorMsg("Street name cannot be empty!");
            return;
        }

        const streetsCollectionRef = collection(firestore, "streets");

        try{
            //validation
            const q = query(streetsCollectionRef, where("name", "==", streetName.trim()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setErrorMsg("Street name already exists!");
                return;
            }

            await addDoc(streetsCollectionRef, {
                name: streetName.trim(),
            });
            setSuccess("Successfully created street");
            setIsCreated(true);
            setTimeout(() => closeModal(), 2000);
        }catch(error){
            setErrorMsg(error.message);
        }
    }
  return (
    <div>
        <div className="input-field">
            <input type="text" name="" id="" placeholder='Street Name' required onChange={(e)=>setStreetName(e.target.value)}/>
        </div>
        <div>
            {errorMsg && <span className='status error'>{errorMsg}</span>}
            {success && <span className='status success'>{success}</span>}
        </div>
        <br />
        <button className="button filled" onClick={()=>createStreet()}>Create</button>
    </div>
  )
}

export default CreateStreetModal