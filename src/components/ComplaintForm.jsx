import React, { useState } from 'react';
import { db, storage, auth } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Clock, Search, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import MapSelector from './MapSelector';
import Button from './common/Button';
import Input from './common/Input';
import Card from './common/Card';

const ComplaintForm = ({ onSuccess }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Theft',
        description: '',
        location: null,
        startTime: '',
        endTime: '',
        targetEmail: ''
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedSearchResult, setSelectedSearchResult] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [completeness, setCompleteness] = useState(0);

    // New state for detailed inputs
    const [extraDetails, setExtraDetails] = useState({});
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState('');

    const mockCameras = [
        { id: 'c1', name: 'Main St Cam', lat: 19.0760, lng: 72.8777 },
        { id: 'c2', name: 'Station Cam', lat: 19.0800, lng: 72.8800 },
        { id: 'c3', name: 'Park Cam', lat: 19.0700, lng: 72.8700 },
    ];

    React.useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Calculate form completeness
    React.useEffect(() => {
        let score = 0;
        if (formData.type) score += 10;
        if (formData.location) score += 30;
        if (formData.description && formData.description.length > 10) score += 20;
        if (formData.startTime && formData.endTime) score += 20;
        if (files.length > 0) score += 20;
        setCompleteness(Math.min(score, 100));
    }, [formData, files]);

    React.useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 2) {
                setIsSearching(true);
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&countrycodes=in&limit=5`);
                    const data = await response.json();
                    setSearchResults(data);
                } catch (error) {
                    console.error("Search error:", error);
                }
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSelectResult = (result) => {
        const newLoc = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        setMapCenter([newLoc.lat, newLoc.lng]);
        setSelectedSearchResult({ ...newLoc, displayName: result.display_name });
        setSearchResults([]);
        setSearchQuery(result.display_name);
    };

    const handleAcceptLocation = () => {
        if (selectedSearchResult) {
            setFormData(prev => ({ ...prev, location: selectedSearchResult }));
            toast.success("Location accepted!");
        } else {
            toast.error("Please select a valid location from the search or map");
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!auth.currentUser) {
            toast.error('You must be logged in to submit a complaint.');
            return;
        }

        if (!formData.location) {
            toast.error('Please select a location on the map');
            return;
        }

        if (formData.startTime && formData.endTime && new Date(formData.startTime) >= new Date(formData.endTime)) {
            toast.error('End time must be after start time');
            return;
        }

        try {
            setLoading(true);

            // Save complaint to Firestore bypassing payment
            await addDoc(collection(db, "requests"), {
              type: formData.type,
              description: formData.description,
              location: formData.location,
              incidentDate: formData.startTime || null,
              citizenId: auth.currentUser.uid,
              citizenName: auth.currentUser.displayName || "Citizen",
              citizenEmail: auth.currentUser.email,
              status: "pending",
              paymentStatus: "skipped", // Or remove entirely
              createdAt: serverTimestamp(),
              footageUrl: null,
              approvedAt: null,
              rejectionReason: null,
            });
            
            toast.success("Complaint registered successfully!");
            
            // Reset form
            setFormData({ type: 'Theft', description: '', location: null, startTime: '', endTime: '', targetEmail: '' });
            if (onSuccess) onSuccess();

        } catch (err) {
            console.error("Full error:", err);
            toast.error(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Register New Complaint">
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="input-label">Incident Type</label>
                    <select
                        className="input-field"
                        value={formData.type}
                        onChange={(e) => {
                            setFormData({ ...formData, type: e.target.value });
                            setExtraDetails({}); // Reset extra details on type change
                        }}
                    >
                        <option value="Theft">Theft</option>
                        <option value="Lost Item">Lost Item</option>
                        <option value="Missing Person">Missing Person</option>
                        <option value="Accident">Accident</option>
                        <option value="Harassment">Harassment</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Conditional Fields based on Type */}
                {(formData.type === 'Missing Person') && (
                    <div className="u-mb-3" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Missing Person Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <Input
                                label="Name"
                                placeholder="Full Name"
                                value={extraDetails.name || ''}
                                onChange={(e) => setExtraDetails({ ...extraDetails, name: e.target.value })}
                            />
                            <Input
                                label="Age"
                                placeholder="Age"
                                type="number"
                                value={extraDetails.age || ''}
                                onChange={(e) => setExtraDetails({ ...extraDetails, age: e.target.value })}
                            />
                        </div>
                        <Input
                            label="Last Seen Wearing/Appearance"
                            placeholder="e.g., Blue shirt, 5'10 height"
                            value={extraDetails.appearance || ''}
                            onChange={(e) => setExtraDetails({ ...extraDetails, appearance: e.target.value })}
                        />
                    </div>
                )}

                {(formData.type === 'Theft' || formData.type === 'Lost Item') && (
                    <div className="u-mb-3" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Item Details</h4>
                        <Input
                            label="Item Name/Model"
                            placeholder="e.g., iPhone 14 Pro, Black Leather Wallet"
                            value={extraDetails.itemName || ''}
                            onChange={(e) => setExtraDetails({ ...extraDetails, itemName: e.target.value })}
                        />
                        <Input
                            label="Distinguishing Features"
                            placeholder="e.g., Red case, scratch on back"
                            value={extraDetails.features || ''}
                            onChange={(e) => setExtraDetails({ ...extraDetails, features: e.target.value })}
                        />
                    </div>
                )}

                <div className="u-mb-3">
                    <Input
                        label="Target Shop/Mall Email (Optional)"
                        placeholder="e.g., security@phoenixmall.com"
                        type="email"
                        value={formData.targetEmail}
                        onChange={(e) => setFormData({ ...formData, targetEmail: e.target.value })}
                    />
                    <small className="text-muted" style={{ display: 'block', marginTop: '4px' }}>Send this request directly to a specific shop/mall owner.</small>
                </div>

                <Input
                    label="Description (More Details)"
                    placeholder="Describe the incident..."
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                <div className="u-mb-3">
                    <label className="input-label">Upload Evidence/Images</label>
                    <input
                        type="file"
                        multiple
                        className="input-field"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                    />
                    <small className="text-muted">Max 3 files (Images/Video)</small>
                </div>

                <div className="u-mb-4">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label className="input-label" style={{ margin: 0 }}>Incident Location</label>
                        <span style={{ fontSize: '0.75rem', color: formData.location ? 'var(--green)' : 'var(--text-muted)' }}>
                            {formData.location ? 'Location Selected' : 'Required'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Search area, landmark..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingRight: '35px' }}
                            />
                            <Search
                                size={16}
                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                            />
                            {isSearching && <span style={{ position: 'absolute', right: '35px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>...</span>}
                            {searchResults.length > 0 && (
                                <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto', listStyle: 'none', padding: 0, margin: 0 }}>
                                    {searchResults.map(res => (
                                        <li key={res.place_id} onClick={() => handleSelectResult(res)} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '0.85rem' }}>
                                            {res.display_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <Button type="button" onClick={handleAcceptLocation} style={{ width: 'auto' }}>Accept</Button>
                    </div>

                    <MapSelector
                        onLocationSelect={(loc) => setSelectedSearchResult({ ...loc, displayName: 'Selected on map' })}
                        initialPosition={selectedSearchResult || formData.location}
                        center={mapCenter}
                        mockCameras={mockCameras}
                    />
                    {formData.location ? (
                        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} color="var(--accent)" />
                            Selected: {formData.location.lat.toFixed(5)}, {formData.location.lng.toFixed(5)}
                            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontStyle: 'italic' }}>Drag pin to adjust</span>
                        </p>
                    ) : (
                        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--accent)' }}>
                            <AlertCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            Search or click on map to pin location
                        </p>
                    )}
                </div>

                <div className="u-mb-4">
                    <label className="input-label">Time of Incident (Approximate Range)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>Start Time</span>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <input
                                    type="datetime-local"
                                    className="input-field"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>End Time</span>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <input
                                    type="datetime-local"
                                    className="input-field"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Completeness Indicator */}
                <div className="u-mb-4" style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                        <span>Request Completeness</span>
                        <span style={{ fontWeight: 'bold', color: completeness === 100 ? 'var(--green)' : 'var(--accent)' }}>{completeness}%</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${completeness}%`, background: completeness === 100 ? 'var(--green)' : 'var(--accent)', transition: 'width 0.3s ease' }}></div>
                    </div>
                    {completeness < 100 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Add more details for faster processing.</p>}
                </div>

                <Button block type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Register Complaint'}
                </Button>
            </form>
        </Card>
    );
};

export default ComplaintForm;
