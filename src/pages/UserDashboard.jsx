import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';
import ComplaintForm from '../components/ComplaintForm';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Clock } from 'lucide-react';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'requests'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reqs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRequests(reqs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching requests:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <>
            <Navbar />
            <div className="container dashboard-grid">
                <div className="map-section">
                    <ComplaintForm />
                </div>

                <div className="request-sidebar">
                    <Card title="My Complaints & Requests" style={{ height: '100%', overflowY: 'auto' }}>
                        {loading ? (
                            <p className="text-muted">Loading requests...</p>
                        ) : requests.length === 0 ? (
                            <p className="text-muted">No active requests. Register one to get started.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {requests.map(req => (
                                    <div key={req.id} className="request-item">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <strong>{req.type}</strong>
                                            <span className={`request-status status-${req.status}`}>{req.status}</span>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{req.description}</p>
                                        <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} /> {req.createdAt ? new Date(req.createdAt).toLocaleDateString() + ' ' + new Date(req.createdAt).toLocaleTimeString() : 'Just now'}
                                        </div>
                                        {req.location && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px' }}>
                                                Location: {req.location.lat.toFixed(4)}, {req.location.lng.toFixed(4)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
};

export default UserDashboard;
