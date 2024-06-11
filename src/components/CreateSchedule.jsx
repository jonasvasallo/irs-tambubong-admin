import { addDoc, collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import React, {useState, useEffect} from 'react'
import { firestore } from '../config/firebase';
import { Link } from 'react-router-dom';

import moment from 'moment';

const CreateSchedule = (props) => {

    const [Title, setTitle] = useState();
    const [Notes, setNotes] = useState("");
    const [StartDate, setStartDate] = useState();
    const [EndDate, setEndDate] = useState();
    const [ComplaintID, setComplaintID] = useState();

    const[errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState("");

    const [Scheduled, setScheduled] = useState(false);

    const schedule = async () => {
        setErrorMsg("");

        if(!Title || !StartDate || !EndDate){
            setErrorMsg("You have missing fields. Please double check and try again.");
            return;
        }

        const scheduleCollectionRef = collection(firestore, "schedules");

        const newStartDate = new Date(StartDate);
        const newEndDate = new Date(EndDate);

        const overlappingMeetingsQuery = query(
          scheduleCollectionRef,
          where("meeting_start", "<", newEndDate),
          where("meeting_end", ">", newStartDate)
        );
        
        
        try{
            const querySnapshot = await getDocs(overlappingMeetingsQuery);
            if (!querySnapshot.empty) {
                setErrorMsg("The new meeting schedule overlaps with an existing meeting. Please choose a different time.");
                return;
            }

            if(!Scheduled){
                const scheduleDocRef = await addDoc(scheduleCollectionRef, {
                    complaint_id: props.id,
                    title: Title.trim(),
                    notes: Notes.trim(),
                    meeting_start: new Date(StartDate),
                    meeting_end: new Date(EndDate),
                });
    
                const complaintDocRef = doc(firestore, "complaints", props.id);
                await updateDoc(complaintDocRef, {
                    schedule_id: scheduleDocRef.id,
                });

                setSuccess("Successfully scheduled a meeting");
            } else{
                const scheduleDocRef = doc(firestore, "schedules", props.schedule_id);
                await updateDoc(scheduleDocRef, {
                    complaint_id: props.id,
                    title: Title.trim(),
                    notes: Notes.trim(),
                    meeting_start: new Date(StartDate),
                    meeting_end: new Date(EndDate),
                });
                setSuccess("Successfully updated meeting schedule");
            }

            window.location.reload();
        } catch(error){
            console.log(error);
            setErrorMsg(error.message);
        }
    }

    useEffect(() => {
        const fetchScheduleDoc = async () => {
            const scheduleDocRef = doc(firestore, "schedules", props.schedule_id);
            try{
                const scheduleSnapshot = await getDoc(scheduleDocRef);
                const scheduleData = scheduleSnapshot.data();
                setTitle(scheduleData.title);
                setNotes(scheduleData.notes);
                setStartDate(moment(scheduleData.meeting_start.toDate()).format("YYYY-MM-DDTkk:mm"));
                setEndDate(moment(scheduleData.meeting_end.toDate()).format("YYYY-MM-DDTkk:mm"));
                setComplaintID(scheduleData.complaint_id);
            } catch(error){
                console.log(error);
                setErrorMsg(error.message);
            }

        }
        if(props.schedule_id){
            setScheduled(true);
            fetchScheduleDoc();
        }
    }, []);
  return (
    <div>
        <div className="input-field">
            <input type="text" placeholder='Meeting Title' required onChange={(e) => setTitle(e.target.value)} value={Title}/>
        </div>
        <textarea name="" id="" className='multi-line' placeholder='Notes' rows={5} onChange={(e) => setNotes(e.target.value)} value={Notes}></textarea>
        <div className="input-field">
            <label htmlFor="">Meeting Start Date</label>
            <input type="datetime-local" name="" id="" required onChange={(e) => setStartDate(e.target.value)} value={StartDate}/>
        </div>
        <div className="input-field">
            <label htmlFor="">Meeting End Date</label>
            <input type="datetime-local" name="" id="" required onChange={(e) => setEndDate(e.target.value)} value={EndDate}/>
        </div>
        <div className='w-100'>
            {ComplaintID && <button className='button text' onClick={() => window.location.href=`/complaints/${ComplaintID}`}>Go to complaint</button>}
            {errorMsg && <span className='status error'>{errorMsg}</span>}
            {success && <span className='status success'>{success}</span>}
        </div>
        <br />
        <button className="button filled" onClick={() => schedule()}>Save</button>
    </div>
  )
}

export default CreateSchedule