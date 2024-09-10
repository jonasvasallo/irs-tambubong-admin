import React, {useState, useEffect} from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import '../../styles/schedulepage.css';
import { collection, deleteDoc, onSnapshot, doc, updateDoc, FieldValue, deleteField, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../../config/firebase';
import { useModal } from '../../core/ModalContext';
import Modal from '../../components/Modal';
import CreateSchedule from '../../components/CreateSchedule';

import { useAuth } from '../../core/AuthContext';

const SchedulesPage = () => {

  const { user_type, userPermissions } = useAuth();

  const { openModal } = useModal();
  const [ScheduleList, setScheduleList] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {


    const unsubscribe = onSnapshot(collection(firestore, "schedules"), (snapshot) => {
      const schedules = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        meeting_start: doc.data().meeting_start.toDate(), // Convert Firestore timestamp to Date
        meeting_end: doc.data().meeting_end.toDate(), // Convert Firestore timestamp to Date
      })).sort((a, b) => a.timestamp - b.timestamp);;
      
      setScheduleList(schedules);
      setFilteredSchedules(schedules);
      console.log(filteredSchedules);

    });
    
    return () => unsubscribe();


  }, []);

  const deleteSchedule = async (schedule_id, complaint_id) => {
    const scheduleDocRef = doc(firestore, "schedules", schedule_id);
    const complaintDocRef = doc(firestore, "complaints", complaint_id);
    console.log(complaint_id);
    try{
      // Fetch the schedule document
    const scheduleDoc = await getDoc(scheduleDocRef);
    if (!scheduleDoc.exists()) {
      console.log("Schedule document does not exist");
      return;
    }

    const scheduleData = scheduleDoc.data();
    const meetingEnd = scheduleData.meeting_end.toDate(); // Assuming meeting_end is a Firestore Timestamp

    // Check if meeting_end is in the past
    const now = new Date();
    if (meetingEnd < now) {
      alert("Meeting has already ended. Cannot delete.");
      return;
    }

      await deleteDoc(scheduleDocRef);

      await addDoc(collection(firestore, "audits"), {
        uid: auth.currentUser.uid,
        action: 'delete',
        module: 'complaints',
        description: `Removed schedule for complaint id ${complaint_id}`,
        timestamp: serverTimestamp(),
      });

    // Fetch the complaint document
    const complaintDoc = await getDoc(complaintDocRef);
    if (complaintDoc.exists()) {
      const complaintData = complaintDoc.data();
      const hearings = complaintData.hearings || [];

      // Filter out the map with the specified schedule_id
      const updatedHearings = hearings.filter(hearing => hearing.schedule_id !== schedule_id);

      console.log(updatedHearings);

      // Update the complaint document with the new hearings array
      if(updatedHearings.length > 0){
        await updateDoc(complaintDocRef, {
          'schedule_id' : deleteField(),
          hearings: updatedHearings
        });
      } else{
        await updateDoc(complaintDocRef, {
          'schedule_id' : deleteField(),
          hearings: deleteField(),
        });
      }
    } else {
      console.log("Complaint document does not exist");
    }

      
    } catch(error){
      console.log(error);
      alert(error.message);
    }
  }

  const handleEdit = async (schedule) => {
    const now = new Date();
    if (new Date(schedule.meeting_end) < now) {
      alert("Cannot edit past hearings.");
      return;
    }
    openModal("Update Schedule", "", <CreateSchedule id={schedule.complaint_id} schedule_id={schedule.id} />, "info", <></>);
  }

  return (
    <>
        <div className="content">
            <Sidebar />
            <div className="main-content">
                <Header title="Scheduled Hearings"/>
                <div className="content-here">
                    <div className="container overflow-scroll" style={{'padding' : '0'}}>
                      <div className="schedule-header flex main-between">
                        <div className="flex gap-16">
                          <div className="flex gap-8 cross-center">
                            <button className={`button text subheading-m ${filter === 'upcoming' && 'active'}`} onClick={() => setFilteredSchedules(ScheduleList)}>All</button>
                            <div className='items'>{ScheduleList.length}</div>
                          </div>
                          <div className="flex gap-8 cross-center">
                            <button className={`button text subheading-m ${filter === 'upcoming' && 'active'}`} onClick={() => setFilteredSchedules(ScheduleList.filter(schedule => new Date(schedule.meeting_start) > new Date()))}>Upcoming</button>
                            <div className='items'>{ScheduleList.filter(schedule => new Date(schedule.meeting_start) > new Date()).length}</div>
                          </div>
                          <div className="flex gap-8 cross-center">
                            <button className={`button text subheading-m ${filter === 'upcoming' && 'active'}`} onClick={() => setFilteredSchedules(ScheduleList.filter(schedule => schedule.meeting_start <= new Date() && new Date() <= schedule.meeting_end))}>Happening</button>
                            <div className='items'>{ScheduleList.filter(schedule => new Date(schedule.meeting_start) <= new Date() && new Date() <= schedule.meeting_end).length}</div>
                          </div>
                          <div className="flex gap-8 cross-center">
                            <button className={`button text subheading-m ${filter === 'past' && 'active'}`} onClick={() => setFilteredSchedules(ScheduleList.filter(schedule => new Date(schedule.meeting_end) < new Date()))}>Past</button>
                            <div className='items'>{ScheduleList.filter(schedule => new Date(schedule.meeting_end) < new Date()).length}</div>
                          </div>
                        </div>
                      </div>
                      <table>
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Date Time Start</th>
                            <th>Date Time End</th>
                            <th>Duration</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                        {filteredSchedules
                          .sort((a, b) => new Date(a.meeting_start) - new Date(b.meeting_start))
                          .map((schedule) => (
                            <tr key={schedule.id}>
                              <td>{schedule.title}</td>
                              <td>{new Date(schedule.meeting_start).toLocaleString()}</td>
                              <td>{new Date(schedule.meeting_end).toLocaleString()}</td>
                              <td>
                                {Math.round((new Date(schedule.meeting_end) - new Date(schedule.meeting_start)) / 60000)} minutes
                              </td>
                              <td>
                                {
                                  (user_type == 'admin' || userPermissions['manage_complaints'])
                                  ?
                                  <>
                                    <button className="button secondary" onClick={() => handleEdit(schedule)}>Edit</button>
                                    <button className="button filled" onClick={() => deleteSchedule(schedule.id, schedule.complaint_id)}>Delete</button>
                                  </>
                                  :
                                  <></>
                                }
                              </td>
                            </tr>
                          ))
                        }
                        </tbody>
                      </table>
                    </div>
                </div>
            </div>
            <Modal/>
        </div>
    </>
  )
}

export default SchedulesPage