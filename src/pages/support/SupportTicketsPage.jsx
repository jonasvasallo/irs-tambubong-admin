import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../config/firebase';

const SupportTicketsPage = () => {
    const [ticketsList, setTicketsList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(firestore, 'help'), (snapshot) => {
            const promises = snapshot.docs.map(async (ticketDoc) => {
                const ticketData = ticketDoc.data();
                const userDocRef = doc(firestore, 'users', ticketData.created_by);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.exists() ? userDoc.data() : null;
                return {
                    ...ticketData,
                    id: ticketDoc.id,
                    date: moment.unix(ticketData.timestamp.seconds).format('ddd, MMMM D, YYYY [at] h:mm A'),
                    userFullName: userData ? `${userData.first_name} ${userData.last_name}` : 'Unknown',
                    profile_pic: userData ? userData.profile_path : 'Unknown',
                };
            });

            Promise.all(promises).then((tickets) => {
                const filteredData = tickets.filter((ticket) => ticket.status === 'Open').sort((a, b) => a.timestamp - b.timestamp);;
                setTicketsList(filteredData);
            }).catch((error) => {
                console.error('Error fetching ticket data:', error);
                alert('An error occurred while fetching ticket data.');
            });
        });

        return () => unsubscribe();
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredTickets = ticketsList.filter((ticket) => 
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.userFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.includes(searchQuery)
    );

    return (
        <>
            <div className="content">
                <Sidebar/>
                <div className="main-content">
                    <Header title="Support Tickets"/>
                    <div className="content-here">
                        <div className="container w-100 overflow-scroll">
                            <div className="flex main-between">
                                <div className="flex col gap-8 flex-3">
                                    <span className="heading-s">Latest Support Tickets</span>
                                    <span className="body-m">Here are your latest support tickets</span>
                                </div>
                                <div className="flex-1">
                                    <div className="input-field">
                                        <input 
                                            type="text" 
                                            placeholder='Search' 
                                            value={searchQuery} 
                                            onChange={handleSearchChange} 
                                        />
                                    </div>
                                </div>
                            </div>
                            <br />
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ticket No.</th>
                                        <th>Title</th>
                                        <th>Created By</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTickets.map((ticket) => (
                                        <tr key={ticket.id}>
                                            <td>{ticket.id}</td>
                                            <td>{ticket.title}</td>
                                            <td>
                                                <img src={ticket.profile_pic} alt="" width={40} height={40}/>
                                                <span>{ticket.userFullName}</span>
                                            </td>
                                            <td>{ticket.date}</td>
                                            <td>{ticket.status}</td>
                                            <td>
                                                <Link to={`/tickets/${ticket.id}`}>
                                                    <button className="button secondary">View</button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SupportTicketsPage;
