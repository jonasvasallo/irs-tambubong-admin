import React, { useState, useEffect } from 'react';
import { firestore } from '../config/firebase';
import { doc, collection, getDocs, updateDoc } from 'firebase/firestore';


const ChangeUserType = (props) => {
  const [userType, setUserType] = useState("");
  const [moderatorRole, setModeratorRole] = useState("");
  const [rolesList, setRolesList] = useState([]);

  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState("");

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
    setModeratorRole("");
  };

  const handleRoleChange = (e) => {
    setModeratorRole(e.target.value);
  };

  useEffect(() => {
    const fetchModeratorRoles = async () => {
      try{
        const collectionRef = collection(firestore, "moderator_roles");
        const snapshot = await getDocs(collectionRef);
        const roles = snapshot.docs.map((doc) => ({
          id: doc.id,
          role_name: doc.data().role_name,
        }))
        setRolesList(roles);
      } catch(error){
        setErrorMsg(error);
      }
    }

    fetchModeratorRoles();
  }, []);

  const selectRole = async () => {
    setErrorMsg("");
    setSuccess("");

    if(userType == ""){
      setErrorMsg("Please select a user type first!");
      return;
    }

    if(userType == "moderator" && moderatorRole == ""){
      setErrorMsg('Please select a moderator role!');
      return;
    } else{

      try{
        if(userType != "moderator"){
          await updateDoc(doc(firestore, "users", props.id), {
            'user_type' : userType.trim(),
          })
          setSuccess(`Successfully updated user type to ${userType.toUpperCase()}`);
          window.location.reload();
          return;
        }
  
        await updateDoc(doc(firestore, "users", props.id), {
          'user_type' : userType.trim(),
          'moderator_role' : moderatorRole.trim(),
        })
        setSuccess(`Successfully updated user type to ${userType.toUpperCase()} with role ${moderatorRole.toUpperCase()}`);
        window.location.reload();
      } catch(error){
        setErrorMsg(error.message);
      }
      
    }
  };

  return (
    <div className='flex col gap-8'>
      <select
        name="userType"
        id="userType"
        className="dropdown"
        value={userType}
        onChange={handleUserTypeChange}
      >
        <option value="" disabled>Select a tag</option>
        <option value="tanod">Tanod</option>
        <option value="resident">Resident</option>
        <option value="moderator">Moderator</option>
      </select>

      {/* Conditional rendering for moderator role selection */}
      {userType === "moderator" && (
        <select
          name="moderatorRole"
          id="moderatorRole"
          className="dropdown"
          value={moderatorRole}
          onChange={handleRoleChange}
        >
          <option value="" disabled>Select moderator role</option>
          {rolesList.map((role) => (
            <option key={role.id} value={role.id}>{role.role_name}</option>
          ))}
        </select>
      )}
      <div>
        {success && <span className='status success'>{success}</span>}
        {errorMsg && <span className='status error'>{errorMsg}</span>}
      </div>
      <button className="button filled" onClick={()=>selectRole()}>Update</button>
    </div>
  );
};

export default ChangeUserType;
