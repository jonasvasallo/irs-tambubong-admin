import React, {useEffect, useState} from 'react'
import { auth } from '../config/firebase';
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../config/firebase";

const ChatroomMessage = (props) => {
    const [fullName, setFullName] = useState("");

    useEffect(() => {
        const getFullName = async () => {
            try{
                
                const userDocRef = doc(firestore, "users", props.uid);
                const userDocSnap = await getDoc(userDocRef);
        
                if(!userDocSnap.exists()){
                  alert('No such user');
                  return;
                }
                setFullName(`${userDocSnap.data().first_name} ${userDocSnap.data().last_name}`);
            } catch(err){
                console.log(err);
                alert(err);
            }
        }

        getFullName();
        
    }, []);
    const messageClass = auth.currentUser && props.uid === auth.currentUser.uid ? 'sent' : 'received';
    return (
        <div className={`message-row ${messageClass}`}>
            <div className={`message ${messageClass} flex col`}>
                {(messageClass == "received") ? <div className="name subheading-s">{fullName}</div> : <></>}
                <div className="message-box">
                    {props.message}
                </div>
            </div>
        </div>
    )
}

export default ChatroomMessage