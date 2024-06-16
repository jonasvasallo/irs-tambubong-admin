import React, {useEffect, useState} from 'react'

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import '../../styles/emergencypage.css';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useModal } from '../../core/ModalContext';
import Modal from '../../components/Modal';
import EmergencyStatus from '../../components/EmergencyStatus';
import EmergencyAssignedPersons from '../../components/EmergencyAssignedPersons';
import AssignedPersonsContainer from '../../components/AssignedPersonsContainer';
import ChatroomContainer from '../../components/ChatroomContainer';
import AddIncident from '../../components/AddIncident';

const EmergencyDetailsPage = () => {
  const navigate = useNavigate();
  const {id} = useParams();
  const emergencyDocRef = doc(firestore, "sos", id);
  const [userDetails, setuserDetails] = useState(null);

  const {openModal} = useModal();


  const [emergencyDetails, setemergencyDetails] = useState();

  useEffect(() => {
    const fetchEmergencyDetails = async () => {
      try{
        const docSnap = await getDoc(emergencyDocRef);
        if(!docSnap.exists()){
          alert("No such document!");
          return;
        }

        setemergencyDetails(docSnap.data());
        await fetchUserDetails(docSnap.data().user_id);
      } catch(error){
        alert("Error fetching document: " + error.message);
        console.log(error);
      }
    }

    const fetchUserDetails = async (id) => {
      try{
        const userDocRef = doc(firestore, "users", id);
        const userDocSnap = await getDoc(userDocRef);

        if(!userDocSnap.exists()){
          alert("No such user!");
          return;
        }
        setuserDetails(userDocSnap.data());
      } catch (err) {
        alert("Error fetching document: " + error.message);
        console.log(error);
      }
    };

    fetchEmergencyDetails();
  }, []);


  return (
    <div className="content">
            <Sidebar />
            <div className="main-content">
                <Header title="Emergency Details"/>
                <div className="content-here">
                    <div className="container w-100 h-100">
                      {emergencyDetails && 
                      <div className="flex gap-32 h-100">
                        <div className="w-100 flex col gap-8">
                          <div id="google-map-container">
                            {emergencyDetails.location.latitude}
                            {emergencyDetails.location.longitude}
                          </div>
                          <div className="flex main-between cross-start">
                            {userDetails && 
                            <div className="flex gap-8 cross-start">
                              <img src={userDetails.profile_path} alt="" width={60} height={60}/>
                              <div className="flex col">
                                <span className='subheading-m'>{`${userDetails.first_name} ${userDetails.last_name}`}</span>
                                <span className="body-m">{userDetails.gender}</span>
                                <span className="body-m color-minor">{userDetails.contact_no}</span>
                                {(userDetails.verified) ? <span className="subheading-m status success">Verified</span> : <span className="status warning textalign-start">This report was made by a user that is still not verified. <Link to={`/users/${emergencyDetails.user_id}`}>Check User</Link></span>}
                              </div>
                            </div>}
                            <div>
                              {!emergencyDetails.incident_id ? <button className="button filled" onClick={() => openModal("Add New Incident", "", <AddIncident id={id} attachment={emergencyDetails.attachment} location={emergencyDetails.location} reported_by={emergencyDetails.user_id}/>, 'info')}>Add as an incident</button> : 
                              <div className='status warning flex gap-8'>
                                <span className="body-m textalign-start">This emergency report is attached to an incident.</span>
                                <button className="button text" onClick={() => navigate(`/reports/${emergencyDetails.incident_id}`)}>Check</button>
                              </div>}
                            </div>
                          </div>
                          <div className="flex gap-8">
                            <span className="status error">{emergencyDetails.status}</span>
                            <button className="button text" onClick={() => openModal("Update Status", "", <EmergencyStatus id={id} />, 'info', <></>)}>Change</button>
                          </div>
                          <AssignedPersonsContainer id={id} emergency={true} />
                        </div>
                        <div className="w-100 h-100 flex col">
                          {emergencyDetails.attachment && <div className="flex-1">
                            <video src={emergencyDetails.attachment} autoPlay controls className='w-100 ' height={250} />
                          </div>}
                          <div id="emergency-chatroom" className='flex-1'>
                            <span className="subheading-m">Emergency Chatroom</span>
                            <ChatroomContainer id={id} emergency={true} />
                          </div>
                        </div>
                      </div>
                      }
                    </div>
                </div>
            </div>
            <Modal />
        </div>
  )
}

export default EmergencyDetailsPage