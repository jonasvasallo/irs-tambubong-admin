import React, {useState} from 'react'
import { firestore } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const SearchModulesField = ({module}) => {
    const [errorMsg, setErrorMsg] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const navigate = useNavigate();
    const handleSearch = async () => {
        setErrorMsg("");
        if(searchValue.length == 0){
            setErrorMsg("Please enter the ID first!");
            return;
        }
        try{
            // Reference to the specific document using the module and searchValue (document ID)
            const docRef = doc(firestore, module, searchValue);

            // Fetch the document from Firestore
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                switch(module){
                    case 'incidents':
                        navigate(`/reports/${searchValue}`);
                        break;
                    case 'incident_groups':
                        navigate(`/incident_group/${searchValue}`);
                        break;
                    case 'sos':
                        navigate(`/emergencies/${searchValue}`);
                        break;
                    case 'complaints':
                        navigate(`/complaints/${searchValue}`);
                        break;
                    case 'help':
                        navigate(`/tickets/${searchValue}`);
                        break;
                    default:
                        setErrorMsg("Module not found");
                        break;
                }
            } else {
                // If no document is found
                setErrorMsg("No matching document found.");
            }
        } catch(err){
            setErrorMsg(`${err}`);
            console.log(err);
        }
    }

  return (
    <div className="div">
        <div className="flex gap-8">
        <div className="input-field">
            <input type="text" name="" id="" placeholder='Search by ID' onChange={(e) => setSearchValue(e.target.value)}/>
            
        </div>
        <button className="button filled" style={{'marginTop' : '8px', 'marginBottom' : '8px'}} onClick={() => handleSearch()}>Search</button>
        </div>
        
        {errorMsg && <span className='status error'>{errorMsg}</span>}
    </div>
  )
}

export default SearchModulesField