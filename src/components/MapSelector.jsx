import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ setPosition, position }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Selected Location</Popup>
        </Marker>
    );
};

const MapSelector = ({ onLocationSelect, initialPosition = null, mockCameras = [] }) => {
    const defaultCenter = [19.0760, 72.8777]; // Default: Mumbai
    const [position, setPosition] = useState(initialPosition);

    const handleSetPosition = (latlng) => {
        setPosition(latlng);
        if (onLocationSelect) {
            onLocationSelect(latlng);
        }
    };

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker setPosition={handleSetPosition} position={position} />

                {mockCameras.map((cam) => (
                    <Marker
                        key={cam.id}
                        position={[cam.lat, cam.lng]}
                        icon={new L.Icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        })}
                    >
                        <Popup>{cam.name} (CCTV)</Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapSelector;
