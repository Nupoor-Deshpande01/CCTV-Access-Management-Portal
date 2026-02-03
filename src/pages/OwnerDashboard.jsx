import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { Check, X, Plus, Video } from 'lucide-react';
import CameraForm from '../components/CameraForm';
import { useAuth } from '../context/AuthContext';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cameras, setCameras] = useState([]);
    const [showCameraForm, setShowCameraForm] = useState(false);

    useEffect(() => {
        if (!user) return;

        // Fetch Requests (All pending for MVP)
        const qRequests = query(
            collection(db, 'requests'),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );

        const unsubRequests = onSnapshot(qRequests, (snapshot) => {
            const reqs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRequests(reqs);
            setLoading(false);
        });

        // Fetch My Cameras
        const qCameras = query(
            collection(db, 'cameras'),
            where('ownerId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubCameras = onSnapshot(qCameras, (snapshot) => {
            const cams = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCameras(cams);
        });

        return () => {
            unsubRequests();
            unsubCameras();
        };
    }, [user]);

    const handleApprove = async (reqId) => {
        try {
            await updateDoc(doc(db, 'requests', reqId), {
                status: 'approved',
                footageUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4' // Mock footage
            });
        } catch (error) {
            console.error("Error approving request:", error);
            alert("Failed to approve request");
        }
    };

    const handleReject = async (reqId) => {
        try {
            await updateDoc(doc(db, 'requests', reqId), {
                status: 'rejected'
            });
        } catch (error) {
            console.error("Error rejecting request:", error);
            alert("Failed to reject request");
        }
    };

    return (
        <>
            <Navbar />
            <div className="container u-mt-4">
                <h2 className="u-mb-4">CCTV Owner Portal</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                    <Card title="Overview">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p className="text-muted">Pending Requests</p>
                                <h2 className="text-primary">{requests.length}</h2>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p className="text-muted">Active Cameras</p>
                                <h2>{cameras.length}</h2>
                            </div>
                        </div>
                    </Card>

                    <Card title="Incoming Requests">
                        {loading ? (
                            <p className="text-muted">Loading...</p>
                        ) : requests.length === 0 ? (
                            <p className="text-muted">No pending requests.</p>
                        ) : (
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {requests.map(req => (
                                    <li key={req.id} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <strong>{req.type}: {req.description}</strong>
                                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Date N/A'}
                                            </span>
                                        </div>
                                        {req.userName && <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Requested by: {req.userName}</p>}
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <Button size="sm" onClick={() => handleApprove(req.id)} style={{ gap: '4px' }}>
                                                <Check size={16} /> Approve
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => handleReject(req.id)} style={{ gap: '4px' }}>
                                                <X size={16} /> Reject
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '1rem' }}>
                    <h3>My Cameras</h3>
                    <Button onClick={() => setShowCameraForm(!showCameraForm)} style={{ gap: '8px' }}>
                        <Plus size={18} /> {showCameraForm ? 'Cancel Registration' : 'Add New Camera'}
                    </Button>
                </div>

                {showCameraForm && (
                    <div className="u-mb-4">
                        <CameraForm onSuccess={() => setShowCameraForm(false)} />
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {cameras.length === 0 ? (
                        <p className="text-muted">No cameras registered yet.</p>
                    ) : (
                        cameras.map(cam => (
                            <Card key={cam.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <Video size={24} className="text-secondary" />
                                    <span className={`status-badge ${cam.status === 'active' ? 'text-success' : 'text-warning'}`} style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{cam.status}</span>
                                </div>
                                <h4 style={{ marginTop: '1rem' }}>{cam.name}</h4>
                                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Type: {cam.type} | Res: {cam.resolution}</p>
                                {cam.location && (
                                    <p className="text-muted" style={{ fontSize: '0.7rem' }}>Lat: {cam.location.lat.toFixed(4)}</p>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default OwnerDashboard;
