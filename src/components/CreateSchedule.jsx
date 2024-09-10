import { addDoc, collection, query, where, getDocs, doc, updateDoc, getDoc, serverTimestamp, arrayUnion, documentId, FieldPath } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../config/firebase';
import { Link } from 'react-router-dom';
import moment from 'moment';

const CreateSchedule = (props) => {
    const [Title, setTitle] = useState("");
    const [Notes, setNotes] = useState("");
    const [StartDate, setStartDate] = useState("");
    const [EndDate, setEndDate] = useState("");
    const [ComplaintID, setComplaintID] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState("");
    const [Scheduled, setScheduled] = useState(false);

    const schedule = async () => {
        setErrorMsg("");

        if (!Title || !StartDate || !EndDate) {
            setErrorMsg("You have missing fields. Please double check and try again.");
            return;
        }

        const date = moment(StartDate);
        const day = date.format("Do");
        const period = date.hour() < 12 ? 'in the morning' : 'in the afternoon';
        const formattedDate = `${day} ${date.format(`[day of] MMMM, YYYY [at] h:mm`)} o'clock ${period}`;

        const newStartDate = new Date(StartDate);
        const newEndDate = new Date(EndDate);

        const currentDate = new Date();
        if (newStartDate < currentDate) {
            setErrorMsg(`The hearing start date and time cannot be in the past.`);
            return;
        } else if(newEndDate < currentDate){
            setErrorMsg("The hearing end date and time cannot be in the past.");
            return;
        }
        
        const durationInMinutes = (newEndDate - newStartDate) / 1000 / 60;

        if (durationInMinutes < 60) {
            setErrorMsg("The hearing duration must be at least 60 minutes.");
            return;
        }

       


        const scheduleCollectionRef = collection(firestore, "schedules");
        let overlappingMeetingsQuery;
        if (Scheduled) {
            overlappingMeetingsQuery = query(
                scheduleCollectionRef,
                where("meeting_start", "<", newEndDate),
                where("meeting_end", ">", newStartDate),
                where(documentId(), "!=", props.schedule_id)
            );
        } else {
            overlappingMeetingsQuery = query(
                scheduleCollectionRef,
                where("meeting_start", "<", newEndDate),
                where("meeting_end", ">", newStartDate)
            );
        }

        try {
            const querySnapshot = await getDocs(overlappingMeetingsQuery);
            if (!querySnapshot.empty) {
                setErrorMsg("The new hearing schedule overlaps with an existing hearing. Please choose a different time.");
                return;
            }

            if (!Scheduled) {
                const scheduleDocRef = await addDoc(scheduleCollectionRef, {
                    complaint_id: props.id,
                    title: Title.trim(),
                    notes: Notes.trim(),
                    meeting_start: newStartDate,
                    meeting_end: newEndDate,
                });

                await addDoc(collection(firestore, "audits"), {
                    uid: auth.currentUser.uid,
                    action: 'create',
                    module: 'complaints',
                    description: `Scheduled a hearing for complaint ID ${props.id}`,
                    timestamp: serverTimestamp(),
                });

                const complaintDocRef = doc(firestore, "complaints", props.id);
                await updateDoc(complaintDocRef, {
                    schedule_id: scheduleDocRef.id,
                    status: 'In Progress',
                    hearings: arrayUnion({
                        schedule_id: scheduleDocRef.id,
                        status : 'Pending',
                    }),
                });

                const complainantDocRef = doc(firestore, "users", props.complainant);
                const complainantNotificationsCollectionRef = collection(complainantDocRef, "notifications");
                await addDoc(complainantNotificationsCollectionRef, {
                    'title': 'Notice of Hearing',
                    'content': `Your complaint has been scheduled for a conciliation hearing. You are hereby required to appear at the barangay hall on the ${formattedDate} for the hearing of your complaint. Please bring any relevant documents or evidence related to your complaint. If you wish to reschedule, file a support ticket found within the app's directory given that the reason for the reschedule is reasonable.`,
                    'timestamp': serverTimestamp(),
                });

                if (props.respondent) {
                    const respondentDocRef = doc(firestore, "users", props.respondent);
                    const respondentNotificationsCollectionRef = collection(respondentDocRef, "notifications");
                    await addDoc(respondentNotificationsCollectionRef, {
                        'title': 'You are being summoned',
                        'content': `You are hereby summoned to appear at the barangay hall on the ${formattedDate} then and there to answer to a compaint made before you for mediation/conciliation of your dispute with the complainant. Please bring any relevant documents or evidence that you may need for your defense. You are hereby warned that if you refuse or willfully fail to appear in obedience of this summon, you may be barred from filing any counterclaim arising from said complaint. If you wish to reschedule, file a support ticket found within the app's directory given that the reason for the reschedule is reasonable.`,
                        'timestamp': serverTimestamp(),
                    });
                }

                setSuccess("Successfully scheduled hearing");
            } else {
                const scheduleDocRef = doc(firestore, "schedules", props.schedule_id);

                const scheduleSnapshot = await getDoc(scheduleDocRef);
                const existingScheduleData = scheduleSnapshot.data();

                const scheduleChanged = (
                    existingScheduleData.meeting_start.toMillis() !== newStartDate.getTime() ||
                    existingScheduleData.meeting_end.toMillis() !== newEndDate.getTime()
                );
                await updateDoc(scheduleDocRef, {
                    complaint_id: props.id,
                    title: Title.trim(),
                    notes: Notes.trim(),
                    meeting_start: newStartDate,
                    meeting_end: newEndDate,
                });

                await addDoc(collection(firestore, "audits"), {
                    uid: auth.currentUser.uid,
                    action: 'update',
                    module: 'complaints',
                    description: `Updated hearing schedule for complaint ID ${props.id}`,
                    timestamp: serverTimestamp(),
                });
                
                if(scheduleChanged){
                    const complaintDocRef = doc(firestore, "complaints", props.id);
                    const complaintSnapshot = await getDoc(complaintDocRef);
                    const complaintData = complaintSnapshot.data();

                    const complainantDocRef = doc(firestore, "users", complaintData.issued_by);
                    const complainantNotificationsCollectionRef = collection(complainantDocRef, "notifications");
                    await addDoc(complainantNotificationsCollectionRef, {
                        'title': 'Scheduled hearing has been updated',
                        'content': `Please be advised that the date and time for your scheduled hearing regarding your complaint has been changed. The updated schedule is the ${formattedDate}. Kindly take note of this update.`,
                        'timestamp': serverTimestamp(),
                    });

                    if (complaintData.respondent_id) {
                        const respondentDocRef = doc(firestore, "users", complaintData.respondent_id);
                        const respondentNotificationsCollectionRef = collection(respondentDocRef, "notifications");
                        await addDoc(respondentNotificationsCollectionRef, {
                            'title': 'Scheduled hearing has been updated',
                            'content': `Please be advised that the date and time for your scheduled hearing regarding the complaint you have received has been changed. The updated schedule is ${StartDate}. Kindly take note of this update.`,
                            'timestamp': serverTimestamp(),
                        });
                    }
                }
                
                setSuccess("Successfully updated hearing schedule");
            }

            window.location.reload();
        } catch (error) {
            console.log(error);
            setErrorMsg(error.message);
        }
    };

    useEffect(() => {
        const fetchScheduleDoc = async () => {
            const scheduleDocRef = doc(firestore, "schedules", props.schedule_id);
            try {
                const scheduleSnapshot = await getDoc(scheduleDocRef);
                const scheduleData = scheduleSnapshot.data();
                setTitle(scheduleData.title);
                setNotes(scheduleData.notes);
                setStartDate(moment(scheduleData.meeting_start.toDate()).format("YYYY-MM-DDTHH:mm"));
                setEndDate(moment(scheduleData.meeting_end.toDate()).format("YYYY-MM-DDTHH:mm"));
                setComplaintID(scheduleData.complaint_id);
            } catch (error) {
                console.log(error);
                setErrorMsg(error.message);
            }
        };
        if (props.schedule_id) {
            setScheduled(true);
            fetchScheduleDoc();
        }
    }, [props.schedule_id]);

    // Get the current date and time
    const now = moment();

    // Calculate the next day
    const nextDay = now.clone().add(1, 'days');

    // Set the time to 7 AM on the next day
    const localNow = nextDay.set({ hour: 7, minute: 0, second: 0, millisecond: 0 }).format("YYYY-MM-DDTHH:mm");

    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        if (newStartDate > EndDate) {
            setEndDate(newStartDate);
        }
    };

    return (
        <div>
            <div className="input-field">
                <input type="text" placeholder="Hearing Title" required onChange={(e) => setTitle(e.target.value)} value={Title} />
            </div>
            <textarea name="" id="" className="multi-line" placeholder="Notes" rows={5} onChange={(e) => setNotes(e.target.value)} value={Notes}></textarea>
            <div className="input-field">
                <label htmlFor="">Hearing Start Date</label>
                <input type="datetime-local" required onChange={handleStartDateChange} value={StartDate} min={localNow} />
            </div>
            <div className="input-field">
                <label htmlFor="">Hearing End Date</label>
                <input type="datetime-local" required onChange={(e) => setEndDate(e.target.value)} value={EndDate} min={StartDate || localNow} />
            </div>
            <div className="w-100">
                {ComplaintID && <button className="button text" onClick={() => window.location.href = `/complaints/${ComplaintID}`}>Go to complaint</button>}
                {errorMsg && <span className="status error">{errorMsg}</span>}
                {success && <span className="status success">{success}</span>}
            </div>
            <br />
            <button className="button filled" onClick={schedule}>Save</button>
        </div>
    );
};

export default CreateSchedule;
