import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { firestore } from '../config/firebase';

import { collection, query, where, getDocs } from 'firebase/firestore';

import '../styles/dashboardpage.css';
import LineChart from '../components/charts/LineChart';

const DashboardPage = () => {

  const [incidentList, setIncidentList] = useState([]);
  const [timeRange, setTimeRange] = useState("all");

  const [tagCounts, setTagCounts] = useState([]);

  useEffect(() => {
    console.log("fetching database");
    fetchIncidents(timeRange);

    if (tagCounts.length > 0) {
      setTopTag({'name' : tagCounts[0].tag, 'count' : tagCounts[0].count});
    }
  }, [timeRange]);

  const fetchIncidents = async (range) => {
    const incidentsRef = collection(firestore, 'incidents');
    let q;

    const now = new Date();
    let start, end;

    switch (range) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        q = query(incidentsRef, where('timestamp', '>=', start), where('timestamp', '<=', end));
        break;
      case 'week':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        start = new Date(startOfWeek.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        q = query(incidentsRef, where('timestamp', '>=', start), where('timestamp', '<=', end));
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        q = query(incidentsRef, where('timestamp', '>=', start), where('timestamp', '<=', end));
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        q = query(incidentsRef, where('timestamp', '>=', start), where('timestamp', '<=', end));
        break;
      case 'all':
        q = incidentsRef;
        break;
      default:
        break;
    }

    const snapshot = await getDocs(q);
    const incidents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setIncidentList(incidents);

    calculateTagCounts(incidents);
  };

  const calculateTagCounts = (incidents) => {
    const tagCount = {};
    incidents.forEach(incident => {
      const tag = incident.incident_tag;
      if (tag) {
        if (!tagCount[tag]) {
          tagCount[tag] = 0;
        }
        tagCount[tag]++;
      }
    });

    const sortedTagCounts = Object.keys(tagCount).map(tag => ({
      tag,
      count: tagCount[tag]
    })).sort((a, b) => b.count - a.count);

    setTagCounts(sortedTagCounts);
  };

  return (
    <>
        <div className="content">
            <Sidebar />
            <div className="main-content">
                <Header title="Dashboard"/>
                <div id='dashboard-content' className="w-100 pad-16 flex col gap-16 h-100">
                  <div id='range' className="report-container w-100 flex gap-8">
                    <button className="button outlined" onClick={() => setTimeRange('today')}>Today</button>
                    <button className="button outlined" onClick={() => setTimeRange('week')}>Week</button>
                    <button className="button outlined" onClick={() => setTimeRange('month')}>Month</button>
                    <button className="button outlined" onClick={() => setTimeRange('year')}>Year</button>
                    <button className="button outlined" onClick={() => setTimeRange('all')}>All</button>
                  </div>
                  <div id="summary" className="flex gap-8">
                    <div className="report-container grow-1 flex col gap-8">
                      <span className="body-m color-minor">
                        Reported Incidents
                      </span>
                      <div className="flex main-between">
                        <div className="flex gap-8 main-start cross-center">
                          <span className="heading-l">{incidentList.length}</span>
                          <span className="body-m">reports</span>
                        </div>
                        <div className="chart-section">
                          chart
                        </div>
                      </div>
                      <span className="body-m">-15% from last month</span>
                    </div>
                    <div className="report-container grow-1 flex col gap-8">
                    <span className="body-m color-minor">
                        Trending Incident
                      </span>
                      <div className="flex main-between">
                        <div className="flex gap-8 main-start cross-center">
                          <span className="heading-l">{(tagCounts.length > 0) ? <>{tagCounts[0].tag}</> : <></>}</span>
                          <span className="body-m">{(tagCounts.length > 0) ? <>{tagCounts[0].count}</> : <></>} reports</span>
                        </div>
                        <div className="chart-section">
                          chart
                        </div>
                      </div>
                      <span className="body-m">-15% from last month</span>
                    </div>
                    <div className="report-container grow-1 flex col gap-8">
                      <span className="body-m color-minor">
                        Resident Satisfaction
                      </span>
                      <div className="flex main-between">
                        <div className="flex gap-8 main-start cross-center">
                          <span className="heading-l">4.5</span>
                          <span className="body-m"> Average rating</span>
                        </div>
                        <div className="chart-section">
                          chart
                        </div>
                      </div>
                      <span className="body-m">-15% from last month</span>
                    </div>
                    <div className="report-container grow-1 flex col gap-8">
                      <span className="body-m color-minor">
                        Average Response Time
                      </span>
                      <div className="flex main-between">
                        <div className="flex gap-8 main-start cross-center">
                          <span className="heading-l">15 minutes</span>
                          <span className="body-m">from 69,123 incidents</span>
                        </div>
                        <div className="chart-section">
                          chart
                        </div>
                      </div>
                      <span className="body-m">-15% from last month</span>
                    </div>
                  </div>
                  <div className="flex gap-8" style={{minHeight: '300px'}}>
                    <div className="report-container grow-3">
                      <span className="body-l">
                        Incident Heat Map
                      </span>
                    </div>
                    <div className="report-container grow-1">
                      <span className="body-l">Trending Incidents</span>
                      {tagCounts.map(({ tag, count }, index) => (
                        <div key={tag} className="flex gap-8 main-start cross-center">
                          <span className="heading-l">{index + 1}. {tag}</span>
                          <span className="body-m">{count} reports</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="report-container grow-1">
                      <span className="body-l">Incidents Graph</span>
                      
                    </div>
                    <div className="report-container grow-1">
                      <span className="body-l">Satisfactory Levels</span>
                    </div>
                    <div className="report-container grow-1">
                      <span className="body-l">Tanod Ranking</span>
                    </div>
                  </div>

                </div>
            </div>
        </div>
    </>
  )
}

export default DashboardPage