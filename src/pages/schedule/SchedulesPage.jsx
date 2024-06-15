import React, {useState, useEffect} from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import '../../styles/schedulepage.css';
import { collection, deleteDoc, onSnapshot, doc, updateDoc, FieldValue } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useModal } from '../../core/ModalContext';
import Modal from '../../components/Modal';
import CreateSchedule from '../../components/CreateSchedule';

const SchedulesPage = () => {
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
      }));
      
      setScheduleList(schedules);
      setFilteredSchedules(schedules);
      console.log(filteredSchedules);

    });
    
    return () => unsubscribe();


  }, []);

  const deleteSchedule = async (schedule_id, complaint_id) => {
    const scheduleDocRef = doc(firestore, "schedules", schedule_id);
    const complaintDocRef = doc(firestore, "schedules", complaint_id);
    try{
      await deleteDoc(scheduleDocRef);
      await updateDoc(complaintDocRef, {
        'schedule_id' : FieldValue.delete(),
      })

      
    } catch(error){
      console.log(error);
      alert(error.message);
    }
  }
  return (
    <>
        <div className="content">
            <Sidebar />
            <div className="main-content">
                <Header title="Scheduled Hearings"/>
                <div className="content-here">
                    <div className="container" style={{'padding' : '0'}}>
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
                                <button className="button secondary" onClick={() => openModal("Update Schedule", "", <CreateSchedule id={schedule.complaint_id} schedule_id={schedule.id} />, "info", <></>)}>Edit</button>
                                <button className="button filled" onClick={() => deleteSchedule(schedule.id, schedule.complaint_id)}>Delete</button>
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