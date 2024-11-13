import React, { useEffect, useState } from 'react'
import { firestore } from '../../../../config/firebase';
import { collection, query, getDocs, where, addDoc, getDoc, doc, updateDoc } from 'firebase/firestore';
import { useModal } from '../../../../core/ModalContext';

const EditDutyScheduleModal = (props) => {
    const [scheduleName, setScheduleName] = useState(props.name);
    const [addedTanods, setAddedTanods] = useState([]);
    const [removedTanods, setRemovedTanods] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const {closeModal} = useModal();
    useEffect(() => {
        const tanodMembers = props.members;
        const fetchTanodsWithDetails = async () => {
            const usersRef = collection(firestore, "users");
            

            try {
                const userDetails = await Promise.all(
                    tanodMembers.map(async (tanod) => {
                        if (!tanod) {
                            console.warn("Invalid tanod ID:", tanod);
                            return null; // Skip if the tanod object or id is invalid
                        }
                        const userDoc = doc(usersRef, tanod);
                        const userSnap = await getDoc(userDoc);
        
                        if (userSnap.exists()) {
                            return { id: tanod, ...userSnap.data() };
                        } else {
                            console.log(`No user found with ID: ${tanod}`);
                            return null;
                        }
                    })
                );
        
                const filteredUserDetails = userDetails.filter(user => user !== null);
                setAddedTanods(filteredUserDetails);
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        };

        const fetchRemovedTanods = async () => {
            const usersRef = collection(firestore, "users");
            const q = query(usersRef, where("user_type", "==", "tanod"));
            const querySnapshot = await getDocs(q);
        
            const fetchedTanods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
            // Exclude tanods whose IDs are in tanodMembers (props.members)
            const filteredRemovedTanods = fetchedTanods.filter(
                tanod => !tanodMembers.includes(tanod.id)
            );
            setRemovedTanods(filteredRemovedTanods);
        };
        

        // Fetch addedTanods first, then fetch and set removedTanods
        fetchTanodsWithDetails().then(fetchRemovedTanods);
    }, []);

    const handleRemoveTanod = (tanod) => {
        setAddedTanods(prev => prev.filter(item => item.id !== tanod.id));

        setRemovedTanods(prev => [...prev, tanod]);
    }

    const handleAddTanod = (tanod) => {
        setRemovedTanods(prev => prev.filter(item => item.id !== tanod.id));

        setAddedTanods(prev => [...prev, tanod]);
    }

    const updateSchedule = async () => {
        setErrorMsg("");
        setSuccessMsg("");
        if(!scheduleName || scheduleName == null || scheduleName.length < 1){
            setErrorMsg("Please provide a name!");
            return;
        }

        if(addedTanods.length < 1){
            setErrorMsg("Must have atleast one tanod!");
            return;
        }

        const dutyScheduleCollectionRef = collection(firestore, "duty_schedules");
        const dutyScheduleDocRef = doc(firestore, "duty_schedules", props.id);
        try{
            const existValidationQuery = query(
                dutyScheduleCollectionRef,
                where("name", "==", scheduleName)
            );
            const querySnapshot = await getDocs(existValidationQuery);
    
            const duplicate = querySnapshot.docs.find(doc => doc.id !== props.id);
            if (duplicate) {
                setErrorMsg("This name is already taken by another schedule!");
                return;
            }

            await updateDoc(dutyScheduleDocRef, {
                name: scheduleName.trim(),
                members: addedTanods.map((tanod) => tanod.id),
            });

            setSuccessMsg("Successfully updated!");
            setTimeout(() => closeModal(), 2000);
        } catch(err){
            setErrorMsg(err);
            console.error(err);
        }
    }
    
  return (
    <div>
        <span className="heading-s color-major">{scheduleName}</span>
        <br />
        <br />
        <b>Members</b>
        <hr />
        <div className="flex col gap-8">
            {addedTanods.map((tanod) => (
                <div className="flex gap-8 cross-center main-between">
                    <img src={tanod.profile_path} alt="" width={40} height={40}/>
                    <span className="body-m color-major">{`${tanod.first_name} ${tanod.last_name}`}</span>
                    <span className="body-m color-minor">{tanod.contact_no}</span>
                    <button className="button filled error" onClick={() => handleRemoveTanod(tanod)}>Remove</button>
                </div>
            ))}
        </div>
        <hr />
        <br />
        <b>Add More Members</b>
        <hr />
        <div className="flex col gap-8">
            {removedTanods.map((tanod) => (
                <div className="flex gap-8 cross-center main-between">
                    <img src={tanod.profile_path} alt="" width={40} height={40}/>
                    <span className="body-m color-major">{`${tanod.first_name} ${tanod.last_name}`}</span>
                    <span className="body-m color-minor">{tanod.contact_no}</span>
                    <button className="button filled" onClick={() => handleAddTanod(tanod)}>Add</button>
                </div>
            ))}
        </div>
        <br />
        {errorMsg && <span className="status error">{errorMsg}</span>}
        {successMsg && <span className="status success">{successMsg}</span>}
        <br />
        <button className="button filled" onClick={() => updateSchedule()}>Save Changes</button>
    </div>
  )
}

export default EditDutyScheduleModal