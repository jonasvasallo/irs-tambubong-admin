import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { collection, getDocs, doc, getDoc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { firestore } from '../../config/firebase';

const EmergenciesPage = () => {

    const [emergencyList, setEmergencyList] = useState([]);
    const emergencyCollectionRef = collection(firestore, "sos");
    const [filterField, setFilterField] = useState("Active");

    useEffect(() => {

        const emergenciesQuery = query(
            emergencyCollectionRef,
            where('status', '==', filterField),
            orderBy('timestamp', 'asc')
        )

        const unsubscribe = onSnapshot(emergenciesQuery, (snapshot) => {
            const promises = snapshot.docs.map(async (emergencyDoc) => {
                const emergencyData = emergencyDoc.data();
                const userDocRef = doc(firestore, 'users', emergencyData.user_id);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.exists() ? userDoc.data() : null;

                return {
                    ...emergencyData,
                    id: emergencyDoc.id,
                    date: new Date(emergencyData.timestamp.seconds * 1000).toLocaleString(),
                    userFullName: userData ? `${userData.first_name} ${userData.last_name}` : 'Unknown',
                    contact_no: userData ? userData.contact_no : 'Unknown',
                };
            });

            Promise.all(promises).then((emergencies) => {
                setEmergencyList(emergencies);
            }).catch((error) => {
                console.error('Error fetching emergency data:', error);
                alert('An error occurred while fetching emergency data.');
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
                <Header title="Emergency Calls"/>
                <div className="content-here">
                    <div className="container w-100">

                        <div className="flex col gap-8">

                            <span className="heading-m color-major block">Emergencies</span>

                            <div className="filter-section">
                                <label htmlFor="statusFilter"><span className='body-m'>Filter by Status: </span></label>
                                <select
                                    id="statusFilter"
                                    value={filterField}
                                    onChange={handleFilterChange}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Handling">Handling</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                    <option value="Dismissed">Dismissed</option>
                                </select>
                            </div>

                        </div>
                        <br />
                        <section className="table__body">
                            <table>
                                <thead>
                                    <tr>
                                    <th>
                                        {" "}
                                        Resident
                                    </th>
                                    <th>
                                        {" "}
                                        Contact Number 
                                    </th>
                                    <th>
                                        {" "}
                                        Placed At
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
                                    {emergencyList.map((emergency) => (
                                    <>
                                        <tr>
                                        <td>{emergency.userFullName}</td>
                                        <td>{emergency.contact_no}</td>
                                        <td>{emergency.date}</td>
                                        <td><span className={`status-value ${(emergency.status).toString().toLowerCase()}`}>{emergency.status}</span></td>
                                        <td><Link className='button secondary' to={`/emergencies/${emergency.id}`}>View</Link></td>
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

export default EmergenciesPage