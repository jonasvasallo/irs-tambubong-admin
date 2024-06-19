import React, { useState, useEffect } from 'react';
import { firestore } from '../config/firebase';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import moment from 'moment';

const RepliesSection = (props) => {
    const [repliesList, setRepliesList] = useState([]);

    useEffect(() => {
        const replyDocRef = doc(firestore, 'help', props.id);
        const repliesCollectionRef = collection(replyDocRef, 'replies');
        
        const unsubscribe = onSnapshot(repliesCollectionRef, (snapshot) => {
            const promises = snapshot.docs.map(async (replyDoc) => {
                const replyData = replyDoc.data();
                const userDocRef = doc(firestore, 'users', replyData.user_id);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.exists() ? userDoc.data() : null;

                let formattedDate = 'Unknown';
                if (replyData.timestamp && replyData.timestamp.seconds) {
                    formattedDate = moment.unix(replyData.timestamp.seconds).format('ddd, MMMM D, YYYY [at] h:mm A');
                }

                return {
                    ...replyData,
                    id: replyDoc.id,
                    timestamp: replyData.timestamp,
                    date: formattedDate,
                    userFullName: userData ? `${userData.first_name} ${userData.last_name}` : 'Unknown',
                    profile_pic: userData ? userData.profile_path : 'Unknown',
                };
            });

            Promise.all(promises).then((replies) => {
                const sortedReplies = replies.sort((a, b) => {
                    if (!b.timestamp || !b.timestamp.seconds) return -1;
                    if (!a.timestamp || !a.timestamp.seconds) return 1;
                    return b.timestamp.seconds - a.timestamp.seconds;
                });
                setRepliesList(sortedReplies);
            }).catch((error) => {
                console.error('Error fetching reply data:', error);
                alert('An error occurred while fetching reply data.');
            });
        });

        return () => unsubscribe();
    }, [props.id]);

    return (
        <div className="flex col gap-8">
            {repliesList.map((reply) => (
                <div key={reply.id} className="reply flex gap-8">
                    <img src={reply.profile_pic} alt="" width={50} height={50} style={{objectFit: 'cover'}}/>
                    <div className="flex col">
                        <span className="subheading-m">{reply.userFullName}</span>
                        <span className="body-m color-minor">{reply.date}</span>
                        <span>{reply.content}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RepliesSection;
