import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, or } from 'firebase/firestore';
import { Check, X, Plus, Video } from 'lucide-react';
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
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
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
                                                <strong>{req.type}: {req.description}</strong>
                                            </div>
                                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Date N/A'}
                                            </span>
                                        </div>
                                        {req.userName && <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Requested by: {req.userName}</p>}
                                        {req.location && (
                                            <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                                Location: {req.location.lat.toFixed(4)}, {req.location.lng.toFixed(4)}
                                            </p>
                                        )}
                                        {req.amount && (
                                            <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--green)' }}>
                                                Amount Paid: ₹{req.amount / 100}
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <Button size="sm" onClick={() => handleApproveClick(req.id)} style={{ gap: '4px' }}>
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

                        {approveModalOpen && (
                            <div style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                            }}>
                                <Card title="Provide Footage Link" style={{ width: '400px', margin: '20px' }}>
                                    <p className="u-mb-3 text-muted">Since Firebase Storage is unavailable on your Free plan, please paste an external direct link to the MP4 footage (e.g., from Imgur, Cloudinary, AWS S3, or raw GitHub link).</p>
                                    <div className="input-group u-mb-3">
                                        <Input
                                            label="External Video URL"
                                            placeholder="https://example.com/video.mp4" 
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
                                            {submitting ? `Approving...` : 'Approve Request'}
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
