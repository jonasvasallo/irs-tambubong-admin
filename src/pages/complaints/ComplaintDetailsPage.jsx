import React, {useState, useEffect} from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { firestore } from '../../config/firebase'
import { useModal } from '../../core/ModalContext';
import Modal from '../../components/Modal';
import moment from 'moment'

import '../../styles/complaintpage.css';
import ComplaintStatus from '../../components/ComplaintStatus'
import CreateSchedule from '../../components/CreateSchedule'

import { useAuth } from '../../core/AuthContext'
import EditRespondentDetails from '../../components/EditRespondentDetails'

const ComplaintDetailsPage = () => {

    const { user_type, userPermissions } = useAuth();

    const { openModal } = useModal();
    const {id} = useParams();
    const [ComplaintDetails, setComplaintDetails] = useState();
    const [ScheduleDetails, setScheduleDetails] = useState();
    const [hearingHistory, setHearingHistory] = useState([]);
    const [limit, setLimit] = useState(false);
    useEffect(() => {
        const fetchComplaintDetials = async () => {
            const complaintDocRef = doc(firestore, "complaints", id);
            try{
                const complaintSnap = await getDoc(complaintDocRef);
                const complaintData = complaintSnap.data();

                setComplaintDetails(complaintData);

                // if(complaintData.schedule_id){
                //     const scheduleDocRef = doc(firestore, "schedules", complaintData.schedule_id);
                //     const scheduleSnapshot = await getDoc(scheduleDocRef);

                //     setScheduleDetails(scheduleSnapshot.data());
                // }
                if(complaintData.hearings){
                    if(complaintData.hearings.length < 3){
                    } else{
                        setLimit(true);
                    }
                    const allHearings = complaintData.hearings;
                    const hearingHistoryDetails = [];
                    for(let i =0; i < allHearings.length; i++){
                        const scheduleDocRef = doc(firestore, "schedules", allHearings[i].schedule_id);
                        const scheduleSnapshot = await getDoc(scheduleDocRef);

                        hearingHistoryDetails.push({...scheduleSnapshot.data(), status: allHearings[i].status});
                    }
                    setHearingHistory(hearingHistoryDetails);
                    const latestSchedule = complaintData.hearings[complaintData.hearings.length - 1];
                    const scheduleDocRef = doc(firestore, "schedules", latestSchedule.schedule_id);
                    const scheduleSnapshot = await getDoc(scheduleDocRef);
                    const meeting_end_date = new Date(moment(scheduleSnapshot.data().meeting_end.toDate()).format("YYYY-MM-DDTHH:mm"));
                    const current_date = new Date();
                    if(meeting_end_date < current_date){
                        allHearings[complaintData.hearings.length - 1].status = "Done";
                        await updateDoc(complaintDocRef, {
                        hearings: allHearings,
                        });
                    } else {
                        setScheduleDetails(scheduleSnapshot.data());
                    }
                    
                    
                    
                }
            } catch (error){
                console.log(error);
                alert(error.message);
            }
        }

        fetchComplaintDetials();
    }, []);

    const closeCase = async ()=>{
        const complaintDocRef = doc(firestore, "complaints", id);
        try{
            await updateDoc(complaintDocRef, {
                status: 'Closed',
            })
            window.location.reload();
        } catch(error){
            alert(error.message);
        }
    }

    async function generatePDF(complainantName, respondentName, complaintManner, reliefManner) {
        if (!complainantName || !respondentName || respondentName == "N/A" || !complaintManner) {
            alert('Missing fields. Cannot generate complaint form. Check the respondent name, nature of complaint, or relief manner.');
            return;
        }
    
        const html2pdf = (await import("html2pdf.js")).default;
    
        // Function to format today's date
        function getFormattedDate() {
            const date = new Date();
            const day = date.getDate();
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            
            // Suffix logic for day
            const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
            
            return `${day}${suffix} of ${month}, ${year}`;
        }
    
        const currentDate = getFormattedDate();
    
        // Create a container div that includes the logo, title, report content, and footer
        const container = document.createElement('div');
        
        // HTML structure for the document
        container.innerHTML = `
            <b>KP FORM NO. 7</b>
            <div style="text-align: center; margin: auto; margin-bottom: 40px;">
                <div class="flex col gap-8">
                    <span>Republic of the Philippines</span>
                    <span>Province of Bulacan</span>
                    <span>CITY/MUNICIPALITY OF SAN RAFAEL</span>
                    <span>Barangay Tambubong</span>
                    <br>
                    <b>OFFICE OF THE LUPON TAGAPAMAYAPA</b>
                </div>
            </div>
    
            <div>
                <span>Barangay Case No.: <span style="padding-bottom: 3px; border-bottom-style: solid; border-bottom-width: 1px; width: fit-content;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span>
                <span>For: <span style="padding-bottom: 3px; border-bottom-style: solid; border-bottom-width: 1px; width: fit-content;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span>
                <br><br>
                <span>Complainant: <span style="padding-bottom: 3px; border-bottom-style: solid; border-bottom-width: 1px; width: fit-content;">&nbsp;&nbsp;&nbsp;&nbsp;${complainantName}&nbsp;&nbsp;&nbsp;&nbsp;</span></span>
                <br>
                <span>- Against - </span>
                <br>
                <span>Respondent: <span style="padding-bottom: 3px; border-bottom-style: solid; border-bottom-width: 1px; width: fit-content;">&nbsp;&nbsp;&nbsp;&nbsp;${respondentName}&nbsp;&nbsp;&nbsp;&nbsp;</span></span>
            </div>
    
            <br>
    
            <div class="flex col gap-8" style="text-align: center; margin: auto; margin-bottom: 40px;">
                <b>C O M P L A I N T</b>
                <span>I hereby complain against above named respondent for violating my rights and interest in the following manner:</span>
                <div style="
                    width: 100%;
                    background-image: linear-gradient(black 1px, transparent 1px);
                    background-size: 100% 1.5em;
                    line-height: 1.5em;
                    padding-bottom: 0.5em;
                    text-align: left;
                ">
                    ${complaintManner}
                </div>
                <span>THEREFORE, I pray that the following relief/s be granted to me in accordance with law and equity:</span>
                <div style="
                    width: 100%;
                    background-image: linear-gradient(black 1px, transparent 1px);
                    background-size: 100% 1.5em;
                    line-height: 1.5em;
                    padding-bottom: 0.5em;
                    text-align: left;
                ">
                    ${(reliefManner == "" || !reliefManner) ? "" : `${reliefManner}`}
                </div>
            </div>
    
            <span>Made this <span style="padding-bottom: 3px; border-bottom-style: solid; border-bottom-width: 1px; width: fit-content;">&nbsp;&nbsp; ${currentDate} &nbsp;&nbsp;</span></span>
    
            <div style="margin-top: 40px; margin-bottom: 40px; text-align: right;">
                <span style="padding-bottom: 3px; border-top-style: solid; border-top-width: 1px; width: fit-content;">&nbsp;&nbsp;&nbsp;&nbsp; Complainant &nbsp;&nbsp;&nbsp;&nbsp;</span>
            </div>
    
            <span>Received and filed this <span style="padding-bottom: 3px; border-bottom-style: solid; border-bottom-width: 1px; width: fit-content;">&nbsp;&nbsp; ${currentDate} &nbsp;&nbsp;</span></span>
    
            <div style="margin-top: 40px; margin-bottom: 40px; text-align: right;">
                <span style="padding-bottom: 3px; border-top-style: solid; border-top-width: 1px; width: fit-content;">&nbsp;&nbsp;&nbsp;&nbsp; Punong Barangay/Lupon Chairperson &nbsp;&nbsp;&nbsp;&nbsp;</span>
            </div>
        `;
    
        // Pass the container to html2pdf
        html2pdf(container, {
            margin: 20,
            filename: 'complaint_form.pdf',
            html2canvas: { scale: 2, useCORS: true },
        });
    }
    

  return (
    <div className="content">
        <Sidebar />
        <div className="main-content">
            <Header title="Complaint Details"/>
            <div className="content-here">
                <div className="container w-100 h-100 overflow-scroll">
                    {ComplaintDetails ?  
                    <div className="flex col">
                        <span className="body-s color-minor">{id}</span>
                        <div className="flex main-between gap-32">
                            <div id="complainant" className='flex col gap-8 flex-1'>
                                
                                <div className="flex main-between">
                                    <div className='flex col gap-8'>
                                        <span className="subheading-l">Complainant</span>
                                        <span className="body-m">{ComplaintDetails.full_name}</span>
                                        <span className="body-m">{ComplaintDetails.contact_no}</span>
                                        <span className="body-m">{ComplaintDetails.email}</span>
                                    </div>
                                    <div>
                                        <button className="button outlined" onClick={() => generatePDF(`${ComplaintDetails.full_name}`, `${ComplaintDetails.respondent_info[0]}`, `${ComplaintDetails.description}`, `${(ComplaintDetails.relief_manner != null) ? ComplaintDetails.relief_manner : ""}`)}>Download Complaint Form</button>
                                    </div>
                                </div>
                                <span className="body-m">{ComplaintDetails.address}</span>
                                <br />
                                <div className="flex main-between gap-16">
                                    <div className='flex-1'>
                                        <span><span className="subheading-m">Issued at: <span className="body-m">{new Date(ComplaintDetails.issued_at.seconds * 1000).toLocaleString()}</span></span></span>
                                        <div className="flex gap-8">
                                            <span className="status error">{ComplaintDetails.status}</span>
                                            {(user_type == 'admin' || userPermissions['manage_complaints']) ? <button className="button text" onClick={() => openModal("Update Status", "", <ComplaintStatus id={id} complainant={ComplaintDetails.issued_by} respondent={ComplaintDetails.respondent_id}/>, 'info', <></>)}>Change</button> : <></>}
                                        </div>
                                    </div>
                                    {(user_type == 'admin' || userPermissions['manage_complaints']) ? 
                                    <div className='flex-1'>
                                    {limit && !ScheduleDetails && ComplaintDetails.status != "Closed" && <button className='button filled' onClick={()=>closeCase()}>Close</button>}
                                    {((ComplaintDetails.status != "Dismissed" && ComplaintDetails.status != "Closed" && ComplaintDetails.status != "Dismissed") && (!ScheduleDetails && !limit)) ? 
                                    <button className="button filled" onClick={() => openModal("Schedule Hearing", "", <CreateSchedule id={id} complainant={ComplaintDetails.issued_by} respondent={ComplaintDetails.respondent_id}/>, 'info', <></>)}>Schedule</button> 
                                    : 
                                    ScheduleDetails && <div className='status success textalign-start flex main-between gap-16'>
                                    This complaint has been scheduled for a hearing on {new Date(ScheduleDetails.meeting_start.seconds * 1000).toLocaleString()}. 
                                    <button className='button text' onClick={() => window.location.href = "/schedules"}>Update</button>
                                    </div>
                                    }
                                    </div>
                                    :
                                    <></>
                                    }
                                </div>
                                
                                <br />
                                <span><span className="subheading-m">Nature of Compaint: <span className="body-m">{ComplaintDetails.description}</span></span></span>
                                <br />
                                <span className="subheading-m">Supporting Documents</span>
                                <div id="supporting-documents-links" className='flex gap-8'>
                                    {ComplaintDetails.supporting_docs.map((image, index) => (
                                        <a href={image} target="_blank">Document {index + 1}</a>
                                    ))}
                                </div>
                                <div id="supporting-documents" className='flex gap-8 wrap'>
                                    {ComplaintDetails.supporting_docs.map((image, index) => (
                                        <img src={image} width={200} height={100} style={{objectFit: 'cover'}}></img>
                                    ))}
                                </div>
                            </div>
                            <div id="respondent" className='flex col gap-8 flex-1'>
                                <div className="flex gap-8">
                                    <span className="subheading-l">Respondent</span>
                                    <button className="button text" onClick={() => openModal("Edit Respondent Details", "", <EditRespondentDetails id={id} name={`${ComplaintDetails.respondent_info[0]}`} phone={`${ComplaintDetails.respondent_info[1]}`} address={`${ComplaintDetails.respondent_info[2]}`}/>, 'info', <></>)}>Edit</button>
                                </div>
                                <span><span className="subheading-m">Full Name: <span className="body-m">{ComplaintDetails.respondent_info[0]}</span></span></span>
                                <span><span className="subheading-m">Contact Number: <span className="body-m">{ComplaintDetails.respondent_info[1]}</span></span></span>
                                <span><span className="subheading-m">Address: <span className="body-m">{ComplaintDetails.respondent_info[2]}</span></span></span>
                                <span><span className="subheading-m">Description: <span className="body-m">{ComplaintDetails.respondent_description}</span></span></span>
                                <br />
                                <div>
                                    <span className="subheading-m">Hearing History:</span>
                                    <div className="flex col gap-8">
                                    {hearingHistory.map((history) => (
                                        <div className='flex gap-16'>
                                            <span>{history.title}</span>
                                            <span>-</span>
                                            <span>{moment.unix(history.meeting_start.seconds).format('ddd, MMMM D, YYYY [at] h:mm A')}</span>
                                            <span>{history.status}</span>
                                        </div>
                                    ))}
                                    </div>
                                </div>
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