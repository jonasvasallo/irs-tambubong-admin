import React, { useState, useEffect, useMemo } from 'react'
import {GoogleMap, HeatmapLayerF, useLoadScript, Marker} from '@react-google-maps/api'


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

    // const exampleData = useMemo(() => {
    //   return [
    //     new google.maps.LatLng(14.974729, 120.942508),
    //     new google.maps.LatLng(14.974329, 120.942008),
    //     new google.maps.LatLng(14.974829, 120.942108),
    //     new google.maps.LatLng(14.974629, 120.942308),
    //     new google.maps.LatLng(14.974529, 120.942408),
    //     new google.maps.LatLng(14.974429, 120.942608),
    //     new google.maps.LatLng(14.974829, 120.942208),
    //     new google.maps.LatLng(14.974229, 120.942308),
    //     new google.maps.LatLng(14.974929, 120.942108),
    //   ]
    // })
    

    // useEffect(() => {
    //   if (data && data.length > 0) {
    //     setHeatmapData(data.map((point) => new google.maps.LatLng(point.lat, point.lng)));
    //     console.log("this happened");
    //   }
    // }, [map]);

    const initHeatMap = () => {
      console.log("called init map");
      if (data && data.length > 0) {
        // setHeatmapData([
        //   new google.maps.LatLng(14.974729, 120.942508),
        //   new google.maps.LatLng(14.974329, 120.942008),
        //   new google.maps.LatLng(14.974829, 120.942108),
        //   new google.maps.LatLng(14.974629, 120.942308),
        //   new google.maps.LatLng(14.974529, 120.942408),
        //   new google.maps.LatLng(14.974429, 120.942608),
        //   new google.maps.LatLng(14.974829, 120.942208),
        //   new google.maps.LatLng(14.974229, 120.942308),
        //   new google.maps.LatLng(14.974929, 120.942108),
        // ]);
        setHeatmapData(data.map((point) => new google.maps.LatLng(point.lat, point.lng)));
        console.log("populated heatmap data");
      }
    }

  useEffect(() => {
    console.log('Heatmap Data:', heatmapData);
  }, [heatmapData]);

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
        onLoad={initHeatMap}
        >
        {heatmapData.length > 0 && (
          <HeatmapLayerF
            data={heatmapData}
            options={{ radius: 30 }} 
            onLoad={() => console.log(heatmapData)}// Add additional options here if necessary
          />
        )}
        </GoogleMap>
    </div>
  )
}

export default ReactHeatmap