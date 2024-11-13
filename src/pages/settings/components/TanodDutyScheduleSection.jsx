import React, { useState, useEffect } from 'react';
import CreateDutyScheduleModal from './modals/CreateDutyScheduleModal'
import { useModal } from '../../../core/ModalContext';
import Modal from '../../../components/Modal';
import EditDutyScheduleModal from './modals/EditDutyScheduleModal';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';

const TanodDutyScheduleSection = () => {
    const [dutySchedules, setDutySchedules] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const { openModal } = useModal();

    useEffect(() => {
        const dutyScheduleCollectionRef = collection(firestore, "duty_schedules");

        const unsubscribe = onSnapshot(dutyScheduleCollectionRef, (snapshot) => {
            const duties = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setDutySchedules(duties);
        });

        return () => unsubscribe();
    }, []);

    const deleteSchedule = async (schedule_id) => {
        try{
            const scheduleDocRef = doc(firestore, "duty_schedules", schedule_id);
            await deleteDoc(scheduleDocRef);
        } catch(err){
            alert(err);
            console.error(err);
        }
    }

    const filteredStreets = dutySchedules.filter(street => 
        street.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="flex gap-8 col overflow-scroll">
        <div className='flex col'>
            <span className="subheading-m color-major">Tanod Duty Schedule</span>
            <br />
            <span className="body-m color-minor">
                Here, you can manage duty schedules of tanods in the system. This helps group tanods who are in duty that are available for responding to incidents.
            </span>
        </div>
        <div className='flex gap-8'>
                <div className="input-field">
                    <input 
                        type="text" 
                        placeholder='Search Schedule by Name' 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {/* <button 
                    className="button filled" 
                    onClick={() => openModal("Create Duty Schedule", "", <CreateDutyScheduleModal />, "info", <></>)}
                >
                    Create
                </button> */}
            </div>
        <table>
            <thead>
                <tr>
                    <th>Duty Schedule Name</th>
                    <th>Members</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {dutySchedules.map((schedule) => (
                    <tr>
                        <td>{schedule.name}</td>
                        <td>{schedule.members.length}</td>
                        <td>
                            <button className="button secondary" onClick={() => openModal("Edit Tanod Duty Schedule", "", <EditDutyScheduleModal id={schedule.id} name={schedule.name} members={schedule.members}/>, <></>)}>Edit</button>
                            {/* <button className="button filled error" onClick={() => deleteSchedule(schedule.id)}>Delete</button> */}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        <Modal />
    </div>
  )
}

export default TanodDutyScheduleSection