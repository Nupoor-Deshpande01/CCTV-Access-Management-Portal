import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';
import { useData } from '../context/DataContext';
import { Users, Video, FileText } from 'lucide-react';

const AdminDashboard = () => {
    const { cameras, requests } = useData();

    // Mock users
    const usersCount = 124;
    const ownersCount = 15;

    return (
        <>
            <Navbar />
            <div className="container u-mt-4">
                <h2 className="u-mb-4">Admin Console</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <Card>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ padding: '12px', background: '#EFF6FF', borderRadius: '50%', color: '#2563EB' }}><Users /></div>
                            <div>
                                <h3 style={{ margin: 0 }}>{usersCount}</h3>
                                <p className="text-muted">Registered Citizens</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ padding: '12px', background: '#F0FDF4', borderRadius: '50%', color: '#16A34A' }}><Video /></div>
                            <div>
                                <h3 style={{ margin: 0 }}>{cameras.length}</h3>
                                <p className="text-muted">Registered Cameras</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ padding: '12px', background: '#FEF2F2', borderRadius: '50%', color: '#DC2626' }}><FileText /></div>
                            <div>
                                <h3 style={{ margin: 0 }}>{requests.length}</h3>
                                <p className="text-muted">Total Requests</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card title="System Logs & Requests">
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '12px' }}>ID</th>
                                    <th style={{ padding: '12px' }}>Type</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px' }}>Reason</th>
                                    <th style={{ padding: '12px' }}>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(req => (
                                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>{req.id}</td>
                                        <td style={{ padding: '12px' }}>Footage Request</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '999px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                backgroundColor: req.status === 'approved' ? '#DCFCE7' : req.status === 'pending' ? '#EFF6FF' : '#FEE2E2',
                                                color: req.status === 'approved' ? '#166534' : req.status === 'pending' ? '#1E40AF' : '#991B1B'
                                            }}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>{req.reason}</td>
                                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{new Date(req.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </>
    );
};

export default AdminDashboard;
