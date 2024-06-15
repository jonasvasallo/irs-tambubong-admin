import React, {useState, useEffect} from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Link } from 'react-router-dom'
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore'
import { firestore } from '../../config/firebase'

const UsersPage = () => {

    const [usersList, setUsersList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredUsersList, setFilteredUsersList] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const usersCollectionRef = collection(firestore, "users");
            const usersSnapshot = await getDocs(usersCollectionRef);

            const data = usersSnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));

            setUsersList(data);
        }

        fetchUsers();
        console.log("Fetching happens");
    }, []);

    useEffect(() => {
        const filteredData = usersList.filter(user =>
            user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredUsersList(filteredData);
    }, [searchQuery, usersList]);


    const banUser = async (user_id) => {
        const userDocRef = doc(firestore, "users", user_id);

        try{
            await updateDoc(userDocRef, {
                disabled : true,
            })

            window.location.reload();
        } catch(error){
            alert(error.message);
        }
    }

    const liftBanUser = async (user_id) => {
        const userDocRef = doc(firestore, "users", user_id);

        try{
            await updateDoc(userDocRef, {
                disabled : false,
            })

            window.location.reload();
        } catch(error){
            alert(error.message);
        }
    }

  return (
    <>
        <div className="content">
            <Sidebar/>
            <div className="main-content">
                <Header title="Users" />
                <div className="content-here">
                    <div className="container w-100 overflow-scroll">
                        <span className="heading-s color-major">Manage Users</span>
                        <div className="flex main-between">
                            <div className='w-100'>
                                <div className="input-field" style={{maxWidth:'50%', display: 'inline-block', marginRight:'8px'}}>
                                    <input type="text" placeholder='Search' className='' style={{minHeight:'35px'}} onChange={(e) => setSearchQuery(e.target.value)}/>
                                </div>
                            </div>
                        </div>
                        <table>
                            <thead>
                                <th></th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Verification</th>
                                <th>Action</th>
                            </thead>
                            <tbody>
                                {filteredUsersList.map((user) => (
                                    <tr>
                                        <td><img src={user.profile_path} alt="" /></td>
                                        <td><span className='subheading-m'>{`${user.first_name} ${user.last_name}`}</span></td>
                                        <td><span>{`${user.user_type.toUpperCase()}`}</span></td>
                                        <td>{(user.verified) ? <span className='status success'>Verified</span> : <span className='status error'>Not Verified</span>}</td>
                                        <td><Link to={`/users/${user.id}`}><button className='button secondary'>View</button></Link> {user.disabled && user.disabled ? <button className='button filled warning' onClick={() => liftBanUser(user.id)}>Unban</button> : <button className='button filled error' onClick={() => banUser(user.id)}>Ban</button>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default UsersPage