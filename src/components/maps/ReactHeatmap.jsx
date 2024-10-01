import React, { useState, useEffect } from 'react'
import {GoogleMap, HeatmapLayer, useLoadScript, Marker} from '@react-google-maps/api'


const ReactHeatmap = ({data}) => {
  const libraries = ['visualization'];
    const {isLoaded, loadError} = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    })

    const center = {lat: 14.9704245, lng: 120.9254284};
    const [map, setMap] = useState(null);
    const [heatmapData, setHeatmapData] = useState([

    ]);

    // useEffect(() => {
    //   if (data && data.length > 0) {
    //     setHeatmapData(data.map((point) => new google.maps.LatLng(point.lat, point.lng)));
    //     console.log("this happened");
    //   }
    // }, [map]);

    const initHeatMap = () => {
      console.log("called init map");
      if (data && data.length > 0) {
        setHeatmapData(data.map((point) => new google.maps.LatLng(point.lat, point.lng)));
        console.log("this happened");
      }
    }

      // Log heatmapData when it updates
  // useEffect(() => {
  //   console.log('Heatmap Data:', heatmapData);
  // }, [heatmapData]);

  if(loadError){
    return <div>Error loading maos</div>
  }

  if(!isLoaded){
      return <div>Loading... please wait</div>
  }




  return (
    <div style={{width: '100%', height: '90%'}}>
        <GoogleMap
        mapContainerStyle={{ position: 'relative', width: '100%', height: '100%' }}
        center={center}
        zoom={15}
        onLoad={() => initHeatMap}
        >
        {(map && heatmapData.length > 0)
        ?
        <HeatmapLayer
        data={heatmapData}
        options={{
          radius: 30,
        }}
        />
        :
        <></>
        }
        </GoogleMap>
    </div>
  )
}

export default ReactHeatmap