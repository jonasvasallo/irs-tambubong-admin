import React, {useState} from 'react'
import { firestore } from '../config/firebase';
import { doc, addDoc, collection, serverTimestamp, updateDoc, arrayUnion, increment } from 'firebase/firestore';

const MergeIncidents = (props) => {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState('');
    const incidents = props.incidents;

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return `${("0" + (date.getMonth() + 1)).slice(-2)}/${
          ("0" + date.getDate()).slice(-2)}/${date.getFullYear()} ${
          ("0" + (date.getHours() % 12 || 12)).slice(-2)}:${
          ("0" + date.getMinutes()).slice(-2)} ${
          date.getHours() >= 12 ? "PM" : "AM"}`;
      };

    const createIncidentGroup = async () => {
        setSuccess("");
        setError("");

        let incidentsToBeMerged = [];
        incidentsToBeMerged.push(props.id);
        incidents.map((incident) => {
            if(!incident.incident_group){
                incidentsToBeMerged.push(incident.id);
            }
        })

        if(incidentsToBeMerged.length <= 1){
            setError("No incidents to be merged");
            return;
        }

        
        const incidentGroupCollectionRef = collection(firestore, "incident_groups");

        
        try{
            const newDoc = await addDoc(incidentGroupCollectionRef, {
                title: props.title,
                description: props.description,
                status: props.status,
                timestamp: serverTimestamp(),
                head: props.id,
                in_group: incidentsToBeMerged,
                incidents: incidentsToBeMerged.length,
            })
            const updateIncidentPromises = incidentsToBeMerged.map(async (incidentId) => {
                const docRef = doc(firestore, "incidents", incidentId);
                await updateDoc(docRef, {
                incident_group: newDoc.id,
                });
                console.log(`Updated incident group for incident ${incidentId}`);
            });
        
            await Promise.all(updateIncidentPromises);
            setSuccess("Successfully created incident group");
            window.location.reload();
        } catch(error){
            console.log(error);
            setError(error.message);
        }
    }

    const joinIncidentGroup = async (incident_group_id) => {
        setSuccess("");
        setError("");
        const incidentDocRef = doc(firestore, "incidents", props.id);
        const incidentGroupDocRef = doc(firestore, "incident_groups", incident_group_id);
        
        try{
            await updateDoc(incidentGroupDocRef, {
                incidents: increment(1),
                in_group: arrayUnion(props.id),
            });
            await updateDoc(incidentDocRef, {
                incident_group: incident_group_id,
            });
            setSuccess("Successfully added to incident group");
            window.location.reload();
        } catch(error){
            console.log(error);
            setError(error.message);
        }


    }
  return (
    <div>
        <div>
        {success && <span className='status success'>{success}</span>}
        </div>
        <div>
        {error && <span className='status error'>{error}</span>}
        </div>
        <span className='subheading-l'>Similar Incidents</span>
        <br />
        <br />
        <div className="flex col gap-8">
            {incidents.map((incident) => (
                <>
                    {!incident.incident_group &&
                    <div key={incident.id} className="flex main-between">
                        <div className='flex gap-8 cross-center'>
                            <span className='subheading-m'>{incident.title}</span>
                            <span className='color-minor body-m'>{formatDate(incident.timestamp.seconds)}</span>
                            <span className='color-primary'>{incident.distanceDiff}m away</span>
                        </div>
                    {incident.incident_group && <button className='button filled'>Join</button>}
                    </div>}
                </>
            ))}
            {incidents && <button className="button filled" onClick={() => createIncidentGroup()}>Merge</button>}
        </div>
        <br />
        <span className='subheading-l'>Similar incidents already in a group</span>
        {incidents.map((incident) => (
                <>
                {incident.incident_group && <div key={incident.id} className="flex main-between">
                    <div className='flex gap-8 cross-center'>
                        <span className='subheading-m'>{incident.title}</span>
                        <span className='color-minor body-m'>{formatDate(incident.timestamp.seconds)}</span>
                        <span className='color-primary'>{incident.distanceDiff}m away</span>
                    </div>
                    {incident.incident_group && <button className='button filled' onClick={() => joinIncidentGroup(incident.incident_group)}>Join</button>}
                </div>}
                </>
            ))}
    </div>
  )
}

export default MergeIncidents