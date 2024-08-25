import React from 'react'
import { InputField } from './InputField'
import { InputButton } from './InputButton'
import { useState, useEffect } from 'react'
import { collection, getDocs, doc, onSnapshot, addDoc, serverTimestamp, updateDoc, getDoc } from "firebase/firestore";
import { firestore, auth } from "../config/firebase";

import { useAuth } from '../core/AuthContext';

const LiveStatusContainer = (props) => {

const { user_type, userPermissions } = useAuth();


const [status, setStatus] = useState('');
const [statusList, setStatusList] = useState([]);
const incidentDocRef = doc(firestore, "incidents", props.id);
const statusCollectionRef = collection(incidentDocRef, "live_status");
const incidentGroupDocRef = doc(firestore, "incident_groups", props.id);
const statusGroupCollectionRef = collection(incidentGroupDocRef, "live_status");

useEffect(() => {
    if(props.group && props.group == true){
        
        
        const unsubscribe = onSnapshot(statusGroupCollectionRef, (snapshot) => {
            const filteredData = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
              content: doc.data().status_content,
              timestamp: new Date(doc.data().timestamp.seconds * 1000).toLocaleString(),
            }));
            
            filteredData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
            setStatusList(filteredData);
          }, (error) => {
            window.alert(error);
          });
    
        return () => unsubscribe();
    } else{
        const unsubscribe = onSnapshot(statusCollectionRef, (snapshot) => {
            const filteredData = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
              content: doc.data().status_content,
              timestamp: new Date(doc.data().timestamp.seconds * 1000).toLocaleString(),
            }));
            
            filteredData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
            setStatusList(filteredData);
          }, (error) => {
            window.alert(error);
          });
    
        return () => unsubscribe();
    }
    
}, []);

    const addStatus = async () => {
        if(status.trim() == ""){
            alert("Please enter status first");
            return;
        }

        if(props.group && props.group == true){
            try{
                await addDoc(statusGroupCollectionRef, {
                    status_content: status.trim(),
                    updated_by: auth.currentUser.uid,
                    timestamp: serverTimestamp(),
                });

                const incidentGroupSnap = await getDoc(incidentGroupDocRef);
                if(!incidentGroupSnap.exists()){
                    alert("does not exist");
                    return;
                }
                const incidentGroupData = incidentGroupSnap.data();

                incidentGroupData.in_group.forEach(async (incidentId) => {
                    const incidentRef = doc(firestore, "incidents", incidentId);
                    const incidentStatusCol = collection(incidentRef, "live_status");

                    await addDoc(incidentStatusCol, {
                        status_content: status.trim(),
                        updated_by: auth.currentUser.uid,
                        timestamp: serverTimestamp(),
                    });
                });
                setStatus("");
            } catch(err){
                console.log(err.message);
            }
        } else{
            try{
                await addDoc(statusCollectionRef, {
                    status_content: status.trim(),
                    updated_by: auth.currentUser.uid,
                    timestamp: serverTimestamp(),
                })
                setStatus("");
            } catch(err){
                console.log(err.message);
            }
        }
    

    }

  return (
    <div id='live_status' className='flex col gap-8 flex-1'>
        <div className="heading flex-1">
            <span className='subheading-l color-major'>Incident Timeline</span>
            <span className='body-s color-minor block'>Keep residents updated on the incident by giving real-time updates.</span>
        </div>
        <div className="messages flex-3 flex gap-8 col">
            {statusList.map((status) => (
                <div key={status.id} className="message flex main-between gap-16">
                    <span className='body-m color-minor flex-1'>{status.timestamp}</span>
                    <span className='body-m color-major flex-2'>{status.content}</span>
                </div>
            ))}
        </div>
        {
            (user_type == 'admin' | userPermissions['manage_incidents']) ?
            <div className="send-message flex-1">
                <div className="flex gap-8">
                    <input type="text" name="" id="" placeholder='Enter timeline here...' onChange={(e) => setStatus(e.target.value)} value={status}/>
                    <button className="button filled" onClick={()=>addStatus()}>Update</button>
                </div>
            </div>
            :
            <></>
        }
        
    </div>
  )
}

export default LiveStatusContainer