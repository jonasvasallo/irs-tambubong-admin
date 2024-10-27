import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { firestore } from '../../config/firebase';

const RespondersSection = (props) => {
    const docRef = (props.emergency && props.emergency === true) ? doc(firestore, "sos", props.id) : doc(firestore, "incidents", props.id);
    const [respondersList, setRespondersList] = useState([]);
    const [assignedResponders, setAssignedResponders] = useState([]);

    useEffect(() => {
        const fetchResponders = async () => {
            console.log("Fetching responders");
            const respondersCollectionRef = collection(docRef, "responders");
            const respondersSnapshot = await getDocs(respondersCollectionRef);
            const respondersData = await Promise.all(respondersSnapshot.docs.map(async (responderDoc) => {
                const data = responderDoc.data();
                const responseStart = data.response_start.toDate();
                const responseEnd = data.response_end.toDate();
                const responseTime = responseEnd - responseStart; // Difference in milliseconds
                
                // Fetch user details
                const userDocRef = doc(firestore, "users", responderDoc.id);
                const userDocSnapshot = await getDoc(userDocRef);
                const userData = userDocSnapshot.exists() ? userDocSnapshot.data() : {};

                return {
                    ...data,
                    id: responderDoc.id,
                    responseTime,
                    first_name: userData.first_name || "",
                    last_name: userData.last_name || "",
                    profile_path: userData.profile_path || "",
                    user_type: userData.user_type || ""
                };
            }));
            setRespondersList(respondersData);
        };

        const fetchAssignedResponders = async () => {
            console.log("Fetching assigned responders based on UIDs");
            const assignedRespondersData = await Promise.all(props.responders.map(async (uid) => {
                const userDocRef = doc(firestore, "users", uid);
                const userDocSnapshot = await getDoc(userDocRef);
                const userData = userDocSnapshot.exists() ? userDocSnapshot.data() : {};

                return {
                    id: uid,
                    first_name: userData.first_name || "",
                    last_name: userData.last_name || "",
                    profile_path: userData.profile_path || "",
                    user_type: userData.user_type || ""
                };
            }));
            setAssignedResponders(assignedRespondersData);
        };

        fetchResponders();
        fetchAssignedResponders();
        console.log(respondersList);
    }, []);

    const formatResponseTime = (milliseconds) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <div className='w-100'>
            <div><span className="subheading-m color-major">Responders</span></div>
            <br />
            <div className="flex col gap-8">
                {(respondersList.length > 0) ? respondersList.map((responder) => (
                    <div key={responder.id} className="flex gap-32 cross-center main-around">
                        <div className="flex gap-8 cross-center">
                            <div><img src={responder.profile_path} alt="Profile" width={40} height={40} style={{objectFit: 'cover', 'borderRadius' : '50%'}} /></div>
                            <div className='flex col'>
                                <span>{`${responder.first_name} ${responder.last_name}`}</span>
                                <span className="color-minor">{responder.user_type.toUpperCase()}</span>
                            </div>
                        </div>
                        <div className='flex col'>
                            <span className="subheading-m">{responder.status}</span>
                            <span className="color-minor body-m">Response Time: {formatResponseTime(responder.responseTime)}</span>
                        </div>
                        <div>
                            <a className="button secondary" style={{textDecoration: 'none'}} target='__blank' href={responder.response_photo}>Proof</a>
                        </div>
                        
                    </div>
                )) : 
                assignedResponders.length > 0 ? assignedResponders.map((responder) => (
                    <div key={responder.id} className="flex gap-8 cross-center">
                        <div><img src={responder.profile_path} alt="Profile" width={40} height={40} style={{objectFit: 'cover', 'borderRadius' : '50%'}} /></div>
                        <div className='flex col'>
                            <span>{`${responder.first_name} ${responder.last_name}`}</span>
                            <span className="color-minor">{responder.user_type.toUpperCase()}</span>
                        </div>
                        <div className="flex col">
                            <span className="status error">NO RESPONSE</span>
                        </div>
                    </div>
                )) : <>No assigned responders for this report</>
                }
            </div>
        </div>
    );
};

export default RespondersSection;
