import React, {useState, useEffect} from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { addDoc, serverTimestamp, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { auth, firestore } from '../../config/firebase';

import { useModal } from '../../core/ModalContext';
import Modal from '../../components/Modal';
import AddNewPost from '../../components/AddNewPost';

import { useAuth } from '../../core/AuthContext';

const NewsPage = () => {

    const { user_type, userPermissions } = useAuth();

    const {openModal} = useModal();
    const [NewsList, setNewsList] = useState([]);

    useEffect(() => {
        const fetchNews = async () => {
            const newsCollectionRef = collection(firestore, "news");

            try{
                const newsSnapshot = await getDocs(newsCollectionRef);
                const filteredData = newsSnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                    date: new Date(
                        doc.data().timestamp.seconds * 1000
                      ).toLocaleString(),
                })).sort((a, b) => a.timestamp - b.timestamp);
                
                setNewsList(filteredData);
            } catch(error){
                console.log(error);
                alert(error.message);
            }
        }

        fetchNews();
    }, []);

    const deletePost = async (news_id) => {
        console.log("hello");
        const newsDocRef = doc(firestore, "news", news_id);
        try{
            await deleteDoc(newsDocRef);
            await addDoc(collection(firestore, "audits"), {
                uid: auth.currentUser.uid,
                action: 'delete',
                module: 'news',
                description: `Deleted a news post with an id of ${news_id}`,
                timestamp: serverTimestamp(),
            });
            window.location.reload();
        } catch(error){
            console.log(error);
            alert(error.message);
        }
    }
  return (
    <>
        <div className="content">
            <Sidebar />
            <div className="main-content">
                <Header title="News"/>
                <div className="content-here">
                    <div className="container">
                        <div className="flex main-end">
                            {
                                (user_type == 'admin' || userPermissions['manage_news']) ?
                                <button className="button filled" onClick={() => openModal("Add New Post", "", <AddNewPost />, "info", <></>)}>Add New Post</button>
                                :
                                <></>
                            }
                        </div>
                        <br />
                        <table>
                            <thead>
                                <th>Heading</th>
                                <th>Like Count</th>
                                <th>Comment Count</th>
                                <th>Posted at</th>
                                <th>Action</th>
                            </thead>
                            <tbody>
                                {NewsList.map((news) => (
                                    <tr>
                                        <td>{news.heading}</td>
                                        <td>{news.like_count}</td>
                                        <td>{news.comment_count}</td>
                                        <td>{news.date}</td>
                                        <td>
                                            <button className="button secondary" onClick={() => window.location.href = `/news/${news.id}`}>View</button>
                                            {(user_type == 'admin' || userPermissions['manage_news']) ? <button className="button filled error" onClick={() => deletePost(news.id)}>Delete</button> : <></>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Modal/>
        </div>
    </>
  )
}

export default NewsPage