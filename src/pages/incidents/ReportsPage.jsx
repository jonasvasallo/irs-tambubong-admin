import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import "../../styles/table.css";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../config/firebase";
import { Link } from "react-router-dom";

const ReportsPage = () => {
  const table_rows = document.querySelectorAll("tbody tr"),
    table_headings = document.querySelectorAll("thead th");

  function sortTable(column, sort_asc) {
    [...table_rows]
      .sort((a, b) => {
        let first_row = a
            .querySelectorAll("td")
            [column].textContent.toLowerCase(),
          second_row = b
            .querySelectorAll("td")
            [column].textContent.toLowerCase();

        return sort_asc
          ? first_row < second_row
            ? 1
            : -1
          : first_row < second_row
          ? -1
          : 1;
      })
      .map((sorted_row) =>
        document.querySelector("tbody").appendChild(sorted_row)
      );
  }

  table_headings.forEach((head, i) => {
    let sort_asc = true;
    head.onclick = () => {
      console.log("test");
      table_headings.forEach((head) => head.classList.remove("active"));
      head.classList.add("active");

      document
        .querySelectorAll("td")
        .forEach((td) => td.classList.remove("active"));
      table_rows.forEach((row) => {
        row.querySelectorAll("td")[i].classList.add("active");
      });

      head.classList.toggle("asc", sort_asc);
      sort_asc = head.classList.contains("asc") ? false : true;

      sortTable(i, sort_asc);
    };
  });

  const [incidentList, setIncidentList] = useState([]);
  const incidentCollectionRef = collection(firestore, "incidents");

  useEffect(() => {
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
                    <tr>
                      <td>Bugbugan</td>
                      <td> 17 Dec, 2022 - 12:54 AM </td>
                      <td>Public Harassment</td>
                      <td>View Delete</td>
                    </tr>
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
                        Id <span className="icon-arrow">↑</span>
                      </th>
                      <th>
                        {" "}
                        Customer <span className="icon-arrow">↑</span>
                      </th>
                      <th>
                        {" "}
                        Location <span className="icon-arrow">↑</span>
                      </th>
                      <th>
                        {" "}
                        Order Date <span className="icon-arrow">↑</span>
                      </th>
                      <th>
                        {" "}
                        Status <span className="icon-arrow">↑</span>
                      </th>
                      <th>
                        {" "}
                        Amount <span className="icon-arrow">↑</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td> 1 </td>
                      <td>
                        {" "}
                        <img src="images/Zinzu Chan Lee.jpg" alt="" />
                        Zinzu Chan Lee
                      </td>
                      <td> Seoul </td>
                      <td> 17 Dec, 2022 </td>
                      <td>
                        <p className="status delivered">Delivered</p>
                      </td>
                      <td>
                        {" "}
                        <strong> $128.90 </strong>
                      </td>
                    </tr>
                    <tr>
                      <td> 2 </td>
                      <td>
                        <img src="images/Jeet Saru.png" alt="" /> Jeet Saru{" "}
                      </td>
                      <td> Kathmandu </td>
                      <td> 27 Aug, 2023 </td>
                      <td>
                        <p className="status cancelled">Cancelled</p>
                      </td>
                      <td>
                        {" "}
                        <strong>$5350.50</strong>{" "}
                      </td>
                    </tr>
                    <tr>
                      <td> 3</td>
                      <td>
                        <img src="images/Sonal Gharti.jpg" alt="" /> Sonal
                        Gharti{" "}
                      </td>
                      <td> Tokyo </td>
                      <td> 14 Mar, 2023 </td>
                      <td>
                        <p className="status shipped">Shipped</p>
                      </td>
                      <td>
                        {" "}
                        <strong>$210.40</strong>{" "}
                      </td>
                    </tr>
                    <tr>
                      <td> 4</td>
                      <td>
                        <img src="images/Alson GC.jpg" alt="" /> Alson GC{" "}
                      </td>
                      <td> New Delhi </td>
                      <td> 25 May, 2023 </td>
                      <td>
                        <p className="status delivered">Delivered</p>
                      </td>
                      <td>
                        {" "}
                        <strong>$149.70</strong>{" "}
                      </td>
                    </tr>
                    <tr>
                      <td> 5</td>
                      <td>
                        <img src="images/Sarita Limbu.jpg" alt="" /> Sarita
                        Limbu{" "}
                      </td>
                      <td> Paris </td>
                      <td> 23 Apr, 2023 </td>
                      <td>
                        <p className="status pending">Pending</p>
                      </td>
                      <td>
                        {" "}
                        <strong>$399.99</strong>{" "}
                      </td>
                    </tr>
                    <tr>
                      <td> 6</td>
                      <td>
                        <img src="images/Alex Gonley.jpg" alt="" /> Alex Gonley{" "}
                      </td>
                      <td> London </td>
                      <td> 23 Apr, 2023 </td>
                      <td>
                        <p className="status cancelled">Cancelled</p>
                      </td>
                      <td>
                        {" "}
                        <strong>$399.99</strong>{" "}
                      </td>
                    </tr>
                    <tr>
                      <td> 7</td>
                      <td>
                        <img src="images/Alson GC.jpg" alt="" /> Jeet Saru{" "}
                      </td>
                      <td> New York </td>
                      <td> 20 May, 2023 </td>
                      <td>
                        <p className="status delivered">Delivered</p>
                      </td>
                      <td>
                        {" "}
                        <strong>$399.99</strong>{" "}
                      </td>
                    </tr>
                    <tr>
                      <td> 8</td>
                      <td>
                        <img src="images/Sarita Limbu.jpg" alt="" /> Aayat Ali
                        Khan{" "}
                      </td>
                      <td> Islamabad </td>
                      <td> 30 Feb, 2023 </td>
                      <td>
                        <p className="status pending">Pending</p>
                      </td>
                      <td>
                        {" "}
                        <strong>$149.70</strong>{" "}
                      </td>
                    </tr>
                    <tr>
                      <td> 9</td>
                      <td>
                        <img src="images/Alex Gonley.jpg" alt="" /> Alson GC{" "}
                      </td>
                      <td> Dhaka </td>
                      <td> 22 Dec, 2023 </td>
                      <td>
                        <p className="status cancelled">Cancelled</p>
                      </td>
                      <td>
                        {" "}
                        <strong>$249.99</strong>{" "}
                      </td>
                    </tr>
                    <tr>
                      <td> 9</td>
                      <td>
                        <img src="images/Alex Gonley.jpg" alt="" /> Alson GC{" "}
                      </td>
                      <td> Dhaka </td>
                      <td> 22 Dec, 2023 </td>
                      <td>
                        <p className="status cancelled">Cancelled</p>
                      </td>
                      <td>
                        {" "}
                        <strong>$249.99</strong>{" "}
                      </td>
                    </tr>
                    <tr>
                      <td> 9</td>
                      <td>
                        <img src="images/Alex Gonley.jpg" alt="" /> Alson GC{" "}
                      </td>
                      <td> Dhaka </td>
                      <td> 22 Dec, 2023 </td>
                      <td>
                        <p className="status cancelled">Cancelled</p>
                      </td>
                      <td>
                        {" "}
                        <strong>$249.99</strong>{" "}
                      </td>
                    </tr>
                    <tr>
                      <td> 9</td>
                      <td>
                        <img src="images/Alex Gonley.jpg" alt="" /> Alson GC{" "}
                      </td>
                      <td> Dhaka </td>
                      <td> 22 Dec, 2023 </td>
                      <td>
                        <p className="status cancelled">Cancelled</p>
                      </td>
                      <td>
                        {" "}
                        <strong>$249.99</strong>{" "}
                      </td>
                    </tr>
                    <tr>
                      <td> 9</td>
                      <td>
                        <img src="images/Alex Gonley.jpg" alt="" /> Alson GC{" "}
                      </td>
                      <td> Dhaka </td>
                      <td> 22 Dec, 2023 </td>
                      <td>
                        <p className="status cancelled">Cancelled</p>
                      </td>
                      <td>
                        {" "}
                        <strong>$249.99</strong>{" "}
                      </td>
                    </tr>
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
