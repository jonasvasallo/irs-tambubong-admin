import React, {useEffect, useState} from 'react'

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import '../../styles/emergencypage.css';
import { collection, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import { firestore } from '../../config/firebase';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useModal } from '../../core/ModalContext';
import Modal from '../../components/Modal';
import EmergencyStatus from '../../components/EmergencyStatus';
import EmergencyAssignedPersons from '../../components/EmergencyAssignedPersons';
import AssignedPersonsContainer from '../../components/AssignedPersonsContainer';
import ChatroomContainer from '../../components/ChatroomContainer';
import AddIncident from '../../components/AddIncident';
import ReactMap from "../../components/maps/ReactMap";
import RespondersSection from '../incidents/RespondersSection';

import { useAuth } from '../../core/AuthContext';
import { getDistance } from "geolib";

const EmergencyDetailsPage = () => {

  const { user_type, userPermissions } = useAuth();

  const navigate = useNavigate();
  const {id} = useParams();
  const emergencyDocRef = doc(firestore, "sos", id);
  const [userDetails, setuserDetails] = useState(null);

  const {openModal} = useModal();


  const [emergencyDetails, setemergencyDetails] = useState();

  const [flaggedEmergencies, setFlaggedEmergencies] = useState([]);

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
        await flagRelatedCalls(docSnap.data());
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

    const flagRelatedCalls = async (sos) => {
      console.log("Checking sos fired");
      const {location, timestamp} = sos;
      const RADIUS = 500; //in meters
      const TIME_FRAME = 900000; //in milliseconds (15 minutes)

      const sosRef = collection(firestore, 'sos');
      const sosTimestamp = timestamp.seconds * 1000;
      const lowerTimeThreshold = new Date(sosTimestamp - TIME_FRAME);
      const upperTimeThreshold = new Date(sosTimestamp + TIME_FRAME);
      console.log("Timestamp:", new Date(sosTimestamp));
      console.log('Time Thresholds:', lowerTimeThreshold, upperTimeThreshold);

      try {
        const q = query(sosRef,
          where('timestamp', '>=', lowerTimeThreshold),
          where('timestamp', '<=', upperTimeThreshold),
          where('status', 'not-in', ['Resolved', 'Closed', 'Dismissed', 'Cancelled'])
        );

        const snapshot = await getDocs(q);
        console.log('Number of documents found:', snapshot.size);

        const relatedCallsList = [];
        snapshot.forEach(doc => {
          if(doc.id != id){
            const sos = doc.data();
            const sosLocation = sos.location;

            const distance = getDistance(
              { latitude: location.latitude, longitude: location.longitude },
              { latitude: sosLocation.latitude, longitude: sosLocation.longitude }
            );

            if (distance <= RADIUS) {
              relatedCallsList.push({ id: doc.id, ...sos, distanceDiff: distance, });
            }
          }
        });

        setFlaggedEmergencies(relatedCallsList);
        console.log("Related Calls:", relatedCallsList);
      } catch (err) {
        console.error("Error fetching related calls:", err);
      }
    }

    fetchEmergencyDetails();
  }, [id]);


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
                        <span className="body-s color-minor">{id}</span>
                          <div style={{'width' : '100%', 'height' : '250px'}}>
                            {/* <ReactMap positions={[{lat: emergencyDetails.location.latitude, lng: emergencyDetails.location.longitude}]}/> */}
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
                              {
                              (user_type == 'admin' || userPermissions['manage_emergencies']) ?
                              (!emergencyDetails.incident_id ? 
                                (emergencyDetails.status == "Resolved" || emergencyDetails.status == "Closed") ? <button className="button filled" onClick={() => openModal("Add New Incident", "", <AddIncident id={id} responders={emergencyDetails.responders} status={emergencyDetails.status} attachment={emergencyDetails.attachment} location={emergencyDetails.location} reported_by={emergencyDetails.user_id}/>, 'info')}>Add as an incident</button> : <button disabled className="button filled" onClick={() => openModal("Add New Incident", "", <AddIncident id={id} responders={emergencyDetails.responders} attachment={emergencyDetails.attachment} location={emergencyDetails.location} reported_by={emergencyDetails.user_id}/>, 'info')}>Add as an incident</button>
                                : 
                                <div className='status warning flex gap-8'>
                                  <span className="body-m textalign-start">This emergency report is attached to an incident.</span>
                                  <button className="button text" onClick={() => navigate(`/reports/${emergencyDetails.incident_id}`)}>Check</button>
                                </div>
                              ) :
                                <></>
                              }
                            </div>
                          </div>
                          {(flaggedEmergencies && flaggedEmergencies.length >= 1) ? 
                                <div className='status danger flex col cross-start'>
                                  <div>This request is flagged as potentially related to another request. </div>
                                  <br />
                                  {flaggedEmergencies.map((emergency) => (
                                    <div id={emergency.id} className='flex main-between gap-32'>
                                    <div><b>Request #{emergency.id}</b></div>
                                    <div>{emergency.distanceDiff}m away</div>
                                    <div><Link to={`/emergencies/${emergency.id}`}>View</Link></div>
                                    </div>
                                  ))}
                                </div> : 
                                <></>}
                          <div>
                            <span className="body-l color-minor">{new Date(emergencyDetails.timestamp.seconds * 1000).toLocaleString()}</span>
                          </div>
                          <div className="flex gap-8">
                            <span className="status error">{emergencyDetails.status}</span>
                            {(user_type == 'admin' || userPermissions['manage_emergencies']) ? <button className="button text" onClick={() => openModal("Update Status", "", <EmergencyStatus id={id} />, 'info', <></>)}>Change</button> : <></>}
                          </div>
                          {emergencyDetails.status == "Resolved" || emergencyDetails.status == "Closed" ? <RespondersSection id={id} responders={emergencyDetails.responders} emergency={true}/> : <AssignedPersonsContainer id={id} emergency={true} latitude={emergencyDetails.location.latitude} longitude={emergencyDetails.location.longitude}/>}
                          
                        </div>
                        <div className="w-100 h-100 flex col">
                        {emergencyDetails.attachment && (
                          <div className="flex-1">
                            {emergencyDetails.attachmentType === "image" ? (
                              <img src={emergencyDetails.attachment} alt="attachment" className="w-100" height={250} />
                            ) : (
                              <video src={emergencyDetails.attachment} autoPlay controls className="w-100" height={250} />
                            )}
                          </div>
                        )}
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