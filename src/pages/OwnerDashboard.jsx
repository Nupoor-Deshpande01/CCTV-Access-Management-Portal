import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, or } from 'firebase/firestore';
import { X, Plus, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import CameraForm from '../components/CameraForm';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cameras, setCameras] = useState([]);
    const [showCameraForm, setShowCameraForm] = useState(false);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [externalLink, setExternalLink] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const isFirstLoad = React.useRef(true);

    useEffect(() => {
        if (!user) return;

        // Fetch Requests Directed to this Owner
        const qRequests = query(
            collection(db, 'requests'),
            or(
                where('ownerId', '==', user.uid),
                where('targetEmail', '==', user.email)
            )
        );

        const unsubRequests = onSnapshot(qRequests, (snapshot) => {
            if (!isFirstLoad.current) {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added' && change.doc.data().status === 'pending') {
                        toast('New footage request received!', { icon: '🔔' });
                    }
                });
            } else {
                isFirstLoad.current = false;
            }

            let reqs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(req => req.status === 'pending')
            .sort((a, b) => {
                const toDate = (ts) => {
                    if (!ts) return new Date(0);
                    if (ts.toDate) return ts.toDate();
                    return new Date(ts);
                };
                return toDate(b.createdAt) - toDate(a.createdAt);
            });
            
            setRequests(reqs);
            setLoading(false);
        });

        // Fetch My Cameras
        const qCameras = query(
            collection(db, 'cameras'),
            where('ownerId', '==', user.uid)
        );

        const unsubCameras = onSnapshot(qCameras, (snapshot) => {
            let cams = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Sort locally to bypass Firestore composite index requirement
            cams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setCameras(cams);
        });

        return () => {
            unsubRequests();
            unsubCameras();
        };
    }, [user]);

    const handleApproveClick = (reqId) => {
        setSelectedRequestId(reqId);
        setApproveModalOpen(true);
    };

    const handleLinkSubmit = async (requestId) => {
        if (!externalLink || externalLink.trim() === '') {
            toast.error("Please enter a valid video link");
            return;
        }
        setSubmitting(true);
        try {
            await updateDoc(doc(db, "requests", requestId), {
                footageUrl: externalLink.trim(),
                signedUrl: externalLink.trim(), // Bypass cloud function URL requirement
                status: "approved",
                approvedAt: new Date().toISOString(),
            });

            setSubmitting(false);
            setApproveModalOpen(false);
            setExternalLink('');
            toast.success("Footage link saved and request approved!");
        } catch (err) {
            setSubmitting(false);
            toast.error("Failed to approve request. Contact support.");
            console.error(err);
        }
    };

    const handleReject = async (reqId) => {
        const reason = window.prompt("Please enter a rejection reason:");
        if (reason === null) return; // user cancelled
        try {
            await updateDoc(doc(db, 'requests', reqId), {
                status: 'rejected',
                rejectionReason: reason || 'No reason provided'
            });
            toast.success("Request rejected");
        } catch (error) {
            console.error("Error rejecting request:", error);
            toast.error("Failed to reject request");
        }
    };

    return (
        <>
            <Navbar />
        <div className="container u-mt-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>CCTV Owner Portal</h2>
                {requests.length > 0 && (
                    <span style={{ backgroundColor: 'var(--accent)', color: '#0f1623', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {requests.length} Pending
                    </span>
                )}
            </div>

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
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <StatusBadge status={req.status} />
                                                <strong>{req.type}</strong>
                                            </div>
                                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                {(() => {
                                                    const ts = req.createdAt;
                                                    const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null;
                                                    return d ? d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'Just now';
                                                })()}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 6px 0' }}>{req.description}</p>

                                        {/* Citizen info */}
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                            {req.citizenName && <span>👤 {req.citizenName}</span>}
                                            {req.citizenEmail && <span>✉️ {req.citizenEmail}</span>}
                                        </div>

                                        {/* Location */}
                                        {req.location && (
                                            <p className="text-muted" style={{ fontSize: '0.78rem', marginBottom: '6px' }}>
                                                📍 {req.location.displayName || `${req.location.lat?.toFixed(4)}, ${req.location.lng?.toFixed(4)}`}
                                            </p>
                                        )}

                                        {/* Incident time */}
                                        {req.incidentDate && (
                                            <p className="text-muted" style={{ fontSize: '0.78rem', marginBottom: '6px' }}>
                                                🕒 Incident: {new Date(req.incidentDate).toLocaleString()}
                                                {req.incidentEndTime && ` → ${new Date(req.incidentEndTime).toLocaleString()}`}
                                            </p>
                                        )}

                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                            <Button size="sm" onClick={() => handleApproveClick(req.id)} style={{ gap: '4px' }}>
                                                <Video size={14} /> Upload & Approve
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => handleReject(req.id)} style={{ gap: '4px' }}>
                                                <X size={16} /> Reject
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {approveModalOpen && (
                            <div style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                            }}>
                                <Card title="📹 Upload CCTV Footage" style={{ width: '460px', margin: '20px' }}>
                                    <p className="u-mb-3 text-muted" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                                        Paste a direct link to the relevant CCTV footage video.
                                        You can host the video on <strong>Google Drive</strong>, <strong>Cloudinary</strong>, <strong>Dropbox</strong>, or any direct MP4 URL.
                                    </p>

                                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <strong style={{ color: 'var(--text-primary)' }}>💡 How to get a shareable link:</strong>
                                        <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', lineHeight: '1.8' }}>
                                            <li><strong>Google Drive:</strong> Right-click file → Share → Copy link</li>
                                            <li><strong>Dropbox:</strong> Click Share → Create link</li>
                                            <li><strong>Direct MP4:</strong> Paste any .mp4 URL directly</li>
                                        </ul>
                                    </div>

                                    <div className="input-group u-mb-3">
                                        <Input
                                            label="Video / Footage URL"
                                            placeholder="https://drive.google.com/... or https://example.com/footage.mp4"
                                            value={externalLink}
                                            onChange={(e) => setExternalLink(e.target.value)}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                        <Button variant="secondary" onClick={() => { setApproveModalOpen(false); setExternalLink(''); }} disabled={submitting}>Cancel</Button>
                                        <Button
                                            onClick={() => handleLinkSubmit(selectedRequestId)}
                                            disabled={!externalLink || submitting}
                                        >
                                            {submitting ? 'Approving...' : '✓ Approve & Send Footage'}
                                        </Button>
                                    </div>
                                </Card>
                            </div>
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
                                    <span style={{ color: cam.status === 'active' ? 'var(--green)' : 'var(--accent)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{cam.status}</span>
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
