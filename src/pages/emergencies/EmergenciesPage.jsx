import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { collection, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../config/firebase';

const EmergenciesPage = () => {

    const [emergencyList, setEmergencyList] = useState([]);
    const emergencyCollectionRef = collection(firestore, "sos");

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(firestore, 'sos'), (snapshot) => {
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
                const filteredData = emergencies.filter((emergency) => emergency.status === 'Active');
                setEmergencyList(filteredData);
            }).catch((error) => {
                console.error('Error fetching emergency data:', error);
                alert('An error occurred while fetching emergency data.');
            });
        });

        return () => unsubscribe();
    }, []);

  return (
    <div className="content">
            <Sidebar />
            <div className="main-content">
                <Header title="Emergency Calls"/>
                <div className="content-here">
                    <div className="container w-100">
                        <span className="heading-m color-major block">Emergencies</span>
                        <section className="table__body">
                            <table>
                                <thead>
                                    <tr>
                                    <th>
                                        {" "}
                                        Resident <span className="icon-arrow">↑</span>
                                    </th>
                                    <th>
                                        {" "}
                                        Contact Number <span className="icon-arrow">↑</span>
                                    </th>
                                    <th>
                                        {" "}
                                        Placed At <span className="icon-arrow">↑</span>
                                    </th>
                                    <th>
                                        {" "}
                                        Action <span className="icon-arrow">↑</span>
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
                                        <td><Link to={`/emergencies/${emergency.id}`}>View</Link> Delete</td>
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