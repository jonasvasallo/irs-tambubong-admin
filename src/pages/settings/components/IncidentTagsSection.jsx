import React, { useState, useEffect } from 'react';
import { useModal } from '../../../core/ModalContext';
import Modal from '../../../components/Modal';
import UpdateIncidentTagModal from './modals/UpdateIncidentTagModal';
import CreateIncidentTagModal from './modals/CreateIncidentTagModal';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';

const IncidentTagsSection = () => {
    const [incidentTags, setIncidentTags] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const { openModal } = useModal();

    useEffect(() => {
        const incidentTagsCollectionRef = collection(firestore, "incident_tags");
        const unsubscribe = onSnapshot(incidentTagsCollectionRef, (snapshot) => {
            const tags = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setIncidentTags(tags);
        });

        return () => unsubscribe();
    }, []);

    const deleteTag = async (tag_id) => {
        try {
            const tagDocRef = doc(firestore, "incident_tags", tag_id);
            await deleteDoc(tagDocRef);
        } catch (error) {
            alert(error.message);
        }
    };

    const filteredTags = incidentTags.filter(tag => 
        tag.tag_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='flex col gap-8 overflow-scroll'>
            <div className='flex col'>
                <span className="subheading-m color-major">Incident Tags</span>
                <br />
                <span className="body-m color-minor">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
                    Ratione aut exercitationem dolore suscipit ab libero impedit magnam vel obcaecati aliquid 
                    autem blanditiis, enim sequi. Fugit soluta quidem et deserunt qui!
                </span>
            </div>
            <div className='flex gap-8'>
                <div className="input-field">
                    <input 
                        type="text" 
                        placeholder='Search Tags' 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button 
                    className="button filled" 
                    onClick={() => openModal("Create Incident Tag", "", <CreateIncidentTagModal />, "info", <></>)}
                >
                    Create
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Tag ID</th>
                        <th>Tag Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTags.map((tag) => (
                        <tr key={tag.id}>
                            <td>{tag.id}</td>
                            <td>{tag.tag_name}</td>
                            <td>
                                <button 
                                    className="button secondary" 
                                    onClick={() => openModal("Update Incident Tag", "", <UpdateIncidentTagModal id={tag.id} name={tag.tag_name} />, "info", <></>)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="button filled error" 
                                    onClick={() => deleteTag(tag.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal />
        </div>
    );
};

export default IncidentTagsSection;
