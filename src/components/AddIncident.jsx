import React, {useEffect, useState} from 'react'
import { firestore } from '../config/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

const AddIncident = (props) => {
    const navigate = useNavigate();
    const [Title, setTitle] = useState('');
    const [Details, setDetails] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [tags, setTags] = useState([]);

    const [errorMsg, setErrorMsg] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const tagsCollectionRef = collection(firestore, "incident_tags");
                const querySnapshot = await getDocs(tagsCollectionRef);
                const tagsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTags(tagsData);
            } catch (error) {
                console.error("Error fetching tags: ", error);
                setErrorMsg("Error fetching tags.");
            }
        };

        fetchTags();
    }, []);

    const addIncident = async () => {
        setErrorMsg("");

        if(!Title || !Details || !selectedTag){
            setErrorMsg("Missing fields");
            return;
        }
        try{
            const incidentCollectionRef = collection(firestore, "incidents");
            const incidentDocRef = await addDoc(incidentCollectionRef, {
            title: Title,
            details: Details,
            incident_tag: selectedTag.trim(),
            media_attachments: [
                props.attachment
            ],
            coordinates: {
                latitude: props.location.latitude,
                longitude: props.location.longitude,
            },
            reported_by: props.reported_by,
            status: props.status,
            timestamp: serverTimestamp(),
            responders: props.responders,
            location_address: "test",
            rated: false,
            emergency_id: props.id,
            });

            const emergencyDocRef = doc(firestore, "sos", props.id);
            await updateDoc(emergencyDocRef, {
                incident_id: incidentDocRef.id,
            })

        setSuccess("Successfully added incident");
        window.location.reload();
        } catch(error){
            setErrorMsg(error.message);

        }
    }
  return (
    <div>
        <div className="input-field">
            <input type="text" name="" id="" placeholder='Title' onChange={(e) => setTitle(e.target.value)}/>
            <input type="text" name="" id="" placeholder='Details' onChange={(e) => setDetails(e.target.value)}/>
        </div>
        <select name="" id="" className='dropdown' onChange={(e) => setSelectedTag(e.target.value)}>
            <option value="" selected disabled>Select an incident tag</option>
            {tags.map(tag => (
                    <option key={tag.id} value={tag.id}>{tag.tag_name}</option>
                ))}
        </select>
        {errorMsg && <div>
            <span className='status error'>{errorMsg}</span>
        </div>}
        <div><br /></div>
        <button className="button filled" onClick={() => addIncident()}>Add as an incident</button>
    </div>
  )
}

export default AddIncident