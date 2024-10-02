import React, {useState, useEffect} from 'react'
import Sidebar from '../../components/Sidebar'
import { Link } from 'react-router-dom';
import Header from '../../components/Header'
import { collection, doc, onSnapshot, getDoc, query, where, orderBy } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import SearchModulesField from '../../components/SearchModulesField';

const ComplaintsPage = () => {

    const [ComplaintsList, setComplaintsList] = useState([]);
    const complaintsCollectionRef = collection(firestore, "complaints");

    const [filterField, setFilterField] = useState("Active");

    useEffect(() => {
        console.log(filterField);
        const complaintsQuery = (filterField == 'Active') ? query(
            complaintsCollectionRef,
            where('status', 'in', ['Open', 'In Progress']),
            orderBy('issued_at', 'asc')
          ) : query(
            complaintsCollectionRef,
            where('status', '==', filterField),
            orderBy('issued_at', 'asc')
          );

        const unsubscribe = onSnapshot(complaintsQuery, (snapshot) => {
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
                setComplaintsList(complaints)
            }).catch((error) => {
                console.log("Error fetching complaint collection: ", error);
                alert("An error occured while fetching complaint collection");
            });
        });

        return () => unsubscribe();
    }, [filterField]);

    const handleFilterChange = (event) => {
        
        setFilterField(event.target.value);
        
    };

  return (
    <div className="content">
        <Sidebar />
        <div className="main-content">
            <Header title="Submitted Complaints"/>
            <div className="content-here">
                <div className="container w-100 h-100">
                    <div className="flex main-between">
                        <div>
                        <div className="flex col gap-8">
                            <div className="flex gap-8 cross-center">
                                <span className="heading-m color-major block">Complaints</span>
                                <Link to={`/schedules`} className='anchor'>View Scheduled</Link>
                            </div>
                        </div>
                        <div className="filter-section">
                            <label htmlFor="statusFilter"><span className='body-m'>Filter by Status: </span></label>
                            <select
                                id="statusFilter"
                                value={filterField}
                                onChange={handleFilterChange}
                            >
                                <option value="Active">Active</option>
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Closed">Closed</option>
                                <option value="Dismissed">Dismissed</option>
                            </select>
                        </div>
                        
                        </div>
                        <SearchModulesField module="complaints"/>
                    </div>
                    <br />
                    <div style={{'overflow-y': 'scroll', 'height' : '80%'}}>
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
                                    <tr id={`${complaint.id}`}>
                                        <td>{complaint.full_name}</td>
                                        <td>{complaint.contact_no}</td>
                                        <td>{complaint.email}</td>
                                        <td>{complaint.date}</td>
                                        <td><span className={`status-value ${(complaint.status == 'In Progress') ? 'in-progress' : (complaint.status).toString().toLowerCase()}`}>{complaint.status}</span></td>
                                        <td><Link className='button secondary' to={`/complaints/${complaint.id}`}>View</Link></td>
                                    </tr>
                                </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ComplaintsPage