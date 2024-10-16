import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import "../../styles/table.css";
import { collection, onSnapshot, doc, getDoc, getDocs, where, query, orderBy } from "firebase/firestore";
import { firestore } from "../../config/firebase";
import { Link } from "react-router-dom";
import SearchModulesField from "../../components/SearchModulesField";
import { useModal } from '../../core/ModalContext';
import Modal from '../../components/Modal';
import MonthlySummaryReport from "../../components/MonthlySummaryReport";

const ReportsPage = () => {
  const [incidentList, setIncidentList] = useState([]);
  const incidentCollectionRef = collection(firestore, "incidents");
  
  const [incidentGroupList, setIncidentGroupList] = useState([]);
  const incidentGroupCollectionRef = collection(firestore, "incident_groups");

  const [incidentStatusFilter, setIncidentStatusFilter] = useState("Active");
  const [incidentGroupStatusFilter, setIncidentGroupStatusFilter] = useState("Active");

  const { openModal } = useModal();

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

  async function generateMonthlyReport() {
    const html2pdf = (await import("html2pdf.js")).default;
    
    // Get the current month and year
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
    // Query Firestore for incidents reported in the current month
    const incidentsRef = collection(firestore, "incidents");
    const q = query(
      incidentsRef,
      where("timestamp", ">=", firstDayOfMonth),
      where("timestamp", "<=", lastDayOfMonth)
    );
  
    const querySnapshot = await getDocs(q);
    const incidents = [];
  
    // Iterate through the querySnapshot docs
    for (const docSnapshot of querySnapshot.docs) {
      const incidentData = docSnapshot.data();
      const incidentTagId = incidentData.incident_tag;
      
      // Fetch the incident tag name
      let tag_name = "Unknown"; // default value if no tag is found
  
      if (incidentTagId) {
        const tagDocRef = doc(firestore, "incident_tags", incidentTagId); // Correct Firestore doc() function
        const tagDoc = await getDoc(tagDocRef);
  
        if (tagDoc.exists()) {
          tag_name = tagDoc.data().tag_name;
        }
      }
      
      // Add the incident data to the array, including the tag_name
      incidents.push({
        id: docSnapshot.id,
        ...incidentData,
        tag_name,
      });
    }
  
    // Create a container div that includes the logo, title, report content, and footer
    const container = document.createElement('div');
    
    // HTML structure for the logo, header, and report content
    container.innerHTML = `
      <div style="text-align: center; margin: auto; margin-bottom: 40px;">
        <img src="/src/assets/logo.jpg" alt="Tambubong IRS Logo" style="width: 80px; margin: 0 auto 10px;" />
        <div class="flex col gap-8">
          <h5>REPUBLIC OF THE PHILIPPINES</h5>
          <p>Province of Bulacan</p>
          <p>Municipality of San Rafael</p>
          <p>Barangay Tambubong</p>
        </div>
        <br/>
        <h2>Monthly Incidents Summary Report</h2>
      </div>
      <div>
        <h3>Incident Reports for ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
        <table>
          <thead>
            <th>Incident ID</th>
            <th>Title</th>
            <th>Reported on</th>
            <th>Tag</th>
            <th>Status</th>
          </thead>
          <tbody>
            ${incidents.map(incident => `
              <tr>
                <td>${incident.id}</td>
                <td><strong>${incident.title}</strong></td>
                <td>${new Date(incident.timestamp.seconds * 1000).toLocaleString()}</td>
                <td>${incident.tag_name}</td>
                <td>${incident.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  
    // Add the footer to the container
    const footer = document.createElement('div');
    footer.innerHTML = `
      <div style="text-align: center; margin-top: 50px; font-size: 12px;">
        <p>This is a system-generated report.</p>
      </div>
    `;
    container.appendChild(footer);
  
    // Now pass the container with the logo, header, report content, and footer to html2pdf
    html2pdf(container, {
      margin: 20,
      filename: 'monthly_summary_report.pdf',
      html2canvas: { scale: 2, useCORS: true },
    });
  }
  
  

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
                <div className="flex col gap-8">
                <SearchModulesField module='incidents'/>
                <button className="button outlined" onClick={() => generateMonthlyReport()}>Monthly Summary Report</button>
                </div>
                
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
      <Modal />
    </div>
  );
};

export default ReportsPage;
