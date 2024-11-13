import React, {useState, useEffect} from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Link, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '../../config/firebase'
import { useModal } from '../../core/ModalContext'
import Modal from '../../components/Modal'
import VerifyUser from '../../components/VerifyUser'
import ChangeUserType from '../../components/ChangeUserType'
import { useAuth } from '../../core/AuthContext'
const UserDetailsPage = () => {
    const { user_type, userPermissions } = useAuth();

    const {openModal} = useModal();
    const {id} = useParams();
    const [userDetails, setUserDetails] = useState();
    const userDocRef = doc(firestore, "users", id);

    useEffect(() => {
        const fetchUserDetails = async () =>{
            
            try{
                const userSnapshot = await getDoc(userDocRef);
                setUserDetails(userSnapshot.data());
            } catch(error){
                alert(error.message);
            }
        }

        fetchUserDetails();
    }, []);

  return (
    <>
        <div className="content">
            <Sidebar/>
            <div className="main-content">
                <Header title="Users" />
                <div className="content-here">
                    <div className="container w-100">
                        {userDetails &&
                        <div className="flex">
                            <div className="w-100 flex col gap-8">
                                <div className="flex gap-8">
                                    <img src={userDetails.profile_path} alt="" width={80} height={80} style={{objectFit: 'cover'}}/>
                                    <div className="flex col gap-8 main-center">
                                        <span className="subheading-m">User ID: {id}</span>
                                        <span className="body-m">{userDetails.email}</span>
                                        <div className="flex gap-8">
                                            <span className="subheading-m color-minor">{userDetails.user_type.toUpperCase()}</span>
                                            {(user_type == 'admin') ? <button className="button text" onClick={() => openModal("Update User Type", "", <ChangeUserType id={id}/>, "info", <></>)}>Change</button> : <></>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex main-between">
                                    <div className="flex col gap-8 flex-1">
                                        <span className="subheading-m color-minor">Full Name</span>
                                        <span className="subheading-m color-minor">Mobile Number</span>
                                        <span className="subheading-m color-minor">Email Address</span>
                                        <span className="subheading-m color-minor">Address</span>
                                        <span className="subheading-m color-minor">Gender</span>
                                        <span className="subheading-m color-minor">Date of Birth</span>
                                        <span className="subheading-m color-minor">Account Verified</span>
                                        <span className="subheading-m color-minor">Verification Denials</span>
                                        <span className="subheading-m color-minor">Verification ID</span>
                                    </div>
                                    <div className="flex col gap-8 flex-2">
                                        <span className="body-m">{`${userDetails.first_name} ${userDetails.middle_name} ${userDetails.last_name}`}</span>
                                        <span className="body-m">{userDetails.contact_no}</span>
                                        <span className="body-m">{userDetails.email}</span>
                                        <span className="body-m">{`${userDetails.address_house} ${userDetails.address_street}, Tambubong, San Rafael, Bulacan`}</span>
                                        <span className="body-m">{userDetails.gender}</span>
                                        <span className="body-m">{new Date(userDetails.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        <div className="flex gap-8 cross-center">
                                            {(!userDetails.verified) ?
                                            <>
                                                <span className="body-m status error">Not Verified</span>
                                                {(userPermissions['verify_users'] || user_type == 'admin') ? <button className="button text" onClick={() => openModal("Verify User", "", <VerifyUser temporary={userDetails.isTemporary ?? false} verification={userDetails.verified} id={id} image={userDetails.verification_photo ?? ''} proof={userDetails.temporary_proof ?? ''}/>, "info", <></>)}>Verify</button> : <></>}
                                            </> : 
                                            
                                            <>
                                            <span className="body-m status success">Verified</span>
                                            {(userPermissions['verify_users'] || user_type == 'admin') ? <button className="button text" onClick={() => openModal("Verify User", "", <VerifyUser temporary={userDetails.isTemporary ?? false} verification={userDetails.verified} id={id} image={userDetails.verification_photo ?? ''} proof={userDetails.temporary_proof ?? ''}/>, "info", <></>)}>Change</button> : <></>}
                                            </>
                                            }
                                        </div>
                                        <span className='body-m'>{userDetails.denyVerificationCount ?? `0`}</span>
                                        {userDetails.verification_photo ? <Link to={userDetails.verification_photo}><img src={userDetails.verification_photo} alt="" width={400} height={200} style={{objectFit: 'cover'}}/></Link> : <span>Awaiting user to upload their identification once again...</span>}
                                    </div>
                                </div>
                                <span> </span>
                            </div>
                            <div className="w-100 flex gap-8">
                                <div className="flex main-between w-100">
                                    <div className="flex col gap-8 flex-1">
                                        <span className="subheading-m color-minor">Resident Type</span>
                                        {(userDetails.isTemporary != null) ? 
                                        <>
                                        <span className="subheading-m color-minor">Landlord Name</span>
                                        <span className="subheading-m color-minor">Landlord Contact No.</span>
                                        <span className="subheading-m color-minor">Renter Residency Proof</span></>
                                        :
                                        <></>
                                        }
                                    </div>
                                    <div className="flex col gap-8 flex-2">
                                        <span className="body-m">{(userDetails.isTemporary == null) ? `Permanent` : (userDetails.isTemporary) ? `Temporary` : `Permanent`}</span>
                                        {(userDetails.isTemporary != null) ? 
                                        <>
                                        <span className="body-m">{userDetails.landlord_name ?? `No entry`}</span>
                                        <span className="body-m">{userDetails.landlord_contact ?? `No entry`}</span>
                                        {
                                            (userDetails.temporary_proof != null) ?
                                            <Link to={userDetails.temporary_proof}><img src={userDetails.temporary_proof} alt="" width={400} height={200} style={{objectFit: 'cover'}}/></Link> : 
                                            <span>Awaiting user to upload once again...</span>
                                        }
                                        </> :
                                        <></>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        }
                    </div>
                </div>
            </div>
            <Modal />
        </div>
    </>
  )
}

export default UserDetailsPage