import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import MapSelector from './MapSelector';
import Button from './common/Button';
import Input from './common/Input';
import Card from './common/Card';

const CameraForm = ({ onSuccess }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        resolution: '1080p',
        type: 'Outdoor',
        location: null
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.location) {
            alert('Please select a location on the map');
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'cameras'), {
                ownerId: user.uid,
                ownerName: user.name || 'Unknown',
                name: formData.name,
                resolution: formData.resolution,
                type: formData.type,
                location: {
                    lat: formData.location.lat,
                    lng: formData.location.lng
                },
                status: 'active',
                timestamp: serverTimestamp(),
                createdAt: new Date().toISOString()
            });

            setFormData({
                name: '',
                resolution: '1080p',
                type: 'Outdoor',
                location: null
            });

            if (onSuccess) onSuccess();
            alert('Camera registered successfully!');
        } catch (error) {
            console.error('Error registering camera:', error);
            alert('Error: ' + error.message);
        }
        setLoading(false);
    };

    return (
        <Card title="Register New Camera">
            <form onSubmit={handleSubmit}>
                <Input
                    label="Camera Name"
                    placeholder="e.g., Main Entrance Cam"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <div className="input-group">
                    <label className="input-label">Resolution</label>
                    <select
                        className="input-field"
                        value={formData.resolution}
                        onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                    >
                        <option value="720p">720p (HD)</option>
                        <option value="1080p">1080p (FHD)</option>
                        <option value="4K">4K (UHD)</option>
                    </select>
                </div>

                <div className="input-group">
                    <label className="input-label">Camera Type</label>
                    <select
                        className="input-field"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="Outdoor">Outdoor Bullet</option>
                        <option value="Indoor">Indoor Dome</option>
                        <option value="PTZ">PTZ (360°)</option>
                        <option value="Doorbell">Video Doorbell</option>
                    </select>
                </div>

                <div className="u-mb-4">
                    <label className="input-label">Camera Location (Click on Map)</label>
                    <MapSelector
                        onLocationSelect={(loc) => setFormData({ ...formData, location: loc })}
                        initialPosition={formData.location}
                    />
                    {formData.location && (
                        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            Selected: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                        </p>
                    )}
                </div>

                <Button block type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Add Camera'}
                </Button>
            </form>
        </Card>
    );
};

export default CameraForm;
