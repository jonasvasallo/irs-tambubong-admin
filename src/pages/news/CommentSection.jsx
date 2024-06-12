import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import React, {useState, useEffect} from 'react'
import { firestore } from '../../config/firebase';

const CommentSection = (props) => {
    const [CommentsList, setCommentList] = useState([]);

    useEffect(() => {
        const fetchComments = async () => {
            const newsDocRef = doc(firestore, "news", props.id);
            const commentsCollectionRef = collection(newsDocRef, "comments");

            try {
                const commentsSnapshot = await getDocs(commentsCollectionRef);
                const commentsData = commentsSnapshot.docs.map((comment) => ({
                    ...comment.data(),
                    id: comment.id,
                }));

                const commentsWithUserDetails = await Promise.all(
                    commentsData.map(async (comment) => {
                        const userDocRef = doc(firestore, "users", comment.comment_by);
                        const userSnapshot = await getDoc(userDocRef);
                        const userData = userSnapshot.data();
                        return {
                            ...comment,
                            user: userData,
                        };
                    })
                );

                setCommentList(commentsWithUserDetails);
            } catch (error) {
                console.log(error);
                alert(error.message);
            }
        }
        fetchComments();
    }, []);
  return (
    <div className="flex-1 w-100 flex col gap-16">
        {CommentsList.map((comment) => (
            <div className="flex gap-8 comment">
                <div>
                    <img src={comment.user?.profile_path || ''} alt="" width={40} height={40}/>
                </div>
                <div className="flex col gap-8">
                    <span className="subheading-m">{comment.user ? `${comment.user.first_name} ${comment.user.last_name}` : 'Unknown User'}</span>
                    <span className="body-m">{comment.comment}</span>
                </div>
            </div>
        ))}
    </div>
  )
}

export default CommentSection