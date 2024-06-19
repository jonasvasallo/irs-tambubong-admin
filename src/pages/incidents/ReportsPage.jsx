import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import "../../styles/table.css";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { firestore } from "../../config/firebase";
import { Link } from "react-router-dom";

const ReportsPage = () => {
  const [incidentList, setIncidentList] = useState([]);
  const incidentCollectionRef = collection(firestore, "incidents");

  const [incidentGroupList, setIncidentGroupList] = useState([]);
  const incidentGroupCollectionRef = collection(firestore, "incident_groups");

  useEffect(() => {
    const getIncidentTag = async (incidentTagId) => {
      const tagDocRef = doc(firestore, "incident_tags", incidentTagId);
      const tagDoc = await getDoc(tagDocRef);
      return tagDoc.exists() ? tagDoc.data().tag_name : "Unknown";
    };

    const unsubscribeIncidents = onSnapshot(incidentCollectionRef, async (snapshot) => {
      const incidents = await Promise.all(snapshot.docs.map(async (doc) => {
        const incidentData = doc.data();
        const tag_name = await getIncidentTag(incidentData.incident_tag);
        return {
          ...incidentData,
          id: doc.id,
          date: new Date(incidentData.timestamp.seconds * 1000).toLocaleString(),
          tag_name,
        };
      }));
      
      const filteredData = incidents
        .filter(incident => incident.status !== "Resolved" && incident.status !== "Closed")
        .sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);
      
      setIncidentList(filteredData);
    }, (error) => {
      window.alert(error);
    });

    const unsubscribeIncidentGroups = onSnapshot(incidentGroupCollectionRef, (snapshot) => {
      const incidentGroups = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        date: new Date(doc.data().timestamp.seconds * 1000).toLocaleString(),
      }))
      .filter(group => group.status !== "Resolved" && group.status !== "Closed")
      .sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);

      setIncidentGroupList(incidentGroups);
    }, (error) => {
      window.alert(error);
    });

    // Cleanup on unmount
    return () => {
      unsubscribeIncidents();
      unsubscribeIncidentGroups();
    };
  }, []);

  return (
    <div className="content">
      <Sidebar />
      <div className="main-content">
        <Header title="Reported Incidents" />
        <div className="content-here">
          <div className="flex gap-32 h-90">
            <div className="container w-100">
              <span className="heading-m color-major block">Incidents</span>
              <span className="body-m color-minor block">
                Reported non-emergency incidents from residents
              </span>
              <section className="table__body">
                <table>
                  <thead>
                    <tr>
                      <th>
                        Title <span className="icon-arrow">↑</span>
                      </th>
                      <th>
                        Date Time <span className="icon-arrow">↑</span>
                      </th>
                      <th>
                        Incident Tag <span className="icon-arrow">↑</span>
                      </th>
                      <th>
                        Action <span className="icon-arrow">↑</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidentList.map((incident) => (
                      <tr key={incident.id}>
                        <td>{incident.title}</td>
                        <td>{incident.date}</td>
                        <td>{incident.tag_name}</td>
                        <td><Link className="button filled" to={`/reports/${incident.id}`}>View</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
            <div className="container w-100">
              <span className="heading-m color-major block">
                Incident Groups
              </span>
              <span className="body-m color-minor block">
                Same incidents reported that are grouped together
              </span>
              <section className="table__body">
                <table>
                  <thead>
                    <tr>
                      <th>
                        Title
                      </th>
                      <th>
                        Date
                      </th>
                      <th>
                        Incidents
                      </th>
                      <th>
                        Status <span className="icon-arrow">↑</span>
                      </th>
                      <th>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidentGroupList.map((group) => (
                      <tr key={group.id}>
                        <td>{group.title}</td>
                        <td>{group.date}</td>
                        <td>{group.incidents}</td>
                        <td>{group.status}</td>
                        <td><Link className="button filled" to={`/incident_group/${group.id}`}>View</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
