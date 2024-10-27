import React, {useState} from 'react'
import { firestore } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const EditRespondentDetails = (props) => {

    const [name, setName] = useState(props.name);
    const [contactNo, setContactNo] = useState(props.phone);
    const [address, setAddress] = useState(props.address);

    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const updateRespondent = async () => {
        setErrorMsg("");

        if(!name || !contactNo || !address){
            setErrorMsg("You have missing fields. Please double check and try again.");
            return;
        }

        const complaintDocRef = doc(firestore, "complaints", props.id);
        await updateDoc(complaintDocRef, {
            respondent_info: [
                name,
                contactNo,
                address,
            ]
        });

        setSuccessMsg("Successfully updated respondent details!");
        window.location.reload();
    }

  return (
    <div>
        <div className="input-field">
            <input type="text" placeholder="Full Name" required onChange={(e) => setName(e.target.value)} value={name} />
        </div>
        <div className="input-field">
            <input type="text" placeholder="Contact Number" required onChange={(e) => setContactNo(e.target.value)} value={contactNo} />
        </div>
        <div className="input-field">
            <input type="text" placeholder="Address" required onChange={(e) => setAddress(e.target.value)} value={address} />
        </div>
        <div>
            {errorMsg && <span className="status error">{errorMsg}</span>}
            {successMsg && <span className="status success">{successMsg}</span>}
        </div>
        <button className="button filled" onClick={() => updateRespondent()}>Save</button>
    </div>
  )
}

export default EditRespondentDetails