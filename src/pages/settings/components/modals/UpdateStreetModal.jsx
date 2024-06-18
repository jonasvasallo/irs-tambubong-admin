import { updateDoc, collection, doc, query, where, getDocs  } from 'firebase/firestore';
import React, {useState} from 'react'
import { firestore } from '../../../../config/firebase';
import { useModal } from '../../../../core/ModalContext';

const UpdateStreetModal = (props) => {
    const {closeModal} = useModal();
    const [initialStreet, setInitialStreet] = useState(props.name);
    const [streetName, setStreetName] = useState(props.name);
    const [errorMsg, setErrorMsg] = useState();
    const [success, setSuccess] = useState();

    const createStreet = async ()=>{
        setErrorMsg("");
        if(!streetName){
            setErrorMsg("Please provide a name for the street!");
            return;
        }
        if(initialStreet == streetName){
          setErrorMsg("Street name cannot be the same!")
          return;
        }
        const streetDocRef = doc(firestore, "streets", props.id);
        const streetsCollectionRef = collection(firestore, "streets");
        try{
          //validation
          const q = query(streetsCollectionRef, where("name", "==", streetName.trim()));
          const querySnapshot = await getDocs(q);
  
          if (!querySnapshot.empty) {
              setErrorMsg("Street already exists!");
              return;
          }
            await updateDoc(streetDocRef, {
                name: streetName.trim(),
            })
            setSuccess("Successfully updated street");
            setTimeout(() => closeModal(), 2000);
        } catch(error){
            setErrorMsg(error.message);
        }
    }
  return (
    <div>
        <div className="input-field">
            <input type="text" name="" id="" required value={streetName} onChange={(e) => setStreetName(e.target.value)} placeholder='Street Name'/>
        </div>
        <div>
            {errorMsg && <span className='status error'>{errorMsg}</span>}
            {success && <span className='status success'>{success}</span>}
        </div>
        <br />
        <button className="button filled" onClick={() => createStreet()}>Update</button>
    </div>
  )
}

export default UpdateStreetModal