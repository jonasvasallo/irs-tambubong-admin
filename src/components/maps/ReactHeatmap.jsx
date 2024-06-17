import React, { useState, useEffect } from 'react'
import {GoogleMap, HeatmapLayerF, useJsApiLoader, Marker} from '@react-google-maps/api'


const ReactHeatmap = ({data}) => {
    const {isLoaded} = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries:['maps','visualization']
    })

    const center = {lat: 14.9704245, lng: 120.9254284};
    const [map, setMap] = useState(null);
    const [heatmapData, setHeatmapData] = useState([]);

    useEffect(() => {
      if (data && data.length > 0) {
        setHeatmapData(data.map((point) => new google.maps.LatLng(point.lat, point.lng)));
      }
    }, [data]);

    if(!isLoaded){
        return <div>Loading... please wait</div>
    }


  return (
    <div style={{width: '100%', height: '90%'}}>
        <GoogleMap
        mapContainerStyle={{ position: 'relative', width: '100%', height: '100%' }}
        center={center}
        zoom={15}
        onLoad={(map) => setMap(map)}
        >
        {map && heatmapData.length > 0 && (
          <>
            <HeatmapLayerF
              data={heatmapData}
              options={{
                radius: 30,
              }}
            />
          </>
        )}
        </GoogleMap>
    </div>
  )
}

export default ReactHeatmap