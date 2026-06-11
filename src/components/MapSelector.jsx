import React, { useEffect, useRef, useState } from 'react';

// Custom hook to load Google Maps script
const useGoogleMaps = (apiKey) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (window.google && window.google.maps) {
            setLoaded(true);
            return;
        }

        // Check if script already exists
        const existingScript = document.getElementById('google-maps-script');
        if (existingScript) {
            const handleLoad = () => setLoaded(true);
            existingScript.addEventListener('load', handleLoad);
            return () => {
                existingScript.removeEventListener('load', handleLoad);
            };
        }

        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey || ''}`;
        script.async = true;
        script.defer = true;

        const handleScriptLoad = () => {
            setLoaded(true);
        };

        const handleScriptError = (err) => {
            setError(err);
        };

        script.addEventListener('load', handleScriptLoad);
        script.addEventListener('error', handleScriptError);

        document.head.appendChild(script);

        return () => {
            script.removeEventListener('load', handleScriptLoad);
            script.removeEventListener('error', handleScriptError);
        };
    }, [apiKey]);

    return { loaded, error };
};

const darkMapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0f172a" }, { "weight": 2 }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#475569" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "visibility": "off" }] },
    { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#1e293b" }, { "visibility": "on" }] },
    { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
    { "featureType": "administrative.neighborhood", "stylers": [{ "visibility": "off" }] },
    { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
    { "featureType": "road", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#475569" }] },
    { "featureType": "transit", "stylers": [{ "visibility": "off" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#020617" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#334155" }] }
];

const MapSelector = ({ onLocationSelect, initialPosition = null, center = null, mockCameras = [] }) => {
    const mapRef = useRef(null);
    const googleMapInstanceRef = useRef(null);
    const markerInstanceRef = useRef(null);
    const cameraMarkersRef = useRef([]);
    const [selectedPos, setSelectedPos] = useState(initialPosition);

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    const { loaded, error } = useGoogleMaps(apiKey);

    // Default center Mumbai
    const defaultCenter = { lat: 19.0760, lng: 72.8777 };

    const getInitialCenter = () => {
        if (center && typeof center[0] === 'number') {
            return { lat: center[0], lng: center[1] };
        } else if (center && typeof center.lat === 'number') {
            return center;
        }

        if (initialPosition && typeof initialPosition.lat === 'number') {
            return initialPosition;
        } else if (initialPosition && typeof initialPosition[0] === 'number') {
            return { lat: initialPosition[0], lng: initialPosition[1] };
        }

        return defaultCenter;
    };

    // Initialize Map
    useEffect(() => {
        if (!loaded || !mapRef.current) return;

        const initialCenter = getInitialCenter();
        const map = new window.google.maps.Map(mapRef.current, {
            center: initialCenter,
            zoom: 13,
            styles: darkMapStyle,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: true
        });

        googleMapInstanceRef.current = map;

        // Click event on map to select/move location
        map.addListener('click', (e) => {
            const clickedLatLng = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
            };
            handleSetPosition(clickedLatLng);
        });

        return () => {
            if (window.google && window.google.maps && map) {
                window.google.maps.event.clearInstanceListeners(map);
            }
        };
    }, [loaded]);

    // Handle updates to 'center' prop (pan map to center)
    useEffect(() => {
        if (googleMapInstanceRef.current && center) {
            let targetCenter;
            if (typeof center[0] === 'number') {
                targetCenter = { lat: center[0], lng: center[1] };
            } else if (typeof center.lat === 'number') {
                targetCenter = center;
            }
            if (targetCenter) {
                googleMapInstanceRef.current.panTo(targetCenter);
            }
        }
    }, [center]);

    // Synchronize selected position with selector marker
    useEffect(() => {
        if (!loaded || !googleMapInstanceRef.current) return;

        const map = googleMapInstanceRef.current;

        if (selectedPos) {
            let posObj;
            if (typeof selectedPos.lat === 'number') {
                posObj = selectedPos;
            } else if (typeof selectedPos[0] === 'number') {
                posObj = { lat: selectedPos[0], lng: selectedPos[1] };
            }

            if (posObj) {
                if (markerInstanceRef.current) {
                    markerInstanceRef.current.setPosition(posObj);
                } else {
                    const marker = new window.google.maps.Marker({
                        position: posObj,
                        map: map,
                        draggable: true,
                        title: 'Selected Location',
                        animation: window.google.maps.Animation.DROP
                    });

                    // Drag end event for marker
                    marker.addListener('dragend', () => {
                        const pos = marker.getPosition();
                        const newPos = {
                            lat: pos.lat(),
                            lng: pos.lng()
                        };
                        handleSetPosition(newPos);
                    });

                    markerInstanceRef.current = marker;
                }
            }
        } else {
            if (markerInstanceRef.current) {
                markerInstanceRef.current.setMap(null);
                markerInstanceRef.current = null;
            }
        }
    }, [loaded, selectedPos]);

    // Update state from initialPosition prop
    useEffect(() => {
        if (initialPosition) {
            setSelectedPos(initialPosition);
        }
    }, [initialPosition]);

    const handleSetPosition = (latlng) => {
        setSelectedPos(latlng);
        if (onLocationSelect) {
            onLocationSelect(latlng);
        }
    };

    // Render CCTV markers (mockCameras)
    useEffect(() => {
        if (!loaded || !googleMapInstanceRef.current) return;

        // Clear old camera markers
        cameraMarkersRef.current.forEach(m => m.setMap(null));
        cameraMarkersRef.current = [];

        const map = googleMapInstanceRef.current;

        mockCameras.forEach(cam => {
            // Create a custom red icon or standard marker
            const marker = new window.google.maps.Marker({
                position: { lat: cam.lat, lng: cam.lng },
                map: map,
                title: cam.name,
                icon: {
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new window.google.maps.Size(32, 32)
                }
            });

            // Info window for camera popup
            const infoWindow = new window.google.maps.InfoWindow({
                content: `<div style="color: #0f172a; padding: 4px; font-weight: 600; font-family: sans-serif; font-size: 13px;">${cam.name} (CCTV)</div>`
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });

            cameraMarkersRef.current.push(marker);
        });
    }, [loaded, mockCameras]);

    if (error) {
        return (
            <div style={{ height: '400px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-card)', color: 'var(--red)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                Error loading Google Maps.
            </div>
        );
    }

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
            {!loaded && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-card)', zIndex: 10 }}>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>Loading Map...</span>
                </div>
            )}
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        </div>
    );
};

export default MapSelector;
