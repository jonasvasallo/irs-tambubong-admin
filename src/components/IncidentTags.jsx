import React, { useState, useEffect } from 'react'
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, firestore } from "../config/firebase";

const IncidentTags = (props) => {
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [inputTag, setInputTag] = useState(null);
    const [success, setSuccess] = useState("");
    const [errorMsg, setErrorMsg] = useState('');
 
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

    const saveTag = async () => {
        setErrorMsg("");
        if (!selectedTag && !inputTag) {
            setErrorMsg("Please select a tag first!");
            return;
        }

        if (selectedTag && inputTag) {
            setErrorMsg("You cannot insert and update a tag simultaneously!");
            return;
        }

        if (selectedTag && !inputTag) {
            try {
                const docRef = doc(firestore, "incidents", props.id);
                await updateDoc(docRef, {
                    incident_tag: selectedTag.trim()
                });
                await addDoc(collection(firestore, "audits"), {
                    uid: auth.currentUser.uid,
                    action: 'update',
                    module: 'incidents',
                    description: `Updated an incident tag to ${selectedTag.trim()} for incident ID ${props.id}`,
                    timestamp: serverTimestamp(),
                });
                setSuccess('Incident tag updated successfully.');
                setErrorMsg('');
                window.location.reload();
              } catch (error) {
                  console.error("Error updating status: ", error);
                  setErrorMsg('Error updating status.');
                  setSuccess('');
              }
        } else if (!selectedTag && inputTag) {
            const tagExists = tags.some(tag => tag.tag_name.toLowerCase() === inputTag.trim().toLowerCase());

            if (tagExists) {
                setErrorMsg("Tag name already exists!");
                return;
            }
            try{
                await addDoc(collection(firestore, "incident_tags"), {
                    tag_name: inputTag.trim()
                });
                setSuccess('Incident tag updated successfully.');
                setErrorMsg('');
                window.location.reload();
            } catch(error){
                console.error("Error updating status: ", error);
                  setErrorMsg('Error updating status.');
                  setSuccess('');
            }
        } else {
            setErrorMsg("Please select or enter a tag.");
            return;
        }

        return;

    }
  return (
    <div>
        <span>Choose an existing incident tag</span>
        <select name="" id="" className='dropdown' onChange={(e) => setSelectedTag(e.target.value)} placeholder="Choose tag">
            <option value="" selected disabled>Select a tag</option>
            {tags.map(tag => (
                    <option key={tag.id} value={tag.id}>{tag.tag_name}</option>
                ))}
        </select>
        {/* <span>or create a new one</span>
        <div className="input-field">
            <input type="text" placeholder='Incident Tag Name' onChange={(e) => setInputTag(e.target.value)}/>
        </div> */}
        {errorMsg && <div>
            <span className='status error'>{errorMsg}</span>
        </div>}
        <br />
        <button className="button filled" onClick={() => saveTag()}>Save</button>
        
    </div>
  )
}

export default IncidentTags