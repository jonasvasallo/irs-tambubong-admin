import React, {useState, useEffect} from 'react'
import moment from 'moment'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import { useParams } from 'react-router-dom'
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { auth, firestore } from '../../config/firebase'
import RepliesSection from '../../components/RepliesSection'

import { useAuth } from '../../core/AuthContext'
const TicketDetailsPage = () => {

    const { user_type, userPermissions } = useAuth();

    const {id} = useParams();

    const [ticketDetails, setTicketDetails] = useState();
    const [userDetails, setUserDetails] = useState();

    const ticketDocRef = doc(firestore, "help", id);
    const [replyMessage, setReplyMessage] = useState("");

    const [status, setStatus] = useState();

    const sendReply = async () => {
        const repliesCollectionRef = collection(ticketDocRef, "replies");
        if(!replyMessage){
            return;
        }

        try{
            await addDoc(repliesCollectionRef, {
                user_id: auth.currentUser.uid,
                content : replyMessage.trim(),
                timestamp : serverTimestamp(),
            });

            setReplyMessage("");
        } catch(error){
            alert(error.message);
        }

    }

    const updateTicketStatus = async () => {
        if(!status){
            alert("Select a status first");
        }

        try{    
            await updateDoc(ticketDocRef, {
                status : status.trim(),
            })
            await addDoc(collection(firestore, "audits"), {
                uid: auth.currentUser.uid,
                action: 'update',
                module: 'tickets',
                description: `Updated the status of ticket with an id of ${id} to ${status.trim()}`,
                timestamp: serverTimestamp(),
            });
            setStatus("");
            window.location.reload();
        } catch(error){
            alert(error.message);
        }
    }

    useEffect(() => {
        const fetchTicketDetails = async () => {
            try{
                const ticketSnapshot = await getDoc(ticketDocRef);
                if(!ticketSnapshot.exists()){
                    alert("No such document!");
                    return;
                }

                setTicketDetails(ticketSnapshot.data());
                fetchUserDetails(ticketSnapshot.data().created_by);
            } catch(error){
                console.log(error);
                alert(error.message);
            }
        }

        const fetchUserDetails = async (user_id) => {
            const userDocRef = doc(firestore, "users", user_id);
            try{
                const userSnapshot = await getDoc(userDocRef);
                if(!userSnapshot.exists()){
                    alert("No such document!");
                    return;
                }

                setUserDetails(userSnapshot.data());
            } catch(error){
                console.log(error);
                alert(error.message);
            }
        }

        fetchTicketDetails();


    }, []);
  return (
    <>
        <div className="content">
            <Sidebar/>
            <div className="main-content">
                <Header title="Ticket Details"/>
                <div className="content-here">
                    <div className="container w-100 overflow-scroll">
                        {ticketDetails ? 
                        <div className="flex main-between gap-16">
                            <div className="flex col gap-16 flex-2">
                                <div id="ticket-heading" className='flex col gap-8'>
                                    <span className="subheading-l">{ticketDetails.title}</span>
                                    <div className="flex gap-8 cross-center">
                                        <span className={`status-value ${ticketDetails.status.toString().toLowerCase()}`}>{ticketDetails.status}</span>
                                        <span className="body-m color-minor">{moment.unix(ticketDetails.timestamp.seconds).format('ddd, MMMM D, YYYY [at] h:mm A')}</span>
                                    </div>
                                </div>
                                {userDetails &&
                                <div id="ticket-description" className='flex gap-8'>
                                    <img src={userDetails.profile_path} alt=""  width={50} height={50} style={{objectFit:'cover'}}/>
                                    <div className="flex col">
                                        <span className="subheading-m">{`${userDetails.first_name} ${userDetails.last_name}`}</span>
                                        <span className="body-m color-minor">{moment.unix(ticketDetails.timestamp.seconds).format('ddd, MMMM D, YYYY [at] h:mm A')}</span>
                                        <span>{ticketDetails.description}</span>
                                    </div>
                                </div>
                                }
                                <br />
                                    <span className="subheading-m">Reply to conversation</span>
                                    <div id="send-reply">
                                        <textarea name="" id="" className='multi-line' rows={5} placeholder='Send your reply here' onChange={(e) => setReplyMessage(e.target.value)} value={replyMessage}></textarea>
                                        <button className="button filled" onClick={() => sendReply()}>Reply</button>
                                    </div>
                                <br />
                                <span className="subheading-s color-minor">Replies</span>
                                <RepliesSection id={id}/>
                            </div>
                            <div className="flex col gap-8 flex-1">
                                {
                                    (user_type == 'admin' || userPermissions['manage_tickets']) ?
                                    <div>
                                        <span className="subheading-m">Ticket Actions</span>
                                        <div id="update-status">
                                            <select name="" id="" className="dropdown" onChange={(e) => setStatus(e.target.value)}>
                                                <option value="" selected disabled>Select a status</option>
                                                <option value="Open">Open</option>
                                                <option value="Closed">Closed</option>
                                            </select>
                                            <div></div>
                                            <br />
                                            <button className="button filled" onClick={() => updateTicketStatus()}>Save</button>
                                        </div>
                                        <br />
                                    </div> :
                                    <></>
                                }
                                <div>
                                    <span className="subheading-m">Resident Information</span>
                                    <br />
                                    <br />
                                    <div className="flex gap-8 main-between">
                                        <div className="flex-1 flex col gap-8">
                                            <span className='subheading-s'>Name</span>
                                            <span className='subheading-s'>Email</span>
                                            <span className='subheading-s'>Phone</span>
                                            <span className='subheading-s'>Verified</span>
                                            <span className='subheading-s'>Address</span>
                                        </div>
                                        <div className="flex-1 flex col gap-8">
                                            {userDetails && 
                                            <>
                                            <span className="body-m">{`${userDetails.first_name} ${userDetails.last_name}`}</span>
                                            <span className="body-m">{userDetails.email}</span>
                                            <span className="body-m">{userDetails.contact_no}</span>
                                            {userDetails.verified ? <span className="body-m status success">Verified</span> : <span className="body-m status error">Not Verified</span>}
                                            <span className="body-m">{`${userDetails.address_house} ${userDetails.address_street}`}, Tambubong, San Rafael, Bulacan</span>
                                            </>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> 
                        : 
                        <span>Loading...</span>
                        }
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default TicketDetailsPage