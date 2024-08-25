import React, {useState, useEffect} from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useParams } from 'react-router-dom'

import '../../styles/newspage.css';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import CommentSection from './CommentSection';

import { useModal } from '../../core/ModalContext';
import Modal from '../../components/Modal';
import AddNewPost from '../../components/AddNewPost';

import { useAuth } from '../../core/AuthContext';

const NewsDetailsPage = () => {

    const [user_type, userPermissions] = useAuth();

    const {openModal} = useModal();
    const {id} = useParams();
    const [NewsDetails, setNewsDetails] = useState();

    useEffect(() => {
        const fetchNewsDetails = async () => {
            const newsDocRef = doc(firestore, "news", id);
            try{
                const newsSnapshot = await getDoc(newsDocRef);
                setNewsDetails(newsSnapshot.data());
            } catch(error){
                console.log(error);
                alert(error.message);
            }
        }

        fetchNewsDetails();
    }, []);

    const formatDate = (timestamp) => {
        const date = timestamp.toDate(); 
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

  return (
    <>
        <div className="content">
            <Sidebar />
            <div className="main-content">
                <Header title="News Details"/>
                <div className="content-here">
                    <div className="container">
                    {NewsDetails ? 
                        <div className="flex main-between gap-32">
                            <div className="flex col gap-8 flex-1">
                                <span className="subheading-l">{NewsDetails.heading}</span>
                                <span className="body-s color-minor">{formatDate(NewsDetails.timestamp)}</span>
                                <span className="body-m color-major">{NewsDetails.body}</span>
                                <div className="flex main-end">
                                    {(user_type == 'admin' || userPermissions['manage_news']) ? <button className="button filled" onClick={() => openModal("Edit Post", "", <AddNewPost id={id}/>, "info", <></>)}>Edit</button> : <></>}
                                </div>
                                <div className="flex gap-8 wrap">
                                    {NewsDetails.media_attachments.map((image) => (
                                        <img src={image} alt="" width={250} height={150} style={{objectFit : 'cover'}}/>
                                    ))}
                                </div>
                            </div>
                            <CommentSection id={id} />
                        </div>
                        :
                        <span>Loading...</span>
                        }
                    </div>
                </div>
            </div>
            <Modal/>
        </div>
    </>
  )
}

export default NewsDetailsPage