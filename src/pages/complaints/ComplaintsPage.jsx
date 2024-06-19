import React, {useState, useEffect} from 'react'
import Sidebar from '../../components/Sidebar'
import { Link } from 'react-router-dom';
import Header from '../../components/Header'
import { collection, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';

const ComplaintsPage = () => {

    const [ComplaintsList, setComplaintsList] = useState([]);
    const complaintsCollectionRef = collection(firestore, "complaints");

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(firestore, "complaints"), (snapshot) => {
            const promises = snapshot.docs.map(async (complaintDoc) => {
                const complaintData = complaintDoc.data();
                const userDocRef = doc(firestore, 'users', complaintData.issued_by);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.exists() ? userDoc.data() : null;

                return {
                    ...complaintData,
                    id: complaintDoc.id,
                    date: new Date(complaintData.issued_at.seconds * 1000).toLocaleString(),
                    issuer: userData ? `${userData.first_name} ${userData.last_name}` : `Unknown`,
                };
            });

            Promise.all(promises).then((complaints) => {
                const filteredData = complaints.filter((complaint) => complaint.status == "Open" || complaint.status == "In Progress").sort((a, b) => a.issued_at - b.issued_at);
                setComplaintsList(filteredData);
            }).catch((error) => {
                console.log("Error fetching complaint collection: ", error);
                alert("An error occured while fetching complaint collection");
            });
        });

        return () => unsubscribe();
    }, []);

  return (
    <div className="content">
        <Sidebar />
        <div className="main-content">
            <Header title="Submitted Complaints"/>
            <div className="content-here">
                <div className="container w-100 h-100">
                <div className="flex gap-8 cross-center">
                    <span className="heading-m color-major block">Complaints</span>
                    <Link to={`/schedules`} className='anchor'>View Scheduled</Link>
                </div>
                        <section className="table__body">
                            <table>
                                <thead>
                                    <tr>
                                    <th>
                                        {" "}
                                        Complainant
                                    </th>
                                    <th>
                                        {" "}
                                        Contact Number
                                    </th>
                                    <th>
                                        {" "}
                                        Email Address
                                    </th>
                                    <th>
                                        {" "}
                                        Issued At 
                                    </th>
                                    <th>
                                        {" "}
                                        Status
                                    </th>
                                    <th>
                                        {" "}
                                        Action
                                    </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ComplaintsList.map((complaint) => (
                                    <>
                                        <tr>
                                            <td>{complaint.full_name}</td>
                                            <td>{complaint.contact_no}</td>
                                            <td>{complaint.email}</td>
                                            <td>{complaint.date}</td>
                                            <td>{complaint.status}</td>
                                            <td><Link className='button secondary' to={`/complaints/${complaint.id}`}>View</Link></td>
                                        </tr>
                                    </>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ComplaintsPage