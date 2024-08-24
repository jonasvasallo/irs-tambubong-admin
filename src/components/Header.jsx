import React, { useEffect, useState, useContext } from 'react';
import "../styles/header.css";
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from '../config/firebase';
import { IncidentContext } from '../core/IncidentContext';
import { ReportContext } from '../core/ReportContext';
import {Link} from 'react-router-dom'


import alert from "../assets/alarm.m4a";
import ding from "../assets/notification_ding.mp3";
import { useNavigate } from 'react-router-dom';

const Header = (props) => {
  const navigate = useNavigate();
  const initialDocIds = useContext(IncidentContext);
  const reportInitialDocIds = useContext(ReportContext);
  const [loaded, setLoaded] = useState(false);
  const [incidentloaded, setIncidentLoaded] = useState(false);
  const [recentDocId, setRecentDocId] = useState(null);

  const playSound = (type) => {
    const audio = (type == 'emergency') ? new Audio(alert) : new Audio(ding);
    audio.play();
  };

  const showNotification = (type) => {
    if (Notification.permission === 'granted') {
      
      setTimeout(() => {
        new Notification(`${(type == 'emergency') ? 'Incoming emergency request' : 'New incident reported'}`, {
          body: `${(type == 'emergency') ? 'Please check the SOS module' : 'Please check the reports module'}`,
        });
        
      console.log("notification")
      }, 5000);

    }
  };

  //for emergency notification
  useEffect(() => {
    const sosCollection = collection(firestore, 'sos');
    const unsubscribe = onSnapshot(sosCollection, (snapshot) => {
      if (!loaded) {
        setLoaded(true);
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && !initialDocIds.has(change.doc.id)) {
          playSound('emergency');
          showNotification('emergency');
          setRecentDocId(change.doc.id);
        }
      });
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, [loaded, initialDocIds]);

    //for incident report notification
    useEffect(() => {
      const incidentCollection = collection(firestore, 'incidents');
      const unsubscribe = onSnapshot(incidentCollection, (snapshot) => {
        if (!incidentloaded) {
          setIncidentLoaded(true);
          return;
        }
  
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && !reportInitialDocIds.has(change.doc.id)) {
            playSound('report');
            showNotification('report');
          }
        });
      });
  
      // Cleanup the listener on unmount
      return () => unsubscribe();
    }, [incidentloaded, reportInitialDocIds]);

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
          <Link to={`/settings`}><button className='button circular'><span className="material-symbols-outlined">admin_panel_settings</span></button></Link>
        </div>
        
      </div>
      
    </>
  );
};

export default Header;
