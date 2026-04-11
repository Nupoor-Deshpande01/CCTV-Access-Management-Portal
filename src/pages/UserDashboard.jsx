import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';
import ComplaintForm from '../components/ComplaintForm';
import FootageViewer from '../components/FootageViewer';
import StatusBadge from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRequests, setExpandedRequests] = useState({});
    const prevRequestsRef = React.useRef();

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'requests'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let reqs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Alert for status change
            if (prevRequestsRef.current) {
                reqs.forEach(req => {
                    const prevReq = prevRequestsRef.current.find(p => p.id === req.id);
                    if (prevReq && prevReq.status !== req.status) {
                        if (req.status === 'approved') toast.success('Your request was approved!');
                        else if (req.status === 'rejected') toast.error('Your request was rejected.');
                        else toast(`Request status changed to ${req.status}`, { icon: '🔔' });
                    }
                });
            }
            prevRequestsRef.current = reqs;

            // Sort locally to bypass Firestore composite index requirement
            reqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRequests(reqs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching requests:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const toggleExpand = (id) => {
        setExpandedRequests(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getDotColor = (status) => {
        switch(status) {
            case 'pending': return '#F5A623';
            case 'approved': return '#1D9E75';
            case 'rejected': return '#E24B4A';
            default: return 'var(--text-muted)';
        }
    };

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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid var(--border)', paddingLeft: '16px', marginLeft: '8px' }}>
                                    {requests.map(req => (
                                        <div key={req.id} className="request-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '-22px', top: '24px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getDotColor(req.status) }} />
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', cursor: 'pointer', alignItems: 'center' }} onClick={() => toggleExpand(req.id)}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <StatusBadge status={req.status} />
                                                    <strong>{req.type}</strong>
                                                </div>
                                                <div style={{ color: 'var(--text-muted)' }}>
                                                    {expandedRequests[req.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </div>
                                            </div>
                                            
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                                <Clock size={12} /> {req.createdAt ? new Date(req.createdAt).toLocaleDateString() + ' ' + new Date(req.createdAt).toLocaleTimeString() : 'Just now'}
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: expandedRequests[req.id] ? '8px' : '0' }}>{req.description}</p>
    
                                            {expandedRequests[req.id] && (
                                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                                    
                                                    {req.location && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '8px' }}>
                                                            <strong>Location:</strong> {req.location.displayName || `${req.location.lat.toFixed(4)}, ${req.location.lng.toFixed(4)}`}
                                                        </div>
                                                    )}
                                                    
                                                    {req.extraDetails && Object.keys(req.extraDetails).length > 0 && (
                                                        <div style={{ fontSize: '0.8rem', padding: '6px', borderRadius: '4px', marginBottom: '8px', background: 'rgba(0,0,0,0.05)' }}>
                                                            {req.extraDetails.name && <div><strong>Name:</strong> {req.extraDetails.name}</div>}
                                                            {req.extraDetails.age && <div><strong>Age:</strong> {req.extraDetails.age}</div>}
                                                            {req.extraDetails.appearance && <div><strong>Appearance:</strong> {req.extraDetails.appearance}</div>}
                                                            {req.extraDetails.itemName && <div><strong>Item:</strong> {req.extraDetails.itemName}</div>}
                                                            {req.extraDetails.features && <div><strong>Features:</strong> {req.extraDetails.features}</div>}
                                                        </div>
                                                    )}
                                                    
                                                    {req.attachments && req.attachments.length > 0 && (
                                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                                            {req.attachments.map((file, idx) => (
                                                                <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'underline' }}>
                                                                    {file.name}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
    
                                                    {req.status === 'approved' && (req.signedUrl || req.footageUrl) && (
                                                        <FootageViewer url={req.signedUrl || req.footageUrl} approvedAt={req.approvedAt} expiresAt={req.expiresAt} />
                                                    )}
                                                    
                                                    {req.status === 'rejected' && req.rejectionReason && (
                                                        <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(226, 75, 74, 0.1)', borderRadius: '4px', borderLeft: '3px solid var(--red)' }}>
                                                            <h4 style={{ color: 'var(--red)', fontSize: '0.85rem', marginTop: 0, marginBottom: '4px' }}>Rejection Reason</h4>
                                                            <p style={{ fontSize: '0.85rem', margin: 0 }}>{req.rejectionReason}</p>
                                                        </div>
                                                    )}
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
