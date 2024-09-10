import React, { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { collection, doc, getDoc, query, startAfter, limit, endBefore, limitToLast, orderBy } from 'firebase/firestore';
import { firestore } from '../../config/firebase'
import fetchPaginatedData from '../../core/fetchPaginatedData';

function AuditLogsPage() {

    const [auditLogs, setAuditLogs] = useState([]);
    const [pageAction, setPageAction] = useState("NEXT");
    const [page, setPage] = useState(1);
    const [afterThis, setAfterThis] = useState(null);
    const [beforeThis, setBeforeThis] = useState(null);

    const [limitReached, setLimitReached] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    const fetchUserDetails = async (uid) => {
        try {
            const userRef = doc(firestore, 'users', uid);
            const userSnap = await getDoc(userRef);
    
            if (userSnap.exists()) {
                const { first_name, last_name } = userSnap.data();
                return `${first_name} ${last_name}`;
            } else {
                console.error('User not found');
                return 'Unknown User';
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            return 'Unknown User';
        }
    };

    const fetchData = async () => {
        console.log('page: ', page);

        const pageSize = 4;

        const paginationConfig = {
            collection: 'audits',
            records_limit: pageSize,
            pageAction: pageAction,
            page: page,
            fields: {
                uid: true,
                action: true,
                module: true,
                description: true,
                timestamp: true,
            },
            orderByField: 'timestamp',
            orderByOrder: 'desc',
            lastIndex: afterThis,
            firstIndex: beforeThis,
            whereFields: [
            ],
        }

        try{
            const records = await fetchPaginatedData(paginationConfig);

            if(records?.length > 0){
                const last_index = records.length - 1;
                const first_index = 0;

                setAfterThis(records[last_index][paginationConfig.orderByField]);
                setBeforeThis(records[first_index][paginationConfig.orderByField]);

                const recordsWithUserNames = await Promise.all(
                    records.map(async (log) => {
                        const userName = await fetchUserDetails(log.uid); // Fetch user name
                        return { ...log, userName }; // Append the user name to the audit log
                    })
                );

                setAuditLogs(recordsWithUserNames);
            } else{
                console.log("No records found!");
                setLimitReached(true);
            }
        } catch(err){
            console.error("Error fetching data: ", err);
        }
        
    }

    useEffect(() => {
        fetchData();
    }, [page]);

    const handleNextPage = () => {
        if(!limitReached){
            setPageAction("NEXT");
            setPage(page + 1);
            console.log("go next page");
        }
        
    };
    
    const handlePrevPage = () => {
        if (page > 1) {
            setPageAction("PREVIOUS");
            setPage(page - 1);
            setLimitReached(false);
        }
    };

    const getActionClassName = (action) => {
        switch (action.toLowerCase()) {
            case 'create':
                return 'status-value verifying'; // e.g. green
            case 'update':
                return 'status-value resolved'; // e.g. yellow
            case 'delete':
                return 'status-value rejected'; // e.g. red
            default:
                return 'status-value verified'; // default class, e.g. grey
        }
    };

  return (
    <div className="content">
        <Sidebar/>
        <div className="main-content">
            <Header title="Audit Logs"/>
            <div className="content-here">
                <div className="h-100 w-100">
                    <div className="container w-100 flex col main-between">
                        <div>
                        <div className="flex col gap-8">
                            <span className="heading-s color-major">Audit Logs</span>
                            <span className="body-m color-minor">Monitor any changes made in the system with audit logs.</span>
                        </div>
                        <br />
                        <table>
                            <thead>
                                <th>User</th>
                                <th>User ID</th>
                                <th>Action</th>
                                <th>Module</th>
                                <th>Description</th>
                                <th>Timestamp</th>
                            </thead>
                            <tbody>
                                
                                {auditLogs.length > 0 ? (
                                            auditLogs.map((log, index) => (
                                                <tr key={index}>
                                                    <td>{log.userName}</td>
                                                    <td><span className="status-value in-progress">{log.uid}</span></td>
                                                    <td>
                                                        <span className={getActionClassName(log.action)}>
                                                            {log.action.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td><span className="status-value verified">{log.module.toUpperCase()}</span></td>
                                                    <td>{log.description}</td>
                                                    <td>{new Date(log.timestamp?.seconds * 1000).toLocaleString()}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6">No records available.</td>
                                            </tr>
                                        )}
                            </tbody>
                        </table>
                        </div>
                        <br />
                        <div className="flex gap-8">
                            <button onClick={handlePrevPage} className='button filled'>
                                Previous
                            </button>
                            <button onClick={handleNextPage} className="button filled">
                                Next
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default AuditLogsPage