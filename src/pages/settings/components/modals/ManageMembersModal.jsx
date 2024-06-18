import { deleteField, doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { firestore } from '../../../../config/firebase';

const ManageMembersModal = (props) => {
  const [initialMembers, setInitialMembers] = useState(props.members);
  const [modifiedMembers, setModifiedMembers] = useState([...props.members]);

  const removeMember = (userId) => {
    setModifiedMembers(modifiedMembers.filter(member => member.id !== userId));
  };

  const saveChanges = async () => {
    const removedMembers = initialMembers.filter(member => 
      !modifiedMembers.some(modified => modified.id === member.id)
    );
    
    for (const member of removedMembers) {
      const userDocRef = doc(firestore, "users", member.id);
      try {
        await updateDoc(userDocRef, {
          user_type: 'resident',
          moderator_role: deleteField(),
        });
        window.location.reload();
      } catch (error) {
        alert(error.message);
      }
    }

    // Update initial members to the modified ones after saving changes
    setInitialMembers(modifiedMembers);
    // Close the modal if necessary
  };

  return (
    <div>
      <div>
        <span className='subheading-m'>Members</span>
      </div>
      <br />
      <hr />
      <br />
      <div style={{ maxHeight: '200px', overflowY: 'scroll' }}>
        {modifiedMembers.map((member) => (
          <div className='flex main-between' key={member.id}>
            <div className="flex gap-8 cross-center">
              <img src={member.profile_path} alt="" width={40} height={40} />
              <span>{`${member.first_name} ${member.last_name}`}</span>
            </div>
            <div>
              <button className="button filled error" onClick={() => removeMember(member.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <button className="button filled" onClick={saveChanges}>Save</button>
    </div>
  );
}

export default ManageMembersModal;
