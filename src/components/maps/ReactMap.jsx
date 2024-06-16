import React from 'react'
import { 
    APIProvider,
    Map,
    AdvancedMarker,
    Pin

} from '@vis.gl/react-google-maps'

const ReactMap = (props) => {
    const position = {lat : props.latitude, lng : props.longitude};
  return (
    
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <div className='maps'>
                <Map zoom={18} center={position} mapId={import.meta.env.VITE_MAP_ID}>
                    <AdvancedMarker position={position}></AdvancedMarker>
                </Map>
            </div>
        </APIProvider>
    
  )
}

export default ReactMap