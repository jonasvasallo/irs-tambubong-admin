import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import "../../styles/table.css";
import { collection, onSnapshot, doc, getDoc, where, query, orderBy } from "firebase/firestore";
import { firestore } from "../../config/firebase";
import { Link } from "react-router-dom";
import SearchModulesField from "../../components/SearchModulesField";

const ReportsPage = () => {
  const [incidentList, setIncidentList] = useState([]);
  const incidentCollectionRef = collection(firestore, "incidents");
  
  const [incidentGroupList, setIncidentGroupList] = useState([]);
  const incidentGroupCollectionRef = collection(firestore, "incident_groups");

  const [incidentStatusFilter, setIncidentStatusFilter] = useState("Active");
  const [incidentGroupStatusFilter, setIncidentGroupStatusFilter] = useState("Active");

  useEffect(() => {

    const incidentsQuery = (incidentStatusFilter == 'Active') ? query(
      incidentCollectionRef,
      where('status', 'not-in', ['Resolved', 'Closed']),
      orderBy('timestamp', 'asc')
    ) : query(
      incidentCollectionRef,
      where('status', '==', incidentStatusFilter),
      orderBy('timestamp', 'asc')
    );

    const getIncidentTag = async (incidentTagId) => {
      const tagDocRef = doc(firestore, "incident_tags", incidentTagId);
      const tagDoc = await getDoc(tagDocRef);
      return tagDoc.exists() ? tagDoc.data().tag_name : "Unknown";
    };

    const unsubscribeIncidents = onSnapshot(incidentsQuery, async (snapshot) => {
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
      
      setIncidentList(incidents);
    }, (error) => {
      window.alert(error);
      console.log(error);
    });

    

    // Cleanup on unmount
    return () => {
      unsubscribeIncidents();
    };
  }, [incidentStatusFilter]);


  useEffect(() => {

    const incidentGroupQuery = (incidentGroupStatusFilter == 'Active') ? query(
      incidentGroupCollectionRef,
      where('status', 'not-in', ['Resolved', 'Closed']),
      orderBy('timestamp', 'desc')
    ) : query(
      incidentGroupCollectionRef,
      where('status', '==', incidentGroupStatusFilter),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeIncidentGroups = onSnapshot(incidentGroupQuery, (snapshot) => {
      const incidentGroups = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        date: new Date(doc.data().timestamp.seconds * 1000).toLocaleString(),
      }))

      setIncidentGroupList(incidentGroups);
    }, (error) => {
      window.alert(error);
      console.log(error);
    });

    return () => {
      unsubscribeIncidentGroups();
    };
  }, [incidentGroupStatusFilter]);

  const handleIncidentFilterChange = (event) => {
    setIncidentStatusFilter(event.target.value);
  };

  const handleIncidentGroupFilterChange = (event) => {
    setIncidentGroupStatusFilter(event.target.value);
  };

  return (
    <div className="content">
      <Sidebar />
      <div className="main-content">
        <Header title="Reported Incidents" />
        <div className="content-here">
          <div className="flex gap-32 h-100">
            <div className="container w-100">
              <div className="flex main-between">
                <div>
                <div className="flex col gap-8">
                <span className="heading-m color-major block">Incidents</span>
                {/* <span className="body-m color-minor block">
                  Reported non-emergency incidents from residents
                </span> */}
                <div className="filter-section">
                    <label htmlFor="incidentStatusFilter"><span className='body-m'>Filter by Status: </span></label>
                    <select
                        id="incidentStatusFilter"
                        value={incidentStatusFilter}
                        onChange={handleIncidentFilterChange}
                        className="selector"
                    >
                        <option value="Active">Active</option>
                        <option value="Verifying">Verifying</option>
                        <option value="Verified">Verified</option>
                        <option value="Handling">Handling</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                        <option value="Dismissed">Rejected</option>
                    </select>
                </div>
              </div>
                </div>
                <SearchModulesField module='incidents'/>
              </div>
              <br />
              <div style={{'overflow-y': 'scroll', 'height': '80%'}}>
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
              </div>
            </div>
            <div className="container w-100">
              <div className="flex main-between">
                <div>
                <div className="flex col gap-8">
                <span className="heading-m color-major block">
                  Grouped Incidents
                </span>
                {/* <span className="body-m color-minor block">
                  Same incidents reported that are grouped together
                </span> */}
                <div className="filter-section">
                    <label htmlFor="incidentGroupStatusFilter"><span className='body-m'>Filter by Status: </span></label>
                    <select
                        id="incidentGroupStatusFilter"
                        value={incidentGroupStatusFilter}
                        onChange={handleIncidentGroupFilterChange}
                        className="selector"
                    >
                        <option value="Active">Active</option>
                        <option value="Verifying">Verifying</option>
                        <option value="Verified">Verified</option>
                        <option value="Handling">Handling</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                        <option value="Dismissed">Rejected</option>
                    </select>
                </div>
              </div>
                </div>
                <SearchModulesField module='incident_groups' />
              </div>
              <br />
              <div style={{'overflow-y': 'scroll', 'height': '80%'}}>
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
                        Status
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
                        <td><span className={`status-value ${(group.status).toString().toLowerCase()}`}>{group.status}</span></td>
                        <td><Link className="button filled" to={`/incident_group/${group.id}`}>View</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
