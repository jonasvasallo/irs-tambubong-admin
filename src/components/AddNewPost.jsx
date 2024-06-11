import React, { useState, useEffect } from 'react';
import { firestore, storage, auth } from '../config/firebase';
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const AddNewPost = (props) => {
    const [Heading, setHeading] = useState();
    const [Body, setBody] = useState();
    const [Files, setFiles] = useState([]);
    const [MediaAttachments, setMediaAttachments] = useState([]);
    const [removedMedia, setRemovedMedia] = useState([]);

    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState("");

    const addPost = async () => {
        setErrorMsg("");

        if(!Heading || !Body){
            setErrorMsg("News must contain a heading and body!");
            return;
        }

        if(!props.id){
            const mediaAttachments = [];

            try{
                if(Files.length > 0){
                    for (const file of Files) {
                        const storageRef = ref(storage, `news_attachment/${file.name}_${uuidv4()}`);
                        const snapshot = await uploadBytes(storageRef, file);
                        const downloadURL = await getDownloadURL(snapshot.ref);
                        mediaAttachments.push(downloadURL);
                    }
                }
                
        
                const newsData = {
                    heading: Heading.trim(),
                    body: Body.trim(),
                    media_attachments: mediaAttachments,
                    timestamp: serverTimestamp(),
                    posted_by: auth.currentUser ? auth.currentUser.uid : 'anonymous',
                    like_count: 0,
                    comment_count: 0,
                };
        
                await addDoc(collection(firestore, 'news'), newsData);
                setSuccess("News posted successfully");
                window.location.reload();
            } catch(error){
                console.log(error);
                setErrorMsg(error.message);
            }
        } else{
            const newsDocRef = doc(firestore, "news", props.id);

            try{
                await updateDoc(newsDocRef, {
                    heading: Heading.trim(),
                    body: Body.trim(),
                    media_attachments: MediaAttachments,
                })

                setSuccess("Successfully updated post");
                window.location.reload();
            } catch(error){
                console.log(error);
                setErrorMsg(error.message);
            }
        }
        
    }

    useEffect(() => {
        const fetchNewsDetails = async () => {
            console.log("Fetched");
            const newsDocRef = doc(firestore, "news", props.id);
            try{
                const newsSnapshot = await getDoc(newsDocRef);
                const newsData = newsSnapshot.data();
                setHeading(newsData.heading);
                setBody(newsData.body);
                setMediaAttachments(newsData.media_attachments);
            } catch(error){
                console.log(error);
                alert(error.message);
            }
        }
        if(props.id){
            fetchNewsDetails();
        }
    }, []);


    const removeFromAttachments = (media) => {
        setMediaAttachments((prevMediaAttachments) =>
            prevMediaAttachments.filter((item) => item !== media)
        );
    }

  return (
    <div>
        <div className="input-field">
            <input type="text" name="" id="" placeholder='Heading' onChange={(e) => setHeading(e.target.value)} value={Heading}/>
        </div>
        <textarea name="" id="" className="multi-line" rows={5} placeholder='Body' onChange={(e) => setBody(e.target.value)} value={Body}></textarea>
        {(!props.id) ? 
        <input type="file" name="" id="" className='button outlined' multiple onChange={(e)=>setFiles(e.target.files)} accept="image/png, image/gif, image/jpeg"/> 
        : 
        <div className='flex gap-8 wrap'>
            {MediaAttachments.map((media) => (
                <div className='media'>
                    <img src={media} width={200} height={100} alt=''/>
                    <button className='button filled' onClick={() => removeFromAttachments(media)}>X</button>
                </div>
            ))}
        </div>
        }
        <div>
            {errorMsg && <span className='status error'>{errorMsg}</span>}
            {success && <span className='status success'>{success}</span>}
        </div>
        <div>
        <br />
        <button className="button filled" onClick={() => addPost()}>Save</button>
        </div>
    </div>
  )
}

export default AddNewPost