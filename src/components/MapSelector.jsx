import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Search, X, Loader } from 'lucide-react';

// ─── Script Loader ────────────────────────────────────────────────────────────
const useGoogleMaps = (apiKey) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
            setLoaded(true);
            return;
        }

        const existingScript = document.getElementById('google-maps-script');
        if (existingScript) {
            const handleLoad = () => setLoaded(true);
            existingScript.addEventListener('load', handleLoad);
            if (window.google && window.google.maps) setLoaded(true);
            return () => existingScript.removeEventListener('load', handleLoad);
        }

        const script = document.createElement('script');
        script.id = 'google-maps-script';
        // Load with Places library for autocomplete + POI search
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey || ''}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.addEventListener('load', () => setLoaded(true));
        script.addEventListener('error', (e) => setError(e));

        document.head.appendChild(script);

        return () => {};
    }, [apiKey]);

    return { loaded, error };
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MapSelector = ({ onLocationSelect, initialPosition = null, center = null, mockCameras = [] }) => {
    const mapRef = useRef(null);
    const googleMapRef = useRef(null);
    const markerRef = useRef(null);
    const cameraMarkersRef = useRef([]);
    const autocompleteServiceRef = useRef(null);
    const geocoderRef = useRef(null);

    const [selectedPos, setSelectedPos] = useState(initialPosition);
    const [selectedName, setSelectedName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchDebounceRef = useRef(null);
    const searchWrapperRef = useRef(null);

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    const { loaded, error } = useGoogleMaps(apiKey);

    const defaultCenter = { lat: 19.0760, lng: 72.8777 };

    const getInitialCenter = () => {
        if (center && typeof center[0] === 'number') return { lat: center[0], lng: center[1] };
        if (center && typeof center.lat === 'number') return center;
        if (initialPosition && typeof initialPosition.lat === 'number') return initialPosition;
        if (initialPosition && typeof initialPosition[0] === 'number') return { lat: initialPosition[0], lng: initialPosition[1] };
        return defaultCenter;
    };

    // ── Place a pin ──────────────────────────────────────────────────────────
    const placeMarker = useCallback((posObj, map) => {
        if (!window.google) return;
        if (markerRef.current) {
            markerRef.current.setPosition(posObj);
        } else {
            const marker = new window.google.maps.Marker({
                position: posObj,
                map: map || googleMapRef.current,
                draggable: true,
                title: 'Selected Location',
                animation: window.google.maps.Animation.DROP,
                icon: {
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new window.google.maps.Size(40, 40),
                }
            });
            marker.addListener('dragend', () => {
                const p = marker.getPosition();
                const newPos = { lat: p.lat(), lng: p.lng() };
                setSelectedPos(newPos);
                if (onLocationSelect) onLocationSelect(newPos);
                reverseGeocode(newPos);
            });
            markerRef.current = marker;
        }
    }, [onLocationSelect]);

    // ── Reverse geocode to get address name ──────────────────────────────────
    const reverseGeocode = (posObj) => {
        if (!geocoderRef.current) return;
        geocoderRef.current.geocode({ location: posObj }, (results, status) => {
            if (status === 'OK' && results[0]) {
                setSelectedName(results[0].formatted_address);
            }
        });
    };

    // ── Initialize map ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!loaded || !mapRef.current) return;
        if (googleMapRef.current) return; // already initialized

        const initialCenter = getInitialCenter();
        const map = new window.google.maps.Map(mapRef.current, {
            center: initialCenter,
            zoom: 15,
            // NO custom styles → use default Google Maps light theme with full POI details
            mapTypeId: 'roadmap',
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: true,
            rotateControl: false,
            fullscreenControl: true,
        });

        googleMapRef.current = map;
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        geocoderRef.current = new window.google.maps.Geocoder();

        // Click to pin
        map.addListener('click', (e) => {
            const clickedPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            placeMarker(clickedPos, map);
            setSelectedPos(clickedPos);
            if (onLocationSelect) onLocationSelect(clickedPos);
            reverseGeocode(clickedPos);
        });

        // If initial position exists, place pin immediately
        if (initialPosition) {
            let posObj;
            if (typeof initialPosition.lat === 'number') posObj = initialPosition;
            else if (Array.isArray(initialPosition)) posObj = { lat: initialPosition[0], lng: initialPosition[1] };
            if (posObj) placeMarker(posObj, map);
        }

        return () => {
            window.google.maps.event.clearInstanceListeners(map);
        };
    }, [loaded]);

    // ── Pan map when `center` prop changes ───────────────────────────────────
    useEffect(() => {
        if (!googleMapRef.current || !center) return;
        let targetCenter;
        if (Array.isArray(center)) targetCenter = { lat: center[0], lng: center[1] };
        else if (typeof center.lat === 'number') targetCenter = center;
        if (targetCenter) {
            googleMapRef.current.panTo(targetCenter);
            googleMapRef.current.setZoom(16);
        }
    }, [center]);

    // ── Sync selectedPos → marker ─────────────────────────────────────────────
    useEffect(() => {
        if (!loaded || !googleMapRef.current || !selectedPos) return;
        let posObj;
        if (typeof selectedPos.lat === 'number') posObj = selectedPos;
        else if (Array.isArray(selectedPos)) posObj = { lat: selectedPos[0], lng: selectedPos[1] };
        if (posObj) placeMarker(posObj);
    }, [loaded, selectedPos, placeMarker]);

    // ── Sync initialPosition prop ─────────────────────────────────────────────
    useEffect(() => {
        if (initialPosition) setSelectedPos(initialPosition);
    }, [initialPosition]);

    // ── Camera markers ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!loaded || !googleMapRef.current) return;
        cameraMarkersRef.current.forEach(m => m.setMap(null));
        cameraMarkersRef.current = [];
        const map = googleMapRef.current;
        mockCameras.forEach(cam => {
            const marker = new window.google.maps.Marker({
                position: { lat: cam.lat, lng: cam.lng },
                map,
                title: cam.name,
                icon: {
                    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new window.google.maps.Size(32, 32),
                }
            });
            const info = new window.google.maps.InfoWindow({
                content: `<div style="color:#1a1a1a;padding:6px 8px;font-weight:600;font-family:sans-serif;font-size:13px;">📷 ${cam.name}</div>`
            });
            marker.addListener('click', () => info.open(map, marker));
            cameraMarkersRef.current.push(marker);
        });
    }, [loaded, mockCameras]);

    // ── Search / Autocomplete ─────────────────────────────────────────────────
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        setShowDropdown(true);

        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

        if (val.trim().length < 2) {
            setSuggestions([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        searchDebounceRef.current = setTimeout(() => {
            if (!autocompleteServiceRef.current) {
                setIsSearching(false);
                return;
            }

            // Get user's current map center to bias results toward visible area
            const mapCenter = googleMapRef.current ? googleMapRef.current.getCenter() : null;
            const requestOptions = {
                input: val,
                componentRestrictions: { country: 'in' },
                ...(mapCenter ? {
                    location: mapCenter,
                    radius: 50000,  // 50 km bias toward current map view
                } : {})
            };

            autocompleteServiceRef.current.getPlacePredictions(requestOptions, (predictions, status) => {
                setIsSearching(false);
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setSuggestions(predictions);
                } else {
                    setSuggestions([]);
                }
            });
        }, 300);
    };

    const handleSelectSuggestion = (prediction) => {
        setSearchQuery(prediction.description);
        setSuggestions([]);
        setShowDropdown(false);

        if (!geocoderRef.current) return;
        geocoderRef.current.geocode({ placeId: prediction.place_id }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const loc = results[0].geometry.location;
                const posObj = { lat: loc.lat(), lng: loc.lng() };
                setSelectedPos(posObj);
                setSelectedName(prediction.description);

                // Pan + zoom to selection
                if (googleMapRef.current) {
                    googleMapRef.current.panTo(posObj);
                    googleMapRef.current.setZoom(17);
                }
                placeMarker(posObj);
                if (onLocationSelect) onLocationSelect(posObj);
            }
        });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSuggestions([]);
        setShowDropdown(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Render ────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div style={{ height: '420px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', color: '#ef4444', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                ⚠ Error loading Google Maps. Check your API key.
            </div>
        );
    }

    return (
        <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            {/* ── Search Bar ── */}
            <div
                ref={searchWrapperRef}
                style={{
                    position: 'absolute',
                    top: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'calc(100% - 80px)',
                    maxWidth: '480px',
                    zIndex: 20,
                }}
            >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', color: '#64748b', pointerEvents: 'none', zIndex: 1 }} />
                    <input
                        type="text"
                        placeholder="Search for a place, shop, landmark..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                        style={{
                            width: '100%',
                            padding: '10px 36px 10px 36px',
                            borderRadius: showDropdown && suggestions.length > 0 ? '10px 10px 0 0' : '10px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            outline: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            background: '#ffffff',
                            color: '#1e293b',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s',
                        }}
                    />
                    {isSearching && (
                        <Loader size={16} style={{ position: 'absolute', right: searchQuery ? '32px' : '12px', color: '#94a3b8', animation: 'spin 1s linear infinite' }} />
                    )}
                    {searchQuery && !isSearching && (
                        <button
                            onClick={handleClearSearch}
                            style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* ── Suggestions Dropdown ── */}
                {showDropdown && suggestions.length > 0 && (
                    <ul style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderTop: 'none',
                        borderRadius: '0 0 10px 10px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        maxHeight: '280px',
                        overflowY: 'auto',
                    }}>
                        {suggestions.map((pred, idx) => (
                            <li
                                key={pred.place_id}
                                onClick={() => handleSelectSuggestion(pred)}
                                style={{
                                    padding: '10px 14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none',
                                    transition: 'background 0.15s',
                                    color: '#1e293b',
                                    fontSize: '13px',
                                    lineHeight: '1.4',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                            >
                                <MapPin size={15} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <span style={{ fontWeight: '600', display: 'block' }}>
                                        {pred.structured_formatting?.main_text || pred.description.split(',')[0]}
                                    </span>
                                    {pred.structured_formatting?.secondary_text && (
                                        <span style={{ color: '#64748b', fontSize: '12px' }}>
                                            {pred.structured_formatting.secondary_text}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                        <li style={{ padding: '6px 14px', fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9' }}>
                            Powered by
                            <img src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png" alt="Google" style={{ height: '14px' }} />
                        </li>
                    </ul>
                )}
            </div>

            {/* ── Loading Overlay ── */}
            {!loaded && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', zIndex: 10, gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span style={{ color: '#64748b', fontSize: '14px', fontFamily: 'sans-serif' }}>Loading Google Maps…</span>
                </div>
            )}

            {/* ── Map Container ── */}
            <div ref={mapRef} style={{ height: '430px', width: '100%' }} />

            {/* ── Selected Address Footer ── */}
            {selectedName && (
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(8px)',
                    borderTop: '1px solid #e2e8f0',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#475569',
                    zIndex: 10,
                }}>
                    <MapPin size={13} color="#ef4444" style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedName}</span>
                </div>
            )}

            {/* Spinner keyframe */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default MapSelector;
