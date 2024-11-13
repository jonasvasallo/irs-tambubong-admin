import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, arrayUnion, addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, firestore } from "../config/firebase";
import { getDistance } from 'geolib';

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
    const [status, setStatus] = useState();

    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState("All");

    useEffect(() => {
        const fetchSchedules = async () => {
            const scheduleRef = collection(firestore, "duty_schedules");
            const querySnapshot = await getDocs(scheduleRef);
            const schedulesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
                members: doc.data().members || []
            }));
            
            // Get the current day name, e.g., "Monday"
            const currentDayName = moment().format('dddd');
            
            // Filter schedules to include only the current day and "All" option
            const filteredSchedules = schedulesData.filter(schedule => schedule.name.startsWith(currentDayName));
    
            // Prepend "All" option to the filtered schedules
            setSchedules(filteredSchedules);
        };
        fetchSchedules();
    }, []);
    

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

                    let fetchedPersons = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(person => !responders.includes(person.id));

                    if (selectedSchedule !== "All") {
                        const schedule = schedules.find(s => s.id === selectedSchedule);
                        fetchedPersons = fetchedPersons.filter(person => schedule?.members.includes(person.id));
                    }
                    
                    fetchedPersons = fetchedPersons.sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0));
        
                    setAvailablePersons(fetchedPersons);
                    setStatus(incidentData.status);
                } else {
                    setError("No such incident document!");
                }
            } catch (error) {
                console.error("Error fetching available persons: ", error);
                setError("Error fetching available persons.");
            }
        };

        fetchAvailablePersons();
    }, [selectedSchedule]);

    const handleScheduleChange = (e) => {
        setSelectedSchedule(e.target.value);
    };

    const handleAddPerson = async (personId) => {
        setError("");
        try {
            const incidentDoc = await getDoc(incidentDocRef);
            if (incidentDoc.exists()) {
                const incidentData = incidentDoc.data();
                const responders = incidentData.responders || [];

                if(incidentData.incident_group){
                   const groupDocRef = doc(firestore, "incident_groups", incidentData.incident_group);
                   const groupSnapshot = await getDoc(groupDocRef);
                   const groupData = groupSnapshot.data();

                   if(groupData.head != props.id){
                    setError("Cannot update responders as this is a part of an incident group!");
                    return;
                   }
                }

                if(incidentData.emergency_id){
                    setError("You cannot add a responder to this incident since it is already linked to an emergency!");
                    return;
                }
                
                if(props.emergency == null || (props.emergency != null && props.emergency == false)){
                    if (status !== "Verifying" && status !== "Verified" && status !== "Handling") {
                        setError("Cannot add responder unless status is verifying, verified, or handling!");
                        return;
                    }
                } else{
                    if(status !== "Active" && status !== "Handling"){
                        console.log(props.emergency);
                        setError("Cannot add responder unless status is Active or Handling!");
                        return;
                    }
                }
                if (responders.includes(personId)) {
                    setError("User is already in the responders list.");
                } else {
                    await sendNotificationToUser(personId);
                    await updateDoc(incidentDocRef, {
                        responders: arrayUnion(personId)
                    });
                    const responderDocRef = doc(incidentDocRef, "responders", personId);
                    await setDoc(responderDocRef, {
                        response_start: serverTimestamp(),
                        status: "Assigned"
                    });
                    await addDoc(collection(firestore, "audits"), {
                        uid: auth.currentUser.uid,
                        action: 'update',
                        module: 'incidents',
                        description: `Added user ${personId} as a responder for incident ID ${props.id}`,
                        timestamp: serverTimestamp(),
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

    const sendNotificationToUser = async (userId) => {
        try {
          const response = await fetch('https://us-central1-irs-capstone.cloudfunctions.net/sendUserNotification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }), // Send the userId to the cloud function
          });
      
          if (response.ok) {
            console.log('Notification sent successfully');
          } else {
            console.error('Failed to send notification');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };

      const getHoursDifference = (lastLogin) => {
        const lastLoginDate = lastLogin.toDate(); // Convert Firestore timestamp to Date
        const now = new Date();
        const differenceInMs = now - lastLoginDate;
        return Math.floor(differenceInMs / (1000 * 60 * 60)); // Convert ms to hours
    };

    return (
        <div id="personsAvailable">
            <div className="flex gap-8" style={{'flexWrap' : 'wrap'}}>
                <div className="input-field">
                    <select className="dropdown" onChange={handleScheduleChange} value={selectedSchedule}>
                        <option value="All">All</option>
                        {schedules.map(schedule => (
                            <option key={schedule.id} value={schedule.id}>{schedule.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            {error && (
                <div id="error-section">
                    <span className='status error'>{error}</span>
                </div>
            )}
            <div className="flex col">
                {
                availablePersons.map((person) => (
                    <div key={person.id} className="flex main-between cross-center">
                        <div className="flex gap-16 cross-center">
                            <img src={person.profile_path || ''} alt="" width={40} height={40} />
                            <span>{person.first_name} {person.last_name}</span>
                            <div className="flex col">
                                {
                                (person.isOnline) ?
                                <span className='status success'>Online</span>
                                :
                                <span className='status error'>Offline</span>
                                }
                                <span>
                                    {(person.lastLocationFetched) ? `${getHoursDifference(person.lastLocationFetched)} hours ago` : `Not updated yet`}
                                </span>
                                <span>
                                {
                                    (person.current_location != null && person.isOnline)
                                    ? `${(getDistance({latitude: props.latitude, longitude: props.longitude}, {latitude: person.current_location.latitude, longitude: person.current_location.longitude}) / 1000).toFixed(1)} km away`
                                    : 'UNKNOWN'
                                }
                                </span>
                            </div>
                        </div>
                        <div>
                            <button className='button filled' onClick={() => handleAddPerson(person.id)}>Add</button>
                        </div>
                    </div>
                ))
                }
            </div>
        </div>
    )
}

export default PersonsAvailable;
