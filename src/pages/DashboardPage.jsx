import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { firestore } from '../config/firebase';

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

import '../styles/dashboardpage.css';
import LineChart from '../components/charts/LineChart';
import { barChartData, lineChartData } from '../components/charts/FAKE_DATA';
import BarChart from '../components/charts/BarChart';
import moment from 'moment';
import { Link } from 'react-router-dom';
import ReactHeatmap from '../components/maps/ReactHeatmap';

const DashboardPage = () => {
  const [topTag, setTopTag] = useState();
  const [incidentList, setIncidentList] = useState([]);
  const [ratingsList, setRatingsList] = useState([]);
  const [respondersList, setRespondersList] = useState([]);
  const [tanodRankings, setTanodRankings] = useState([]);
  const [averageResponseTime, setAverageResponseTime] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [timeRange, setTimeRange] = useState("today");
  const [heatmapData, setHeatmapData] = useState([]);

  const [tagCounts, setTagCounts] = useState([]);

  useEffect(() => {
    console.log("fetching database");
    fetchIncidents(timeRange);
    fetchRatings(timeRange);

    if (tagCounts.length > 0) {
      setTopTag({'name' : tagCounts[0].tag, 'count' : tagCounts[0].count});
    }
  }, [timeRange]);

  // UseEffect to log heatmapData whenever it changes
useEffect(() => {
  console.log("Updated heatmap data:", heatmapData);
}, [heatmapData]);

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
        const startOfWeek = new Date(now); // Start from current date
        startOfWeek.setDate(now.getDate() - now.getDay()); // Set to the first day of the current week
        start = new Date(startOfWeek.setHours(0, 0, 0, 0)); // Start of the week
        end = new Date(now.setHours(23, 59, 59, 999)); // End of the current day
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



    const incidentsWithResponders = await Promise.all(incidents.map(async incident => {
      const respondersRef = collection(doc(firestore, 'incidents', incident.id), 'responders');
      const respondersSnapshot = await getDocs(respondersRef);
      const responders = respondersSnapshot.docs.map(resDoc => ({
        id: resDoc.id,
        ...resDoc.data()
      }));
      return { ...incident, responders };
    }));

    const incidentsWithCoordinates = incidents
    .filter(incident => incident.coordinates && incident.coordinates.latitude && incident.coordinates.longitude)
    .map(incident => ({
      lat: incident.coordinates.latitude,
      lng: incident.coordinates.longitude
    }));

    console.log("This is coordinates", incidentsWithCoordinates); // Log the filtered coordinates
    setHeatmapData(incidentsWithCoordinates);


    setIncidentList(incidents);

    calculateTagCounts(incidents);
    calculateAverageResponseTime(incidentsWithResponders);
  };
  

  const fetchRatings = async (range) => {
    const ratingsRef = collection(firestore, 'ratings');
    let q;

    const now = new Date();
    let start, end;

    switch (range) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        q = query(ratingsRef, where('timestamp', '>=', start), where('timestamp', '<=', end));
        break;
      case 'week':
        const startOfWeek = new Date(now); // Start from current date
        startOfWeek.setDate(now.getDate() - now.getDay()); // Set to the first day of the current week
        start = new Date(startOfWeek.setHours(0, 0, 0, 0)); // Start of the week
        end = new Date(now.setHours(23, 59, 59, 999)); // End of the current day
        q = query(ratingsRef, where('timestamp', '>=', start), where('timestamp', '<=', end));
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        q = query(ratingsRef, where('timestamp', '>=', start), where('timestamp', '<=', end));
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        q = query(ratingsRef, where('timestamp', '>=', start), where('timestamp', '<=', end));
        break;
      case 'all':
        q = ratingsRef;
        break;
      default:
        break;
    }

    const snapshot = await getDocs(q);
    const ratings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setRatingsList(ratings);
    calculateAverageRating(ratings);
    calculateTanodRankings(ratings);
  };

  const calculateAverageResponseTime = (incidents) => {
    let totalResponseTime = 0;
    let count = 0;

    incidents.forEach(incident => {
      incident.responders.forEach(responder => {
        if (responder.status === "Responded") {
          const start = responder.response_start.toDate();
          const end = responder.response_end.toDate();
          const responseTime = (end - start) / (1000 * 60); // Convert milliseconds to minutes
          totalResponseTime += responseTime;
          count++;
        }
      });
    });

    const avgResponseTime = (count > 0) ? (totalResponseTime / count) : 0;
    setAverageResponseTime(avgResponseTime.toFixed(1));
  };

  const calculateTanodRankings = async (ratings) => {
    const ratingsByTanod = ratings.reduce((acc, rating) => {
      if (acc[rating.tanod_id]) {
        acc[rating.tanod_id].push(rating);
      } else {
        acc[rating.tanod_id] = [rating];
      }
      return acc;
    }, {});

    const tanodRankings = await Promise.all(Object.keys(ratingsByTanod).map(async tanodId => {
      const tanodRatings = ratingsByTanod[tanodId];
      const totalRating = tanodRatings.reduce((acc, rating) => acc + rating.rating, 0);
      const avgRating = (tanodRatings.length > 0) ? (totalRating / tanodRatings.length) : 0;

      const userDoc = await getDoc(doc(firestore, 'users', tanodId));
      const userData = userDoc.data();
      const tanodName = userData ? `${userData.first_name} ${userData.last_name}` : tanodId;

      return { tanodId, avgRating, tanodName };
    }));

    const sortedRankings = tanodRankings.sort((a, b) => b.avgRating - a.avgRating);
    setTanodRankings(sortedRankings);
  };

  const calculateAverageRating = (ratings) => {
    const totalRating = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    const avgRating = (ratings.length > 0) ? (totalRating / ratings.length) : 0;
    setAverageRating(avgRating.toFixed(1));
  };

  const fetchTagName = async (tagId) => {
    const tagDoc = await getDoc(doc(firestore, 'incident_tags', tagId));
    return tagDoc.exists() ? tagDoc.data().tag_name : tagId;
  };

  const calculateTagCounts = async (incidents) => {
    const tagCount = {};
  
    // Count the occurrences of each tag
    for (const incident of incidents) {
      const tag = incident.incident_tag;
      if (tag) {
        if (!tagCount[tag]) {
          tagCount[tag] = 0;
        }
        tagCount[tag]++;
      }
    }
  
    // Convert the tag counts into an array of { tag, count } objects
    const tagCountEntries = await Promise.all(Object.keys(tagCount).map(async tag => ({
      tag: await fetchTagName(tag),
      count: tagCount[tag]
    })));
  
    // Sort the array in descending order by count
    const sortedTagCounts = tagCountEntries.sort((a, b) => b.count - a.count);
  
    // Assign ranks, handling ties
    let lastCount = null;
    let currentRank = 0;
    sortedTagCounts.forEach((tagEntry, index) => {
      console.log("lastCount:", lastCount);
      console.log("rank: ", currentRank);
      if (tagEntry.count !== lastCount) {
        console.log("diff rank");
        currentRank = currentRank + 1;
        lastCount = tagEntry.count;
      }
      tagEntry.rank = currentRank;  // Assign rank to each entry
    });
  
    setTagCounts(sortedTagCounts);
    console.log(sortedTagCounts);
  };
  

  const getTimeUnit = (range) => {
    switch (range) {
      case 'today':
        return 'hour';
      case 'week':
        return 'day';
      case 'month':
        return 'week';
      case 'year':
        return 'month';
      default:
        return 'day'; // Default to 'day' if 'all' or unexpected range
    }
  };

  return (
    <>
        <div className="content">
            <Sidebar />
            <div className="main-content overflow-scroll">
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
                        </div>
                      </div>
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
                        </div>
                      </div>
                    </div>
                    <div className="report-container grow-1 flex col gap-8">
                      <span className="body-m color-minor">
                        Resident Satisfaction
                      </span>
                      <div className="flex main-between">
                        <div className="flex gap-8 main-start cross-center">
                          <span className="heading-l">{averageRating}</span>
                          <span className="body-m"> Average rating</span>
                        </div>
                        <div className="chart-section">
                        </div>
                      </div>
                    </div>
                    <div className="report-container grow-1 flex col gap-8">
                      <span className="body-m color-minor">
                        Average Response Time
                      </span>
                      <div className="flex main-between">
                        <div className="flex gap-8 main-start cross-center">
                          <span className="heading-l">{averageResponseTime} minutes</span>
                          
                        </div>
                        <div className="chart-section">
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="report-container grow-3" style={{minHeight: '250px'}}>
                      <span className="body-l">
                        Incident Heat Map
                      </span>
                      <br />
                      {(heatmapData && heatmapData.length > 0) ? <ReactHeatmap key={`${timeRange}-${heatmapData.length}`} data={heatmapData}/> : <>No data given...</>}
                    </div>
                    <div className="report-container grow-1 flex col gap-8">
                    <span className="body-l">Trending Incidents</span>
                    {
                      tagCounts.map(({ tag, count, rank }, index) => {

                        return (
                          <div key={tag} className="flex gap-8 main-between cross-center">
                            <span className="subheading-s">#{rank} {tag}</span>
                            <span className="body-s">{count} reports</span>
                          </div>
                        );
                      })
                    }
                  </div>

                  </div>
                  <div className="flex gap-8">
                  <div className="report-container grow-1 overflow-scroll" style={{maxWidth: "600px"}}>
                  <div className="flex main-between">
                    <span className="body-l">Incidents</span>
                    <Link className='link' to={'/reports'}>View All</Link>
                  </div>
                  <br />
                  <br />
                  <div className="flex col gap-8">
                    {incidentList
                      .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)  // Sort incidents by timestamp
                      .slice(0, 8)  // Limit to the first 20 incidents
                      .map((incident) => (
                        <div key={incident.id} className='flex gap-16 cross-center'>
                          <span className='subheading-m'>{incident.title}</span>
                          <span>{moment.unix(incident.timestamp.seconds).format('ddd, MMMM D, YYYY [at] h:mm A')}</span>
                          <Link className='link' to={`/reports/${incident.id}`} style={{ marginTop: '0' }}>View</Link>
                        </div>
                      ))}
                  </div>
                </div>

                    <div className="report-container grow-1" style={{maxWidth: "600px"}}>
                      <span className="body-l">Incident Frequency</span>
                      <BarChart data={{ labels: tagCounts.map(tag => tag.tag), data: tagCounts.map(tag => tag.count) }} />
                    </div>
                    <div className="report-container grow-1">
                      <span className="body-l">Tanod Ranking</span>
                      <div className='flex col gap-8'>
                      {tanodRankings.map((tanod, index) => (
                        <div key={tanod.tanodId} className="flex gap-8 main-between cross-center">
                          <div className="flex gap-8">
                            <span>{index + 1}.</span>
                            <span>{tanod.tanodName}</span>
                          </div>
                          <span>{tanod.avgRating.toFixed(1)}</span>
                        </div>
                      ))}
                      </div>
                    </div>
                  </div>

                </div>
            </div>
        </div>
    </>
  )
}

export default DashboardPage