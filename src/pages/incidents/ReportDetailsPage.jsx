import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import '../../styles/incidentpage.css';
import { useParams } from "react-router-dom";

import { collection, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../../config/firebase";
import LiveStatusContainer from "../../components/LiveStatusContainer";
import ChatroomContainer from "../../components/ChatroomContainer";
import WitnessContainer from "../../components/WitnessContainer";
import AssignedPersonsContainer from "../../components/AssignedPersonsContainer";
import Modal from "../../components/Modal";
import { useModal } from '../../core/ModalContext';
import IncidentTags from "../../components/IncidentTags";
import IncidentStatus from "../../components/IncidentStatus";

import { getDistance } from "geolib";
import MergeIncidents from "../../components/MergeIncidents";

const ReportDetailsPage = () => {
  const { id } = useParams();
  const [incidentDetails, setIncidentDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [incidentTag, setIncidentTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { openModal } = useModal();

  const [nearbyIncidents, setNearbyIncidents] = useState([]);

  useEffect(() => {
    const fetchIncidentDetails = async () => {
      try {
        const docRef = doc(firestore, "incidents", id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          setError("No such document!");
          return;
        }
        setIncidentDetails(docSnap.data());
        await fetchUserDetails(docSnap.data().reported_by);
        await fetchIncidentTag(docSnap.data().incident_tag);
        if(!docSnap.data().incident_group){
          await checkIncidents(docSnap.data());
        }
      } catch (err) {
        setError("Error fetching document: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserDetails = async (id) => {
      try{
        const userDocRef = doc(firestore, "users", id);
        const userDocSnap = await getDoc(userDocRef);

        if(!userDocSnap.exists()){
          setError("No such user!");
          return;
        }
        setUserDetails(userDocSnap.data());
      } catch (err) {
        setError("Error fetching document: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchIncidentTag = async (id) => {
      try {
        const tagDocRef = doc(firestore, "incident_tags", id);
        const tagDocSnap = await getDoc(tagDocRef);

        if(!tagDocSnap.exists()){
          setError("No such tag!");
          return;
        }

        setIncidentTag(tagDocSnap.data());
      } catch (err) {
        setError("Error fetching document: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    const checkIncidents = async (incident) => {
      console.log("Checking incidents fired");
      const {coordinates, timestamp} = incident;
      const RADIUS = 500;
      const TIME_FRAME = 3600000;

      const incidentsRef = collection(firestore, 'incidents');
      const incidentTimestamp = timestamp.seconds * 1000;
      const lowerTimeThreshold = new Date(incidentTimestamp - TIME_FRAME);
      const upperTimeThreshold = new Date(incidentTimestamp + TIME_FRAME);
      console.log("Timestamp:", new Date(incidentTimestamp));
      console.log('Time Thresholds:', lowerTimeThreshold, upperTimeThreshold);

      try {
        const q = query(incidentsRef,
          where('timestamp', '>=', lowerTimeThreshold),
          where('timestamp', '<=', upperTimeThreshold),
          where('status', 'not-in', ['Resolved', 'Closed'])
        );

        const snapshot = await getDocs(q);
        console.log('Number of documents found:', snapshot.size);

        const nearbyIncidentsList = [];
        snapshot.forEach(doc => {
          if(doc.id != id){
            const incident = doc.data();
            const incidentLocation = incident.coordinates;

            const distance = getDistance(
              { latitude: coordinates.latitude, longitude: coordinates.longitude },
              { latitude: incidentLocation.latitude, longitude: incidentLocation.longitude }
            );

            if (distance <= RADIUS) {
              nearbyIncidentsList.push({ id: doc.id, ...incident, distanceDiff: distance, });
            }
          }
        });

        setNearbyIncidents(nearbyIncidentsList);
        console.log("Nearby incidents:", nearbyIncidentsList);
      } catch (err) {
        console.error("Error fetching nearby incidents:", err);
      }
    }

    fetchIncidentDetails();
  }, []);

  const modalToggle = () => {

    const bodyClassList = document.body.classList;
    if(bodyClassList.contains("open")){
        bodyClassList.remove("open");
        bodyClassList.add("closed");
    } else{
        bodyClassList.remove("closed");
        bodyClassList.add("open");
    }
}
    
  return (
    <div className="content">
      <Sidebar />
      <div className="main-content">
        <Header title="Incident Details" />
        <div className="content-here">
          <div className="container w-100">
          {incidentDetails ? (
            <div className="flex main-between gap-32 h-100">
            <div className="flex col w-100 flex-2 gap-16 h-100">
              <div className="flex gap-32 main-between flex-1">
                <div id="incident-details" className="flex col gap-8 flex-2">
                  <span className="subheading-l color-major">{incidentDetails.title}</span>
                  <span className="body-l color-minor">{new Date(incidentDetails.timestamp.seconds * 1000).toLocaleString()}</span>
                  <span className="body-m color-major">{incidentDetails.location_address}</span>
                  <div className="flex gap-8">
                    <span className="status error">Status: {incidentDetails.status}</span>
                    <button className="button text" onClick={() => openModal("Update Status", "", <IncidentStatus id={id}/>, 'info', <></>)}>Update</button>
                  </div>
                  <div className="flex gap-8">
                    <span className="tag">{incidentTag ? `${incidentTag.tag_name}` : "Loading..."}</span>
                    <button className="button text" onClick={() => openModal("Update Tag", "Group incidents by attaching tags", <IncidentTags id={id}/>, 'info', <></>)}>Update</button>
                  </div>
                  {userDetails ? (
                    <div id="user_info" className="flex gap-8">
                      <img src={userDetails.profile_path} alt="" width={60} height={60}/>
                      <div className="flex col">
                          <span className="subheading-s">{`${userDetails.first_name} ${userDetails.last_name}`}</span>
                          <span className="color-minor">{`${userDetails.user_type.toString().toUpperCase()}`}</span>
                          <span className="color-primary">{(userDetails.verified) ? 'Verified' : 'Not Verified'}</span>
                      </div>
                    </div>
                    ) : (<p>Loading...</p>)}
                </div>
                <div className="flex col flex-1 gap-16">
                  <div className="maps"></div>
                  {incidentDetails.incident_group && <div className="status warning flex main-start cross-center">
                    <span className="textalign-start">
                      This incident is a part of an incident group. All actions are synced with all the incidents included in the incident group.
                    </span>
                    <button className="button text">Check</button>
                  </div>}
                  {(nearbyIncidents && !incidentDetails.incident_group) ? <div className="status warning flex main-start cross-center">
                    <span className="textalign-start">
                      The system has identified that this report was submitted in close proximity and within a short time frame to another similar report. Would you like to merge these incidents?
                    </span>
                    <button className="button text" onClick={() => openModal("Merge incidents", "", <MergeIncidents incidents={nearbyIncidents} title={incidentDetails.title} description={incidentDetails.details} status={incidentDetails.status} id={id} />, 'info', <></>)}>Check</button>
                  </div> : <></>}
                </div>
              </div>
              <span className="body-m color-major">{incidentDetails.details}</span>
              <div className="flex main-between gap-32 flex-1">
                <WitnessContainer id={id}/>
                <AssignedPersonsContainer id={id}/>
              </div>
            </div>
            <div className="flex col main-between w-100 flex-1 gap-16">
              <LiveStatusContainer id={id}/>
              <ChatroomContainer id={id}/>
            </div>
          </div>
            ) : (
              <span>Loading...</span>
            )}
          </div>
        </div>
      </div>
      <Modal />
    </div>
  );
};

export default ReportDetailsPage;
