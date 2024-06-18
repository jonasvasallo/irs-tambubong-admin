import React, {useState, useEffect} from 'react'
import { useModal } from '../../../core/ModalContext'
import Modal from '../../../components/Modal'
import CreateStreetModal from './modals/CreateStreetModal';
import UpdateStreetModal from './modals/UpdateStreetModal';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';

const StreetsSection = () => {
    const {openModal} = useModal();
    const [streetsList, setStreetsList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    useEffect(() => {
        const streetsCollectionRef = collection(firestore, "streets");
        const unsubscribe = onSnapshot(streetsCollectionRef, (snapshot) => {
            const streets = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setStreetsList(streets);
        })

        return () => unsubscribe();
    }, []);
    
    const deleteStreet = async (street_id)=>{
        const streetDocRef = doc(firestore, "streets", street_id);

        try{
            await deleteDoc(streetDocRef);
        } catch(error){
            alert(error.message);
        }
    }

    const filteredStreets = streetsList.filter(street => 
        street.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  return (
    <div className='flex col gap-8'>
        <div className='flex col'>
            <span className="subheading-m color-major">Streets</span>
            <br />
            <span className="body-m color-minor">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ratione aut exercitationem dolore suscipit ab libero impedit magnam vel obcaecati aliquid autem blanditiis, enim sequi. Fugit soluta quidem et deserunt qui!</span>
        </div>
        <div className='flex gap-8'>
            <div className="input-field">
                <input type="text" name="" id="" placeholder='Search Streets' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
            </div>
            <button className="button filled" onClick={()=>openModal("Create Street", "", <CreateStreetModal />, "info", <></>)}>Create</button>
        </div>
        <table>
            <thead>
                <th>Street ID</th>
                <th>Street Name</th>
                <th>Action</th>
            </thead>
            <tbody>
                {filteredStreets.map((street) => (
                    <tr>
                        <td>{street.id}</td>
                        <td>{street.name}</td>
                        <td><button className="button secondary" onClick={() => openModal("Update Street", "", <UpdateStreetModal id={street.id} name={street.name}/>, "info", <></>)}>Edit</button> <button className="button filled error" onClick={() => deleteStreet(street.id)}>Delete</button></td>
                    </tr>
                ))}
            </tbody>
        </table>
        <Modal/>
    </div>
  )
}

export default StreetsSection