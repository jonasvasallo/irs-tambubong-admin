import React, { useEffect, useState, useContext } from 'react';
import "../styles/header.css";
import { collection, onSnapshot } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { IncidentContext } from '../core/IncidentContext';


import alert from "../assets/alarm.m4a";
import { useNavigate } from 'react-router-dom';

const Header = (props) => {
  const navigate = useNavigate();
  const initialDocIds = useContext(IncidentContext);
  const [loaded, setLoaded] = useState(false);
  const [recentDocId, setRecentDocId] = useState(null);

  const playSound = () => {
    const audio = new Audio(alert);
    audio.play();
  };

  const showNotification = (data) => {
    if (Notification.permission === 'granted') {
      new Notification('New Incident Reported', {
        body: `Details: ${data.details}`, // Customize this based on your data structure
        icon: '/path/to/icon.png' // Optional: path to an icon image
      });
    }
  };

  useEffect(() => {
    const sosCollection = collection(firestore, 'sos');
    const unsubscribe = onSnapshot(sosCollection, (snapshot) => {
      if (!loaded) {
        setLoaded(true);
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && !initialDocIds.has(change.doc.id)) {
          playSound();
          showNotification(change.doc.data());
          setRecentDocId(change.doc.id);
        }
      });
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, [loaded, initialDocIds]);

  // Request permission for browser notifications on component mount
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          showNotification();
        }
      });
    }
  }, []);

  return (
    <>
      <div className='header'>
        <span className='header-title heading-m color-major'>{props.title}</span>
        {recentDocId && (
        <div className='recent-doc status error'>
          <span>New Report ID: {recentDocId}</span>
          <button className="button filled" onClick={() => navigate(`/emergencies/${recentDocId}`)}>Check</button>
        </div>
      )}
        <div className="actions">
            <button onClick={playSound}>Play Sound</button>
            <button onClick={showNotification}>Action 2</button>
        </div>
        
      </div>
      
    </>
  );
};

export default Header;
