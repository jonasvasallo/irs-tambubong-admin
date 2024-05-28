import React from 'react'
import { InputField } from './InputField'
import { InputButton } from './InputButton'
import { useState, useEffect } from 'react'
import { collection, getDocs, doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../config/firebase";

const LiveStatusContainer = (props) => {

const [statusList, setStatusList] = useState([]);
const incidentDocRef = doc(firestore, "incidents", props.id);
const statusCollectionRef = collection(incidentDocRef, "live_status");

useEffect(() => {
    console.log("use effect fired");
    //     const unsubscribe = onSnapshot(statusCollectionRef, (snapshot) => {

    //     const filteredData = snapshot.docs.map((doc) => ({
    //       ...doc.data(),
    //       id: doc.id,
    //       content: doc.data().status_content,
    //       timestamp: new Date(doc.data().timestamp.seconds * 1000).toLocaleString(),
    //     }));
        
    //     filteredData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    //     setStatusList(filteredData);
    //     console.log("this happened");
    //   }, (error) => {
    //     window.alert(error);
    //   });

    // return () => unsubscribe();
    
}, []);


  return (
    <div id='live_status' className='h-100 flex col gap-8'>
        <div className="heading flex-1">
            <span className='subheading-l color-major'>Incident Live Status</span>
            <span className='body-s color-minor block'>Notify the residents about the status of an incident by updating them here.</span>
        </div>
        <div className="messages flex-3 flex gap-8 col">
            {statusList.map((status) => (
                <div key={status.id} className="message flex main-between gap-16">
                    <span className='body-m color-minor flex-1'>{status.timestamp}</span>
                    <span className='body-m color-major flex-2'>{status.content}</span>
                </div>
            ))}
        </div>
        <div className="send-message flex-1">
            <div className="flex gap-8">
                <input type="text" name="" id="" placeholder='Enter status here...'/>
                <InputButton label='Update' buttonType="filled"/>
            </div>
        </div>
        
    </div>
  )
}

export default LiveStatusContainer