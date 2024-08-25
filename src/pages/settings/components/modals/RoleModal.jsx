import React, { useState } from 'react';
import { addDoc, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../../../../config/firebase';
import { useModal } from '../../../../core/ModalContext';

const RoleModal = (props) => {
  const { closeModal } = useModal();

  const [roleName, setRoleName] = useState(props.name || "");
  const [permissions, setPermissions] = useState({
    view_incidents: props.permissions?.view_incidents || false,
    manage_incidents: props.permissions?.manage_incidents || false,
    view_emergencies: props.permissions?.view_emergencies || false,
    manage_emergencies: props.permissions?.manage_emergencies || false,
    view_complaints: props.permissions?.view_complaints || false,
    manage_complaints: props.permissions?.manage_complaints || false,
    view_news: props.permissions?.view_news || false,
    manage_news: props.permissions?.manage_news || false,
    view_users: props.permissions?.view_users || false,
    ban_users: props.permissions?.ban_users || false,
    verify_users: props.permissions?.verify_users || false,
    view_tickets: props.permissions?.view_tickets || false,
    manage_tickets: props.permissions?.manage_tickets || false,
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleInputChange = (e) => {
    const { id, checked } = e.target;
    setPermissions(prevPermissions => ({
      ...prevPermissions,
      [id]: checked,
    }));
  };

  const createRole = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!roleName) {
      setErrorMsg("Role name cannot be empty!");
      return;
    }

    const selectedPermissions = Object.values(permissions);
    if (!selectedPermissions.includes(true)) {
      setErrorMsg("Please select at least one permission!");
      return;
    }

    const rolesCollectionRef = collection(firestore, "moderator_roles");
    
    try {
      // Check if role name already exists
      const q = query(rolesCollectionRef, where("role_name", "==", roleName.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty && !props.id) {
        setErrorMsg("Role name already exists!");
        return;
      }

      if (props.id) {
        const roleDocRef = doc(firestore, "moderator_roles", props.id);
        await updateDoc(roleDocRef, {
          role_name: roleName.trim(),
          ...permissions,
        });
        setSuccessMsg("Successfully updated role");
      } else {
        await addDoc(rolesCollectionRef, {
          role_name: roleName.trim(),
          ...permissions,
        });
        setSuccessMsg("Successfully created role");
      }

      setTimeout(() => closeModal(), 2000);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div>
      <div className="input-field">
        <input
          type="text"
          id="role_name"
          placeholder='Role Name'
          required
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
        />
      </div>
      <hr />
      <br />
      <div style={{ marginBottom: '8px' }}>
        <span className="subheading-m">Permissions</span>
      </div>
      {Object.keys(permissions).map(permission => (
        <div key={permission} style={{ marginBottom: '8px' }}>
          <div className="flex main-between">
            <div className="flex-1">
              <span className="body-s">{permission.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
            </div>
            <div className="flex-1">
              <input
                type="checkbox"
                id={permission}
                className='toggle'
                checked={permissions[permission]}
                onChange={handleInputChange}
              />
              <label htmlFor={permission} className='toggle-button'></label>
            </div>
          </div>
        </div>
      ))}
      <div>
        {errorMsg && <span className='status error'>{errorMsg}</span>}
        {successMsg && <span className='status success'>{successMsg}</span>}
      </div>
      <br />
      <button className="button filled" onClick={createRole}>Save</button>
    </div>
  );
};

export default RoleModal;
