import React, { useEffect, useState } from 'react'
import { firestore } from '../../../../config/firebase';
import { collection, query, getDocs, where, addDoc } from 'firebase/firestore';
import { useModal } from '../../../../core/ModalContext';
const CreateDutyScheduleModal = () => {
    const [scheduleName, setScheduleName] = useState();
    const [allTanods, setAllTanods] = useState([]);
    const [addedTanods, setAddedTanods] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const {closeModal} = useModal();

    useEffect(() => {
        const fetchAllTanods = async () => {
            const usersRef = collection(firestore, "users");
            const q = query(usersRef, where("user_type", "==", "tanod"));
            const querySnapshot = await getDocs(q);

            let fetchedPersons = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))

            setAllTanods(fetchedPersons);
        }

        fetchAllTanods();
    }, []);

    const addToList = (tanod) => {
        setAddedTanods(prev => [...prev, tanod]);

        setAllTanods(prev => prev.filter(item => item.id !== tanod.id));
    }

    const removeFromList = (tanod) => {
        setAddedTanods(prev => prev.filter(item => item.id !== tanod.id));

        setAllTanods(prev => [...prev, tanod]);
    }

    const createSchedule = async () => {
        setSuccessMsg("");
        setErrorMsg("");
        if(scheduleName == null || scheduleName.length < 1){
            setErrorMsg("Please provide a schedule name!");
            return;
        }

        if(addedTanods.length < 1){
            setErrorMsg("Please add atleast one tanod!");
            return;
        }

        const dutyScheduleCollectionRef = collection(firestore, "duty_schedules");

        try{
            const existValidationQuery = query(dutyScheduleCollectionRef, where("name", "==", scheduleName));
            const querySnapshot = await getDocs(existValidationQuery);

            if(!querySnapshot.empty){
                setErrorMsg("This name is already taken by another!");
                return;
            }

            

            await addDoc(dutyScheduleCollectionRef, {
                name: scheduleName.trim(),
                members: addedTanods.map((tanod) => tanod.id),
            });

            setSuccessMsg("Successfully created!");
            setTimeout(() => closeModal(), 2000);
        } catch(err){
            setErrorMsg(err);
            console.error(err);
        }

    }
  return (
    <div>
        <div className="input-field">
            <input type="text" name="schedule_name" id="schedule_name" placeholder='Duty Schedule Name' onChange={(e) => setScheduleName(e.target.value)} value={scheduleName}/>
        </div>
        <br />
        <b>Included Members</b>
        <hr />
        <div className="flex col gap-8">
            {addedTanods.map((tanod) => (
                    <div key={tanod.id} className="flex gap-8 cross-center main-between">
                        <img src={tanod.profile_path} alt="" width={40} height={40} style={{ objectFit: 'cover' }} />
                        <span className="body-m color-major">{`${tanod.first_name} ${tanod.last_name}`}</span>
                        <span className="body-m color-minor">{tanod.contact_no}</span>
                        <button className="button filled error" onClick={() => removeFromList(tanod)}>X</button>
                    </div>
                ))}
        </div>
        <br />
        <hr />
        <b>Add Members</b>
        <hr />
        <div className="flex col gap-8">
            {allTanods.map((tanod) => (
                <div className="flex gap-8 cross-center main-between">
                    <img src={tanod.profile_path} alt="" width={40} height={40} style={{'objectFit' : 'cover'}}/>
                    <span className="body-m color-major">{`${tanod.first_name} ${tanod.last_name}`}</span>
                    <span className="body-m color-minor">{tanod.contact_no}</span>
                    <button className="button filled" onClick={() => addToList(tanod)}>Add</button>
                </div>
            ))}
        </div>
        <br />
        {errorMsg && <span className="status error">{errorMsg}</span>}
        {successMsg && <span className='status success'>{successMsg}</span>}
        <br />
        <button className="button filled" onClick={() => createSchedule()}>Create</button>
    </div>
  )
}

export default CreateDutyScheduleModal