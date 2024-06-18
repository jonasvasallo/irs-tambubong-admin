import React, { useState, useEffect } from 'react';
import { useModal } from '../../../core/ModalContext';
import Modal from '../../../components/Modal';
import RoleModal from './modals/RoleModal';
import ManageMembersModal from './modals/ManageMembersModal';
import { collection, onSnapshot, getDocs, doc, updateDoc, deleteDoc, writeBatch, deleteField } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';

const RolesSection = () => {
  const { openModal } = useModal();
  const [roles, setRoles] = useState([]);
  const [roleMembers, setRoleMembers] = useState({});

  useEffect(() => {
    // Fetch moderator roles
    const rolesCollectionRef = collection(firestore, "moderator_roles");
    const unsubscribeRoles = onSnapshot(rolesCollectionRef, (snapshot) => {
      const rolesData = snapshot.docs.map(doc => ({
        id: doc.id,
        role_name: doc.data().role_name,
        permissions: {
          view_incidents: doc.data().view_incidents || false,
          manage_incidents: doc.data().manage_incidents || false,
          view_emergencies: doc.data().view_emergencies || false,
          manage_emergencies: doc.data().manage_emergencies || false,
          view_complaints: doc.data().view_complaints || false,
          manage_complaints: doc.data().manage_complaints || false,
          view_news: doc.data().view_news || false,
          manage_news: doc.data().manage_news || false,
          view_users: doc.data().view_users || false,
          ban_users: doc.data().ban_users || false,
          verify_users: doc.data().verify_users || false,
          view_tickets: doc.data().view_tickets || false,
          manage_tickets: doc.data().manage_tickets || false,
        }
      }));
      setRoles(rolesData);
      fetchUsersAndCountRoles(rolesData);
    });

    return () => {
      unsubscribeRoles();
    };
  }, []);

  const fetchUsersAndCountRoles = async (rolesData) => {
    const usersCollectionRef = collection(firestore, "users");
    const querySnapshot = await getDocs(usersCollectionRef);
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const roleMembersCount = {};
    rolesData.forEach(role => {
      const roleId = role.id;
      const members = users.filter(user => user.moderator_role === roleId);
      roleMembersCount[roleId] = members;
    });

    setRoleMembers(roleMembersCount);
  };

  const handleEditRole = (role) => {
    openModal(`Edit Role: ${role.role_name}`, "", <RoleModal id={role.id} name={role.role_name} permissions={role.permissions} />, "info", <></>);
  };

  const handleManageMembers = (role) => {
    openModal(`Manage Members: ${role.role_name}`, "", <ManageMembersModal id={role.id} members={roleMembers[role.id]} />, "info", <></>);
  };

  const handleDeleteRole = async (role) => {
    const members = roleMembers[role.id] || [];
    const batch = writeBatch(firestore);

    try {
      // Revert members back to user_type='resident' and remove the moderator_role field
      for (const member of members) {
        const userDocRef = doc(firestore, "users", member.id);
        batch.update(userDocRef, {
          user_type: 'resident',
          moderator_role: deleteField()
        });
      }

      // Delete the role document from the moderator_roles collection
      const roleDocRef = doc(firestore, "moderator_roles", role.id);
      batch.delete(roleDocRef);

      await batch.commit();
      alert(`Role "${role.role_name}" and its members have been successfully updated and deleted.`);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className='flex col gap-8'>
      <div className='flex col'>
        <span className="subheading-m color-major">Roles</span>
        <br />
        <span className="body-m color-minor">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ratione aut exercitationem dolore suscipit ab libero impedit magnam vel obcaecati aliquid autem blanditiis, enim sequi. Fugit soluta quidem et deserunt qui!</span>
      </div>
      <div className='flex gap-8'>
        <div className="input-field">
          <input type="text" name="" id="" placeholder='Search Roles' />
        </div>
        <button className="button filled" onClick={() => openModal("Create Role", "", <RoleModal />, "info", <></>)}>Create</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Role Name</th>
            <th>Members</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role.id}>
              <td>{role.role_name}</td>
              <td>{roleMembers[role.id] ? roleMembers[role.id].length : 0}</td>
              <td className='flex gap-8' style={{ width: 'fit-content' }}>
                <button className="button secondary" onClick={() => handleEditRole(role)}>Edit</button>
                <button className="button secondary" onClick={() => handleManageMembers(role)}>Manage Members</button>
                <button className="button filled error" onClick={() => handleDeleteRole(role)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal />
    </div>
  );
}

export default RolesSection;
