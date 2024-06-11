import React, {useState, useEffect} from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '../../config/firebase'
import { useModal } from '../../core/ModalContext';
import Modal from '../../components/Modal';

import '../../styles/complaintpage.css';
import ComplaintStatus from '../../components/ComplaintStatus'
import CreateSchedule from '../../components/CreateSchedule'

const ComplaintDetailsPage = () => {
    const { openModal } = useModal();
    const {id} = useParams();
    const [ComplaintDetails, setComplaintDetails] = useState();
    const [ScheduleDetails, setScheduleDetails] = useState();
    useEffect(() => {
        const fetchComplaintDetials = async () => {
            const complaintDocRef = doc(firestore, "complaints", id);
            try{
                const complaintSnap = await getDoc(complaintDocRef);
                const complaintData = complaintSnap.data();

                setComplaintDetails(complaintData);

                if(complaintData.schedule_id){
                    const scheduleDocRef = doc(firestore, "schedules", complaintData.schedule_id);
                    const scheduleSnapshot = await getDoc(scheduleDocRef);

                    setScheduleDetails(scheduleSnapshot.data());
                }
            } catch (error){
                console.log(error);
                alert(error.message);
            }
        }

        fetchComplaintDetials();
    }, []);
  return (
    <div className="content">
        <Sidebar />
        <div className="main-content">
            <Header title="Complaint Details"/>
            <div className="content-here">
                <div className="container w-100 h-100">
                    {ComplaintDetails ?  
                    <div className="flex col">
                        <div className="flex main-between gap-32">
                            <div id="complainant" className='flex col gap-8 flex-1'>
                                <span className="subheading-l">Complainant</span>
                                <span className="body-m">{ComplaintDetails.full_name}</span>
                                <span className="body-m">{ComplaintDetails.contact_no}</span>
                                <span className="body-m">{ComplaintDetails.email}</span>
                                <span className="body-m">{ComplaintDetails.address}</span>
                                <br />
                                <div className="flex main-between gap-16">
                                    <div className='flex-1'>
                                        <span><span className="subheading-m">Issued at: <span className="body-m">{new Date(ComplaintDetails.issued_at.seconds * 1000).toLocaleString()}</span></span></span>
                                        <div className="flex gap-8">
                                            <span className="status error">{ComplaintDetails.status}</span>
                                            <button className="button text" onClick={() => openModal("Update Status", "", <ComplaintStatus id={id}/>, 'info', <></>)}>Change</button>
                                        </div>
                                    </div>
                                    <div className='flex-1'>
                                        {(!ComplaintDetails.schedule_id) ? 
                                        <button className="button filled" onClick={() => openModal("Schedule a meeting", "", <CreateSchedule id={id}/>, 'info', <></>)}>Schedule</button> 
                                        : 
                                        ScheduleDetails && <div className='status success textalign-start flex main-between gap-16'>
                                        This complaint has been scheduled for a meeting on {new Date(ScheduleDetails.meeting_start.seconds * 1000).toLocaleString()}. 
                                        <button className='button text' onClick={() => window.location.href = "/schedules"}>Update</button>
                                        </div>
                                        }
                                    </div>
                                </div>
                                <br />
                                <span><span className="subheading-m">Nature of Compaint: <span className="body-m">{ComplaintDetails.description}</span></span></span>
                                <br />
                                <span className="subheading-m">Supporting Documents</span>
                                <div id="supporting-documents" className='flex gap-8'>
                                    {ComplaintDetails.supporting_docs.map((image, index) => (
                                        <a href={image} target="_blank">Document 1</a>
                                    ))}
                                </div>
                            </div>
                            <div id="respondent" className='flex col gap-8 flex-1'>
                                <span className="subheading-l">Respondent</span>
                                <span><span className="subheading-m">Full Name: <span className="body-m">{ComplaintDetails.respondent_info[0]}</span></span></span>
                                <span><span className="subheading-m">Contact Number: <span className="body-m">{ComplaintDetails.respondent_info[1]}</span></span></span>
                                <span><span className="subheading-m">Address: <span className="body-m">{ComplaintDetails.respondent_info[2]}</span></span></span>
                                <span><span className="subheading-m">Description: <span className="body-m">{ComplaintDetails.respondent_description}</span></span></span>
                            </div>
                        </div>
                    </div>
                     : <span>Loading...</span>}
                </div>
            </div>
        </div>
        <Modal />
    </div>
  )
}

export default ComplaintDetailsPage