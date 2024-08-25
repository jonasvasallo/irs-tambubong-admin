import React, {useEffect, useState} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { doc, onSnapshot, getDoc, updateDoc, arrayRemove, deleteField, increment, deleteDoc } from 'firebase/firestore'
import { firestore } from '../../config/firebase'
import { useModal } from '../../core/ModalContext';
import Modal from '../../components/Modal';
import IncidentGroupStatus from '../../components/IncidentGroupStatus'
import LiveStatusContainer from '../../components/LiveStatusContainer'
import RemoveIncidentHead from '../../components/RemoveIncidentHead'
import IncidentGroupAssignPerson from '../../components/IncidentGroupAssignPerson'

import { useAuth } from '../../core/AuthContext'

const IncidentGroupPage = () => {
  
  const { user_type, userPermissions } = useAuth();

  const { openModal } = useModal();
  const navigate = useNavigate();
  const { id } = useParams();
  const incidentGroupDocRef = doc(firestore, "incident_groups", id);
  const [incidentGroupDetails, setIncidentGroupDetails] = useState(null);
  const [includedIncidents, setIncludedIncidents] = useState([]);

  const removeIncidentGroup = async () => {
    try{
      includedIncidents.map(async (incident)=> {
        const incidentDocRef = doc(firestore, "incidents", incident.id);
        await updateDoc(incidentDocRef, {
          incident_group: deleteField(),
        });
      });

      deleteDoc(incidentGroupDocRef);
      navigate("/reports");
    } catch(error){
      console.log(error);
    }
  }

  const validateIncidentGroup = async () => {
    if(incidentGroupDetails.status != "Verifying" && incidentGroupDetails.status != "Verified"){
      alert("You cannot remove a member of an incident group once it is being handled / resolved!");
      return;
    }
    if(incidentGroupDetails.incidents <= 2){
      openModal("Remove Incident Head", "", <>A group needs to have atleast 2 incidents in it. This will remove the incident group altogether. Do you want to proceed? <div><button className='button filled' onClick={() => removeIncidentGroup()}>Proceed</button></div></>, 'info', <></>)
      return;
    }

    openModal("Remove Incident Head", "Please select another incident to replace this current incident.", <RemoveIncidentHead incidents={includedIncidents} incident_head={incidentGroupDetails.head} incident_group={id}/>, 'info', <></>)
  }

  const removeIncident = async (incident_id) => {
    if(incidentGroupDetails.status != "Verifying" && incidentGroupDetails.status != "Verified"){
      alert("You cannot remove a member of an incident group once it is being handled / resolved!");
      return;
    }
    if(incidentGroupDetails.incidents <= 2){
      openModal("Remove Incident Head", "", <>A group needs to have atleast 2 incidents in it. This will remove the incident group altogether. Do you want to proceed? <div><button className='button filled' onClick={() => removeIncidentGroup()}>Proceed</button></div></>, 'info', <></>)
      return;
    }
    const incidentDocRef = doc(firestore, "incidents", incident_id);
    try{
      await updateDoc(incidentGroupDocRef, {
        incidents: increment(-1),
        in_group: arrayRemove(incident_id),
      });
      await updateDoc(incidentDocRef, {
        incident_group: deleteField(),
      });
    } catch(error){
      alert(error);
      console.log(error);
    }
  }


  useEffect(() => {
    const unsubscribe = onSnapshot(incidentGroupDocRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setIncidentGroupDetails(data);
        if (data.in_group && data.in_group.length > 0) {
          const incidentPromises = data.in_group.map(async (incidentId) => {
            const incidentDocRef = doc(firestore, 'incidents', incidentId);
            const incidentDoc = await getDoc(incidentDocRef);
            if (incidentDoc.exists()) {
              return { id: incidentDoc.id, ...incidentDoc.data() };
            } else {
              return null;
            }
          });
          const incidentDetails = await Promise.all(incidentPromises);
          setIncludedIncidents(incidentDetails.filter(incident => incident !== null));
        }
      } else {
        alert('Document does not exist');
      }
    }, (error) => {
      window.alert(error);
    });

    return () => unsubscribe();


  }, []);

  return (
    <div className="content">
        <Sidebar />
        <div className="main-content">
            <Header title="Incident Group"/>
            <div className="content-here">
                <div className="h-100 w-100">
                    {incidentGroupDetails ?  
                    <div className="flex gap-16 h-100">
                      <div className="container flex col main-between gap-16 flex-3">
                        <div className="flex main-between gap-16 flex-1">
                          <div className='flex col gap-8 flex-1'>
                            <span className="subheading-l">{incidentGroupDetails.title}</span>
                            <span className="body-m">{incidentGroupDetails.description}</span>
                            <span className='subheading-m'>Created at <span className='body-m'>05/14/2024 11:29 AM</span></span>
                            <div className="flex gap-8">
                              <span className='status error'>{incidentGroupDetails.status}</span>
                              {(user_type == 'admin' || userPermissions['manage_incidents']) ? <button className="button text" onClick={() => openModal("Update Status", "", <IncidentGroupStatus id={id}/>, 'info', <></>)}>Change</button> : <></>}
                            </div>
                            <span className='subheading-m'>Incidents: <span className='body-m'>{incidentGroupDetails.incidents}</span></span>
                          </div>
                          <div className="flex-1">
                            Map Here
                          </div>
                        </div>
                        <div className='flex gap-8 main-between flex-1'>
                          <LiveStatusContainer id={id} group={true}/>
                          <IncidentGroupAssignPerson id={incidentGroupDetails.head} />
                        </div>
                      </div>
                      
                      <div className="container flex col flex-1 gap-8">
                        <div className='flex col gap-8'>
                          <span className="subheading-l">Members</span>
                          {includedIncidents.map((incident) => {
                            if(incident.id == incidentGroupDetails.head){
                              return <div className="flex gap-8 cross-center main-between">
                              <span className="subheading-m">{incident.title}</span>
                              <div className="flex gap-16">
                                <button className="button text" onClick={() => navigate(`/reports/${incident.id}`)}>View</button>
                                {(user_type == 'admin' || userPermissions['manage_incidents']) ? <button className="button filled" onClick={() => validateIncidentGroup()}>Remove</button> : <></>}
                              </div>
                            </div>;
                            } else{
                              <span>limaw</span>
                            }
                          })}
                        </div>
                        <hr />
                        <div className='flex col gap-8'>
                        {includedIncidents.map((incident) => {
                            if(incident.id != incidentGroupDetails.head){
                              return <div className="flex gap-8 cross-center main-between">
                              <span className="subheading-m">{incident.title}</span>
                              <div className="flex gap-16">
                                <button className="button text" onClick={() => navigate(`/reports/${incident.id}`)}>View</button>
                                {(user_type == 'admin' || userPermissions['manage_incidents']) ? <button className="button filled" onClick={() => removeIncident(incident.id)}>Remove</button> : <></>}
                              </div>
                            </div>;
                            } else{
                              <span>limaw</span>
                            }
                          })}
                        </div>
                      </div>
                    </div> : <span>Loading...</span>}
                </div>
            </div>
        </div>
        <Modal />
    </div>
  )
}

export default IncidentGroupPage