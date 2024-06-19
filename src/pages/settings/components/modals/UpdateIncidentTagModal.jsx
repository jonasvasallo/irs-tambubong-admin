import { updateDoc, collection, doc, query, where, getDocs  } from 'firebase/firestore';
import React, {useState} from 'react'
import { firestore, storage } from '../../../../config/firebase';
import { useModal } from '../../../../core/ModalContext';
import {v4} from 'uuid';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const UpdateIncidentTagModal = (props) => {
  const {closeModal} = useModal();
  const [initialTag, setInitialTag] = useState(props.name);
  const [incidentTag, setIncidentTag] = useState(props.name);
  const [errorMsg, setErrorMsg] = useState();
  const [success, setSuccess] = useState();
  const [imageUpload, setImageUpload] = useState(null);

  const createTag = async ()=>{
      setErrorMsg("");
      if(!incidentTag){
          setErrorMsg("Please provide a name for the incident tag!");
          return;
      }
      if(initialTag == incidentTag){
        setErrorMsg("Tag name cannot be the same!")
        return;
      }
      const incidentTagDocRef = doc(firestore, "incident_tags", props.id);
      const incidentTagsCollectionRef = collection(firestore, "incident_tags");
      try{
        //validation
        const q = query(incidentTagsCollectionRef, where("tag_name", "==", incidentTag.trim()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            setErrorMsg("Tag name already exists!");
            return;
        }

        if(imageUpload != null){
            await validateImage(imageUpload);

            const imageRef = ref(storage, `incident_tags_icons/${imageUpload.name + v4()}`);

            await uploadBytes(imageRef, imageUpload).then(async () => {
                var url_link = "";
                await getDownloadURL(imageRef).then((url) => {
                    url_link = url;
                });

                await updateDoc(incidentTagDocRef, {
                    tag_name: incidentTag.trim(),
                    priority: 'Low',
                    tag_image: url_link,
                })
                setSuccess("Successfully updated incident tag");
                setTimeout(() => closeModal(), 2000);
                
            })
        } else{
            await updateDoc(incidentTagDocRef, {
                tag_name: incidentTag.trim(),
                priority: 'Low',
            })
            setSuccess("Successfully updated incident tag");
            setTimeout(() => closeModal(), 2000);
        }
      } catch(error){
          setErrorMsg(error.message);
      }
  }

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
  return (
    <div>
        <div className="input-field">
            <input type="text" name="" id="" required value={incidentTag} onChange={(e) => setIncidentTag(e.target.value)} placeholder='Incident Tag Name'/>
        </div>
        <input type="file" name="" id="" accept="image/png" onChange={(e) => setImageUpload(e.target.files[0])}/>
        <div>
            {errorMsg && <span className='status error'>{errorMsg}</span>}
            {success && <span className='status success'>{success}</span>}
        </div>
        <br />
        <button className="button filled" onClick={() => createTag()}>Update</button>
    </div>
  )
}

export default UpdateIncidentTagModal