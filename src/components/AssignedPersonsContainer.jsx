import React, {useEffect, useState} from 'react'
import Modal from "./Modal";
import { collection, getDocs, doc, onSnapshot, query, where, getDoc, updateDoc, arrayRemove, addDoc, serverTimestamp  } from "firebase/firestore";
import { auth, firestore } from '../config/firebase';
import { useModal } from '../core/ModalContext';
import PersonsAvailable from './PersonsAvailable';
import { getDistance } from "geolib";

import { useAuth } from '../core/AuthContext';


const AssignedPersonsContainer = (props) => {

    const { user_type, userPermissions } = useAuth();

    const [error, setError] = useState('');
    const [assignedPersonnelList, setAssignedPersonnelList] = useState([]);
    let incidentDocRef = doc(firestore, "incidents", props.id);
    if(props.emergency != null && props.emergency == true){
        console.log("emergency is true");
        incidentDocRef = doc(firestore, "sos", props.id);
    } else{
        incidentDocRef = doc(firestore, "incidents", props.id);
    }

    const { openModal } = useModal();

    const modalToggle = () => {

        const bodyClassList = document.body.classList;
        if(bodyClassList.contains("open")){
            bodyClassList.remove("open");
            bodyClassList.add("closed");
        } else{
            bodyClassList.remove("closed");
            bodyClassList.add("open");
        }
    }


    useEffect(() => {
        const fetchUserDetails = async (uIDs) => {
            try {
                const userDetailsPromises = uIDs.map(uID => getDoc(doc(firestore, "users", uID)));
                const userDocs = await Promise.all(userDetailsPromises);
                const users = userDocs.map(userDoc => ({
                    id: userDoc.id,
                    ...userDoc.data()
                }));
                setAssignedPersonnelList(users);
            } catch (error) {
                console.error("Error fetching user details: ", error);
            }
        };

        const unsubscribe = onSnapshot(incidentDocRef, (doc) => {
            console.log("reading database assigned persons...");
            if (doc.exists()) {
                const data = doc.data();
                if (data.responders) {
                    fetchUserDetails(data.responders);
                }
            } else {
                console.log("No such document!");
            }
        });

        return () => unsubscribe();
    }, []);

    const handleRemovePerson = async (personId) => {
        setError("");
        try {

            const incidentDoc = await getDoc(incidentDocRef);
            if (incidentDoc.exists()) {
                const incidentData = incidentDoc.data();
                const responders = incidentData.responders || [];
                console.log(responders);
                const status = incidentData.status;
    
                if(props.emergency == null || (props.emergency != null && props.emergency == false)){
                    if (status !== "Verifying" && status !== "Verified") {
                        setError("Cannot remove responder unless status is Verifying or Verified!");
                        return;
                    }
                } else{
                    if(status !== "Active" && status !== "Handling"){
                        setError("Cannot remove responder unless status is Active or Handling!");
                        return;
                    }
                }
    
                if (!responders.includes(personId)) {
                    setError("User is not in the responders list.");
                } else {
                    await updateDoc(incidentDocRef, {
                        responders: arrayRemove(personId)
                    });
                    await addDoc(collection(firestore, "audits"), {
                        uid: auth.currentUser.uid,
                        action: 'delete',
                        module: 'incidents',
                        description: `Removed user ${personId} as a responder for incident ID ${props.id}`,
                        timestamp: serverTimestamp(),
                    });
                    setError(null);
                }
            } else {
                setError("Incident document not found.");
            }
        } catch (error) {
            console.error("Error removing person from responders: ", error);
            setError("Error removing person from responders.");
        }
    };

  return (
    <div id="responders" className="w-100 flex col gap-8">
        <div className="flex main-between">
        <span className="subheading-m color-major">Assigned Persons</span>
        {(user_type == 'admin' || userPermissions['manage_incidents']) ? <button data-html2canvas-ignore onClick={() => openModal('Add Person', 'Description here', <PersonsAvailable id={props.id} emergency={props.emergency} latitude={props.latitude} longitude={props.longitude}/>, 'info', <></>)} className='button text'>Add</button> : <></>}
        </div>
        {assignedPersonnelList.map((person) => (
        <div key={person.id} className="responder-row flex gap-8 cross-center main-between">
            
                <div className="flex gap-8 cross-center">
                <img data-html2canvas-ignore src={person.profile_path} alt="" width={40} height={40} style={{objectFit: 'cover', borderRadius: '50%'}}/>
                <div className="flex col main-center">
                    <span className="subheading-m color-major">{`${person.first_name} ${person.last_name}`}</span>
                    <span className="body-m color-minor">{person.contact_no}</span>
                </div>
                </div>
            
        {(user_type == 'admin' || userPermissions['manage_incidents']) ? <button data-html2canvas-ignore className='button filled' onClick={() => handleRemovePerson(person.id)}>Delete</button> : <></>}
        
        </div>
        ))}
        {error && <span className='status error'>{error}</span>}
        
    </div>
  )
}

export default AssignedPersonsContainer