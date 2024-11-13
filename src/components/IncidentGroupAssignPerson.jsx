import React, {useState, useEffect} from 'react'
import { useModal } from '../core/ModalContext'
import Modal from './Modal';
import AssignGroupPerson from './AssignGroupPerson';
import { collection, getDocs, doc, onSnapshot, query, where, getDoc, updateDoc, arrayRemove, deleteDoc  } from "firebase/firestore";
import { firestore } from '../config/firebase';
import { useAuth } from '../core/AuthContext';

const IncidentGroupAssignPerson = (props) => {

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
                        setError("Cannot remove responder unless status is verifying, verified!");
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
                    const responderDocRef = doc(incidentDocRef, "responders", personId);
                    await deleteDoc(responderDocRef);
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
    <div className='flex-1 col flex main-between'>
        <div>
            <span className='subheading-m color-major'>Assigned Personnel</span>
            <br />
            <span className="body-s color-minor">Individuals that are assigned here will be propagated to all the incidents within the group upon the resolvation of the incident.</span>
            <br />
            <br />
            <div className="flex col gap-8">
            {assignedPersonnelList.map((person) => (
                <div key={person.id} id="personnel-row" className='flex main-between'>
                    <div className='flex gap-8'>
                    <img src={person.profile_path} alt="" width={40}  height={40} style={{objectFit: 'cover', borderRadius: '50%'}}/>
                    <div className="flex col">
                        <span className="subheading-m color-major">{`${person.first_name} ${person.last_name}`}</span>
                        <span className="body-m color-minor">{person.user_type.toUpperCase()}</span>
                    </div>
                    </div>
                    {(user_type == 'admin' || userPermissions['manage_incidents']) ? <button className="button filled error" onClick={()=>handleRemovePerson(person.id)}><span className='material-symbols-outlined'>delete</span></button> : <></>}
                </div>
            ))}
            
            </div>
        </div>
        <div>
        {error && <span className='status error'>{error}</span>}
        </div>
        {(user_type == 'admin' || userPermissions['manage_incidents']) ? <button className="button filled" onClick={()=>openModal("Assign a person", "", <AssignGroupPerson id={props.id}/>, "info", <></>)}>Add</button> : <></>}
    </div>
  )
}

export default IncidentGroupAssignPerson