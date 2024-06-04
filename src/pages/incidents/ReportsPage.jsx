import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import "../../styles/table.css";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../config/firebase";
import { Link } from "react-router-dom";

const ReportsPage = () => {

  const [incidentList, setIncidentList] = useState([]);
  const incidentCollectionRef = collection(firestore, "incidents");

  const [incidentGroupList, setIncidentGroupList] = useState([]);
  const incidentGroupCollectionRef = collection(firestore, "incident_groups");

  useEffect(() => {
    const getIncidentGroupsList = async () => {
      try {
        const data = await getDocs(incidentGroupCollectionRef);
        const filteredData = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          date: new Date(
            doc.data().timestamp.seconds * 1000
          ).toLocaleString(),
        }))
        setIncidentGroupList(filteredData);
      } catch(error){
        window.alert(error);
      }
    }
    const getIncidentsList = async () => {
      try {
        const data = await getDocs(incidentCollectionRef);
        const filteredData = data.docs
          .map((doc) => ({
            ...doc.data(),
            id: doc.id,
            title: doc.data().title,
            date: new Date(
              doc.data().timestamp.seconds * 1000
            ).toLocaleString(),
            tag: doc.data().incident_tag,
          }))
          .filter(
            (incident) =>
              incident.status !== "Resolved" && incident.status !== "Closed"
          );
        setIncidentList(filteredData);
      } catch (err) {
        window.alert(err);
      }
    };

    getIncidentsList();
    getIncidentGroupsList();
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
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Non
                odit magni molestias, nisi, quidem, assumenda quaerat repellat
                quis quo nemo est laboriosam blanditiis repellendus vitae
                eveniet debitis aspernatur autem. Id!
              </span>
              <section className="table__body">
                <table>
                  <thead>
                    <tr>
                      <th>
                        {" "}
                        Title <span className="icon-arrow">↑</span>
                      </th>
                      <th>
                        {" "}
                        Date Time <span className="icon-arrow">↑</span>
                      </th>
                      <th>
                        {" "}
                        Incident Tag <span className="icon-arrow">↑</span>
                      </th>
                      <th>
                        {" "}
                        Action <span className="icon-arrow">↑</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidentList.map((incident) => (
                      <>
                        <tr>
                          <td>{incident.title}</td>
                          <td>{incident.date}</td>
                          <td>{incident.incident_tag}</td>
                          <td><Link to={`/reports/${incident.id}`}>View</Link> Delete</td>
                        </tr>
                      </>
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
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Non
                odit magni molestias, nisi, quidem, assumenda quaerat repellat
                quis quo nemo est laboriosam blanditiis repellendus vitae
                eveniet debitis aspernatur autem. Id!
              </span>
              <section className="table__body">
                <table>
                  <thead>
                    <tr>
                      <th>
                        {" "}
                        Title
                      </th>
                      <th>
                        {" "}
                        Date
                      </th>
                      <th>
                        {" "}
                        Incidents
                      </th>
                      <th>
                        {" "}
                        Status <span className="icon-arrow">↑</span>
                      </th>
                      <th>
                        {" "}
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidentGroupList.map((group) => (
                      <tr>
                        <td>{group.title}</td>
                        <td>{group.date}</td>
                        <td>{group.incidents}</td>
                        <td>{group.status}</td>
                        <td><Link to={`/incident_group/${group.id}`}>View</Link> Delete</td>
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
