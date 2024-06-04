import React, {useEffect, useState} from 'react'
import { firestore } from '../config/firebase';
import { collection, doc, onSnapshot, getDocs, getDoc } from 'firebase/firestore';

const WitnessContainer = (props) => {
  const [witnessList, setWitnessList] = useState([]);
  const incidentDocRef = doc(firestore, "incidents", props.id);
  const witnessCollectionRef = collection(incidentDocRef, "witnesses");
  
  useEffect(() => {
    const fetchUserDetails = async (userId) => {
      const userDocRef = doc(firestore, "users", userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
              first_name: userData.first_name,
              last_name: userData.last_name,
              contact_no: userData.contact_no,
          };
      } else {
          return null;
      }
  };

  const unsubscribe = onSnapshot(witnessCollectionRef, async (snapshot) => {
    const witnessDataPromises = snapshot.docs.map(async (doc) => {
        const witnessData = doc.data();
        const userData = await fetchUserDetails(witnessData.user_id);
        return {
            ...witnessData,
            id: doc.id,
            userDetails: userData,
        };
    });

    const resolvedWitnessData = await Promise.all(witnessDataPromises);
    setWitnessList(resolvedWitnessData);
}, (error) => {
    window.alert(error);
});

return () => unsubscribe();
  }, []);
  return (
    <div id="witnesses" className="w-100 flex col gap-8">
        <span className="subheading-m color-major">Witnesses</span>
        {witnessList.map((witness) => (
          <div key={witness.id} className="witness-row flex gap-8 cross-center main-between">
            <div className="flex gap-8 cross-center">
                <img src="" alt="" width={40} height={40}/>
                <div className="flex col flex-3">
                  <span className="subheading-m color-major">{`${witness.userDetails.first_name} ${witness.userDetails.last_name}`}</span>
                  <span className="body-m color-minor">{witness.userDetails.contact_no}</span>
                  <span className="body-m color-major">{witness.details}</span>
                </div>
            </div>
            <button onClick={() => window.location.href=`${witness.media_attachment}`}>View</button>
          </div>
        ))}
        
    </div>
  )
}

export default WitnessContainer