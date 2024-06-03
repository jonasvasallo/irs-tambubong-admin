import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import '../../styles/incidentpage.css';
import { useParams } from "react-router-dom";

import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../config/firebase";
import LiveStatusContainer from "../../components/LiveStatusContainer";
import ChatroomContainer from "../../components/ChatroomContainer";
import WitnessContainer from "../../components/WitnessContainer";
import AssignedPersonsContainer from "../../components/AssignedPersonsContainer";
import Modal from "../../components/Modal";
import { useModal } from '../../core/ModalContext';
import IncidentTags from "../../components/IncidentTags";
import IncidentStatus from "../../components/IncidentStatus";

const ReportDetailsPage = () => {
  const { id } = useParams();
  const [incidentDetails, setIncidentDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [incidentTag, setIncidentTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { openModal } = useModal();

  useEffect(() => {
    console.log("fetched incident details");
    const fetchIncidentDetails = async () => {
      try {
        const docRef = doc(firestore, "incidents", id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          setError("No such document!");
          return;
        }
        // console.log(docSnap.data());
        setIncidentDetails(docSnap.data());

        console.log(docSnap.data().reported_by);
        await fetchUserDetails(docSnap.data().reported_by);
        await fetchIncidentTag(docSnap.data().incident_tag);
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
        console.log(userDocSnap.data());
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

        console.log(tagDocSnap.data());
        setIncidentTag(tagDocSnap.data());
      } catch (err) {
        setError("Error fetching document: " + err.message);
      } finally {
        setLoading(false);
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
            <div className="flex col w-100 flex-2 gap-16">
              <div className="flex gap-32 main-between ">
                <div id="incident-details" className="flex col gap-8">
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
                <div className="maps">
                </div>
              </div>
              <span className="body-m color-major">{incidentDetails.details}</span>
              <div className="flex main-between gap-32">
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
