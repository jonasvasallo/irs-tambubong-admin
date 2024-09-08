import { useEffect, useState } from 'react'
import React from 'react'
import { 
    APIProvider,
    Map,
    AdvancedMarker,
    Pin

} from '@vis.gl/react-google-maps'


const ReactMap = (props) => {

    const [centerLat, setCenterLat] = useState(0);
    const [centerLng, setCenterLng] = useState(0);

    const { positions } = props;

    useEffect(() => {
        console.log("!------------ MAP IS INITIALIZED");
        if (positions && positions.length > 0) {
            setCenterLat(positions[0].lat);
            setCenterLng(positions[0].lng);
        }
    }, [positions]);

  return (
    
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <div className='maps'>
            <Map zoom={17} center={{ lat: centerLat, lng: centerLng }} mapId={import.meta.env.VITE_MAP_ID} disableDefaultUI={true}>
                {positions && positions.map((position, index) =>(
                    <AdvancedMarker key={index} position={position}></AdvancedMarker>
                ))}
            </Map>
        </div>
    </APIProvider>
    
  )
}

export default ReactMap