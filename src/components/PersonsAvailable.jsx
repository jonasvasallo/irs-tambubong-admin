import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { firestore } from "../config/firebase";

const PersonsAvailable = (props) => {
    let incidentDocRef = doc(firestore, "incidents", props.id);
    if(props.emergency != null && props.emergency == true){
        console.log("emergency is true");
        incidentDocRef = doc(firestore, "sos", props.id);
    } else{
        incidentDocRef = doc(firestore, "incidents", props.id);
    }
    const [availablePersons, setAvailablePersons] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        
        const fetchAvailablePersons = async () => {
            try {
                const incidentDoc = await getDoc(incidentDocRef);
                if (incidentDoc.exists()) {
                    const incidentData = incidentDoc.data();
                    const responders = incidentData.responders || [];

                    const usersRef = collection(firestore, "users");
                    const q = query(usersRef, where("user_type", "==", "tanod"));
                    const querySnapshot = await getDocs(q);

                    const availablePersons = querySnapshot.docs
                        .map(doc => ({ id: doc.id, ...doc.data() }))
                        .filter(person => !responders.includes(person.id));

                    setAvailablePersons(availablePersons);
                } else {
                    setError("No such incident document!");
                }
            } catch (error) {
                console.error("Error fetching available persons: ", error);
                setError("Error fetching available persons.");
            }
        };

        fetchAvailablePersons();
    }, []);

    const handleAddPerson = async (personId) => {
        try {
            const incidentDoc = await getDoc(incidentDocRef);
            if (incidentDoc.exists()) {
                const incidentData = incidentDoc.data();
                const responders = incidentData.responders || [];

                if (responders.includes(personId)) {
                    setError("User is already in the responders list.");
                } else {
                    await updateDoc(incidentDocRef, {
                        responders: arrayUnion(personId)
                    });
                    setError(null);
                }

            } else {
                console.log(incidentDocRef);
                console.log(props.id);
                setError("Incident document not found.");
            }
        } catch (error) {
            console.error("Error adding person to responders: ", error);
            setError("Error adding person to responders.");
        }
    };

    return (
        <div id="personsAvailable">
            {error && (
                <div id="error-section">
                    <span>{error}</span>
                </div>
            )}
            <div className="flex col">
                {availablePersons.map((person) => (
                    <div key={person.id} className="flex main-between cross-center">
                        <div className="flex gap-16 cross-center">
                            <img src={person.profile_path || ''} alt="" width={40} height={40} />
                            <span>{person.first_name} {person.last_name}</span>
                        </div>
                        <div>
                            <button className='button filled' onClick={() => handleAddPerson(person.id)}>Add</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PersonsAvailable;
