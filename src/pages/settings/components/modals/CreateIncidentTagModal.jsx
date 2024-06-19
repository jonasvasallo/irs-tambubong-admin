import { addDoc,collection, query, where, getDocs } from 'firebase/firestore';
import React, {useState} from 'react'
import { firestore, storage } from '../../../../config/firebase';
import { useModal } from '../../../../core/ModalContext';
import {v4} from 'uuid';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CreateIncidentTagModal = () => {
    const {closeModal} = useModal();
    const [imageUpload, setImageUpload] = useState(null);
    const [incidentTag, setIncidentTag] = useState("");
    const [errorMsg, setErrorMsg] = useState();
    const [success, setSuccess] = useState();

    const [isCreated, setIsCreated] = useState(false);

    const validateImage = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                setErrorMsg("Please upload an image!");
                reject("Please upload an image!");
                
            } else if (file.type !== 'image/png') {
                setErrorMsg("Only PNG files are allowed!");
                reject("Only PNG files are allowed!");
                
            } else {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                img.onload = () => {
                    if (img.width === 512 && img.height === 512) {
                        resolve();
                    } else {
                        setErrorMsg("Image dimensions must be 512x512 pixels!");
                        reject("Image dimensions must be 512x512 pixels!");
                        
                    }
                };
                img.onerror = () => {
                    setErrorMsg("Invalid image file!");
                    reject("Invalid image file!");
                    
                };
            }
        });
    };

    const createTag = async ()=>{
        setSuccess("");
        setErrorMsg("");
        if(isCreated){
            setErrorMsg("Cannot create again!");
            return;
        }
        if(!incidentTag){
            setErrorMsg("Please provide a name for the incident tag!");
            return;
        }
        if(imageUpload == null){
            setErrorMsg("You must give the tag an icon!");
            return;
        }
        const incidentTagsCollectionRef = collection(firestore, "incident_tags");

        try{
            //validation
            const q = query(incidentTagsCollectionRef, where("tag_name", "==", incidentTag.trim()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setErrorMsg("Tag name already exists!");
                return;
            }

            await validateImage(imageUpload);

            const imageRef = ref(storage, `incident_tags_icons/${imageUpload.name + v4()}`);

            await uploadBytes(imageRef, imageUpload).then(async () => {
                var url_link = "";
                await getDownloadURL(imageRef).then((url) => {
                    url_link = url;
                });

                await addDoc(incidentTagsCollectionRef, {
                    tag_name: incidentTag.trim(),
                    priority: 'Low',
                    tag_image: url_link,
                })
            })
            setSuccess("Successfully created incident tag");
            setIsCreated(true);
            setTimeout(() => closeModal(), 2000);
        } catch(error){
            setErrorMsg(error);
            console.log(errorMsg);
        }
    }
  return (
    <div>
        <div className="input-field">
            <input type="text" name="" id="" required onChange={(e) => setIncidentTag(e.target.value)} placeholder='Incident Tag Name'/>
        </div>
        <input type="file" name="" id="" accept="image/png" onChange={(e) => setImageUpload(e.target.files[0])}/>
        <div>
            {errorMsg && <span className='status error'>{errorMsg}</span>}
            {success && <span className='status success'>{success}</span>}
        </div>
        <br />
        <button className="button filled" onClick={() => createTag()}>Create</button>
    </div>
  )
}

export default CreateIncidentTagModal