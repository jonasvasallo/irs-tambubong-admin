import React from 'react'
import { InputField } from './InputField'
import { InputButton } from './InputButton'
import { useState, useEffect } from 'react'
import { collection, getDocs, doc, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, firestore } from "../config/firebase";
import ChatroomMessage from './ChatroomMessage';

const ChatroomContainer = (props) => {
  const [messageList, setMessageList] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const incidentDocRef = doc(firestore, "incidents", props.id);
  const chatroomCollectionRef = collection(incidentDocRef, "chatroom");
  useEffect(() => {
    const unsubscribe = onSnapshot(chatroomCollectionRef, (snapshot) => {
      const filteredData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        uid: doc.data().sent_by,
        timestamp: new Date(doc.data().timestamp.seconds * 1000).toLocaleString(),
      }));
      
      filteredData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      setMessageList(filteredData);
    }, (error) => {
      window.alert(error);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if(newMessage.trim() == ""){
        alert("Please enter message first");
        return;
    }

    try{
        await addDoc(chatroomCollectionRef, {
            content: newMessage.trim(),
            sent_by: auth.currentUser.uid,
            timestamp: serverTimestamp(),
        })
        setNewMessage("");
    } catch(err){
        console.log(err.message);
    }

    
  }
  return (
    <div id='chatroom' className='h-100 flex col gap-8'>
        <div className="heading">
            <span className='subheading-l color-major'>Chatroom</span>
        </div>
        <div className="messages flex-3 flex gap-8 col">
            {/* <ChatroomMessage key={1234} uid="Full Namey" message="lorem" /> */}
            {messageList.map((message) => (
                <ChatroomMessage key={message.id} uid={message.uid} message={message.content} />
            ))}
        </div>
        <div className="send-message flex-1">
            <div className="flex gap-8">
                <input type="text" name="" id="" placeholder='Enter message here...' onChange={(e) => setNewMessage(e.target.value)} value={newMessage}/>
                <InputButton label='Send' buttonType="filled" onClick={() => sendMessage()}/>
            </div>
        </div>
    </div>
  )
}

export default ChatroomContainer