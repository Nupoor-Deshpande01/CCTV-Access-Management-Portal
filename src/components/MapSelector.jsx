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

// Component to programmatically update map center
const MapUpdater = ({ center }) => {
    const map = useMapEvents({});
    React.useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const DraggableMarker = ({ position, setPosition }) => {
    const [draggable, setDraggable] = useState(true);
    const markerRef = React.useRef(null);

    const eventHandlers = React.useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    setPosition(marker.getLatLng());
                }
            },
        }),
        [setPosition],
    );

    // Update internal marker reference if position changes externally
    React.useEffect(() => {
        if (markerRef.current && position) {
            markerRef.current.setLatLng(position);
        }
    }, [position]);


    return position === null ? null : (
        <Marker
            draggable={draggable}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        >
            <Popup>
                <span onClick={() => setDraggable(!draggable)}>
                    {draggable ? 'Marker is draggable' : 'Click to enable drag'}
                </span>
            </Popup>
        </Marker>
    );
};

const MapSelector = ({ onLocationSelect, initialPosition = null, center = null, mockCameras = [] }) => {
    // Default center Mumbai
    const defaultCenter = [19.0760, 72.8777];
    const mapCenter = center || (initialPosition ? [initialPosition.lat, initialPosition.lng] : defaultCenter);
    const [position, setPosition] = useState(initialPosition);

    React.useEffect(() => {
        if (initialPosition) {
            setPosition(initialPosition);
        }
    }, [initialPosition]);

    const handleSetPosition = (latlng) => {
        setPosition(latlng);
        if (onLocationSelect) {
            onLocationSelect(latlng);
        }
    };

    // Handle map clicks to set position
    const LocationClick = () => {
        useMapEvents({
            click(e) {
                handleSetPosition(e.latlng);
            },
        });
        return null;
    };

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
            <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <MapUpdater center={center} />
                <LocationClick />
                <DraggableMarker setPosition={handleSetPosition} position={position} />

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
