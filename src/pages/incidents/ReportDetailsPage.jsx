import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import '../../styles/incidentpage.css';
import { useParams } from "react-router-dom";

import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../config/firebase";
import LiveStatusContainer from "../../components/LiveStatusContainer";
import ChatroomContainer from "../../components/ChatroomContainer";

const ReportDetailsPage = () => {
  const { id } = useParams();
  const [incidentDetails, setIncidentDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [incidentTag, setIncidentTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // console.log(id);
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

    // fetchIncidentDetails();
  }, [id]);


  
  return (
    <div className="content">
      <Sidebar />
      <div className="main-content">
        <Header title="Incident Details" />
        <div className="content-here">
          <div className="container w-100">
          {incidentDetails ? (
            <div className="flex col">
              <div className="flex">
                <div id="incident_details" className="flex col gap-8">
                  
                      <>
                        <span className="subheading-l color-major">{incidentDetails.title}</span>
                        <span className="body-l color-minor">{new Date(incidentDetails.timestamp.seconds * 1000).toLocaleString()}</span>
                        <span>{incidentDetails.location_address}</span>
                        <span>{incidentTag ? `${incidentTag.tag_name}` : "Loading..."}</span>
                        <span>{incidentDetails.status}</span>
                        {userDetails ? (
                        <div id="user_info" className="flex gap-8">
                          <img src={userDetails.profile_path} alt="" width={60} height={60}/>
                          <div className="flex col">
                              <span>{`${userDetails.first_name} ${userDetails.last_name}`}</span>
                              <span>{`${userDetails.user_type.toString().toUpperCase()}`}</span>
                              <span>{(userDetails.verified) ? 'Verified' : 'Not Verified'}</span>
                          </div>
                        </div>
                        ) : (<p>Loading...</p>)}
                      </>
                    

                </div>
                <div id="maps_container">
                </div>
              </div>
              <div className="flex"></div>
            </div>
            ) : (
              <div className="flex main-between gap-32 h-100">
                <div className="flex col w-100 flex-2 gap-16">
                  <div className="flex gap-32 main-between ">
                    <div id="incident-details" className="flex col gap-8">
                      <span className="subheading-l color-major">Incident Title Here</span>
                      <span className="body-l color-minor">August 9, 2023</span>
                      <span className="body-m color-major">1084 Kalsadang Bago, Caingin, San Rafael, Bulacan</span>
                      <span className="status">Status: Handling</span>
                      <span className="tag">Robbery</span>
                      <div id="user_info" className="flex gap-8">
                        <img src="" alt="" width={60} height={60}/>
                        <div className="flex col">
                          <span className="body-m color-major">Full Name</span>
                          <span className="body-s color-primary">RESIDENT</span>
                          <span className="body-s color-minor">Verified</span>
                        </div>
                      </div>
                    </div>
                    <div className="maps">
                      awdawd
                    </div>
                  </div>
                  <span className="body-m color-major">Lorem ipsum dolor sit amet consectetur adipisicing elit. Et animi magni nobis reiciendis dignissimos doloribus, deserunt praesentium ratione delectus aperiam, ab quos incidunt maxime esse harum totam eos sed quidem!</span>
                  <div className="flex main-between gap-32">
                    <div id="witnesses" className="w-100 flex col gap-8">
                      <span className="subheading-m color-major">Witnesses</span>
                      <div className="witness-row flex gap-8 cross-center main-between">
                        <div className="flex gap-8 cross-center">
                          <img src="" alt="" width={40} height={40}/>
                          <div className="flex col">
                            <span className="subheading-m color-major">Glenn Mark Cruz</span>
                            <span className="body-m color-minor">09184639221</span>
                            <span className="body-m color-major">Details here</span>
                          </div>
                        </div>
                        <button>View</button>
                      </div>
                    </div>
                    <div id="responders" className="w-100 flex col gap-8">
                      <div className="flex main-between">
                        <span className="subheading-m color-major">Assigned Persons</span>
                        <button>Add</button>
                      </div>
                      <div className="responder-row flex gap-8 cross-center main-between">
                        <div className="flex gap-8 cross-center">
                          <img src="" alt="" width={40} height={40}/>
                          <div className="flex col main-center">
                            <span className="subheading-m color-major">Glenn Mark Cruz</span>
                            <span className="body-m color-minor">09184639221</span>
                          </div>
                        </div>
                        <button>Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex col main-between w-100 flex-1 gap-32">
                  <LiveStatusContainer id={id}/>
                  <ChatroomContainer id={id}/>
                </div>
              </div>
              
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsPage;
