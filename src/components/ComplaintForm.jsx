import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
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
        location: null
    });

    const mockCameras = [
        { id: 'c1', name: 'Main St Cam', lat: 19.0760, lng: 72.8777 },
        { id: 'c2', name: 'Station Cam', lat: 19.0800, lng: 72.8800 },
        { id: 'c3', name: 'Park Cam', lat: 19.0700, lng: 72.8700 },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.location) {
            alert('Please select a location on the map');
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'requests'), {
                userId: user.uid,
                userName: user.name || 'Anonymous',
                type: formData.type,
                description: formData.description,
                location: {
                    lat: formData.location.lat,
                    lng: formData.location.lng
                },
                status: 'pending',
                timestamp: serverTimestamp(),
                createdAt: new Date().toISOString()
            });

            setFormData({ type: 'Theft', description: '', location: null });
            if (onSuccess) onSuccess();
            alert('Complaint registered successfully!');
        } catch (error) {
            console.error('Error submitting complaint:', error);
            alert('Error: ' + error.message);
        }
        setLoading(false);
    };

    return (
        <Card title="Register New Complaint">
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="input-label">Incident Type</label>
                    <select
                        className="input-field"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="Theft">Theft</option>
                        <option value="Lost Item">Lost Item</option>
                        <option value="Accident">Accident</option>
                        <option value="Harassment">Harassment</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <Input
                    label="Description"
                    placeholder="Describe the incident..."
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                <div className="u-mb-4">
                    <label className="input-label">Incident Location (Click on Map)</label>
                    <MapSelector
                        onLocationSelect={(loc) => setFormData({ ...formData, location: loc })}
                        initialPosition={formData.location}
                        mockCameras={mockCameras}
                    />
                    {formData.location && (
                        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            Selected: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                        </p>
                    )}
                </div>

                <Button block type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Register Complaint'}
                </Button>
            </form>
        </Card>
    );
};

export default ComplaintForm;
