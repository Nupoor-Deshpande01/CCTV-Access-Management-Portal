import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import './Landing.css';
import { Shield, Users, Camera, Lock, Eye, ShieldCheck, FileText, CheckCircle, Search, Home } from 'lucide-react';

const Landing = () => {
    return (
        <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
            <Navbar />
            
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container hero-grid-wrapper">
                    {/* Left Column: Copy & Call to Action */}
                    <div className="hero-left">
                        <div className="trust-badge">
                            <Shield size={13} color="var(--accent)" strokeWidth={2.5} />
                            <span>CIVIC SAFETY NETWORK</span>
                        </div>
                        <h1 className="hero-title">
                            Secure, Ethical CCTV Access for <span>Safer Communities</span>
                        </h1>
                        <p className="hero-subtitle">
                            A privacy-first civic platform that empowers citizens to request surveillance footage for legitimate safety concerns, while giving camera owners full transparency, privacy control, and incentives.
                        </p>
                        <div className="hero-actions">
                            <Link to="/register">
                                <button className="btn-primary">Get Started</button>
                            </Link>
                            <Link to="/login">
                                <button className="btn-outline">Log In</button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Platform Vector Mockup */}
                    <div className="hero-right">
                        <div className="hero-mockup-container">
                            <div className="hero-mockup-window">
                                <div className="mockup-window-header">
                                    <div className="mockup-window-dots">
                                        <div className="mockup-window-dot red"></div>
                                        <div className="mockup-window-dot yellow"></div>
                                        <div className="mockup-window-dot green"></div>
                                    </div>
                                    <div className="mockup-window-address">
                                        portal.cctvaccess.gov.in
                                    </div>
                                </div>
                                <div className="mockup-window-body">
                                    {/* Left: Map Preview */}
                                    <div className="mockup-map-container">
                                        <div className="mockup-map-grid"></div>
                                        <div className="mockup-map-streets">
                                            <div className="mockup-map-street s1"></div>
                                            <div className="mockup-map-street s2"></div>
                                            <div className="mockup-map-street s3"></div>
                                            <div className="mockup-map-street s4"></div>
                                        </div>
                                        {/* Camera Pins */}
                                        <div className="mockup-map-pin p1">
                                            <Camera size={10} strokeWidth={2.5} />
                                        </div>
                                        <div className="mockup-map-pin p2">
                                            <Camera size={10} strokeWidth={2.5} />
                                        </div>
                                        <div className="mockup-map-pin p3">
                                            <Camera size={10} strokeWidth={2.5} />
                                        </div>
                                    </div>

                                    {/* Right: Request Tracker */}
                                    <div className="mockup-status-panel">
                                        <div className="mockup-card-item">
                                            <div className="mockup-card-title">Active Request</div>
                                            <div className="mockup-card-desc">
                                                <span>#REQ-4028</span>
                                                <span className="mockup-badge success">Approved</span>
                                            </div>
                                            <div className="mockup-card-meta">Sector-4 Crossroad</div>
                                        </div>

                                        <div className="mockup-card-item" style={{ backgroundColor: 'transparent', border: 'none', padding: '0 4px' }}>
                                            <div className="mockup-steps">
                                                <div className="mockup-step-node">
                                                    <div className="mockup-step-indicator completed"></div>
                                                    <span className="mockup-step-text completed">Request Lodged</span>
                                                </div>
                                                <div className="mockup-step-node">
                                                    <div className="mockup-step-indicator completed"></div>
                                                    <span className="mockup-step-text completed">Owner Approved</span>
                                                </div>
                                                <div className="mockup-step-node">
                                                    <div className="mockup-step-indicator active"></div>
                                                    <span className="mockup-step-text active">Footage Ready</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="container hero-stats-wrapper">
                    <div className="stats-bar">
                        <div className="stat-cell">
                            <Users size={20} color="var(--accent)" />
                            <div className="stat-number">10k+</div>
                            <div className="stat-label">Active Users</div>
                        </div>
                        <div className="stat-cell">
                            <Camera size={20} color="var(--accent)" />
                            <div className="stat-number">5,000+</div>
                            <div className="stat-label">Cameras</div>
                        </div>
                        <div className="stat-cell">
                            <ShieldCheck size={20} color="var(--accent)" />
                            <div className="stat-number">98%</div>
                            <div className="stat-label">Success Rate</div>
                        </div>
                        <div className="stat-cell" style={{ borderRight: 'none' }}>
                            <Lock size={20} color="var(--accent)" />
                            <div className="stat-number">100%</div>
                            <div className="stat-label">Private</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-heading">Why Choose <span style={{ color: 'var(--accent)' }}>CCTVAccess</span></h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon-box"><Eye size={20} color="var(--accent)" /></div>
                            <h3 className="feature-title">Transparent Requests</h3>
                            <p className="feature-desc">Request footage with a clear reason. Owners approve or deny based on validity.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon-box"><Lock size={20} color="var(--accent)" /></div>
                            <h3 className="feature-title">Privacy First</h3>
                            <p className="feature-desc">Footage is secure. Only approved requests get temporary access links.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon-box"><ShieldCheck size={20} color="var(--accent)" /></div>
                            <h3 className="feature-title">Owner Control</h3>
                            <p className="feature-desc">CCTV owners decide who sees what. Earn reputation and incentives for helping.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="steps-section">
                <div className="container">
                    <h2 className="section-heading">How It Works</h2>
                    <div className="steps-row">
                        <div className="step-item">
                            <div className="step-circle">
                                <FileText size={32} color="#fff" />
                                <div className="step-badge">1</div>
                            </div>
                            <h3 className="step-title">File Request</h3>
                            <p className="step-desc">Submit a detailed request specifying time and location.</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-item">
                            <div className="step-circle">
                                <CheckCircle size={32} color="#fff" />
                                <div className="step-badge">2</div>
                            </div>
                            <h3 className="step-title">Owner Review</h3>
                            <p className="step-desc">CCTV owners review the request and verify validity.</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-item">
                            <div className="step-circle">
                                <Home size={32} color="#fff" />
                                <div className="step-badge">3</div>
                            </div>
                            <h3 className="step-title">Get Access</h3>
                            <p className="step-desc">Once approved, receive secure access to the footage.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* For CCTV Owners Section */}
            <section className="owners-split-section">
                <div className="container split-container">
                    <div className="split-left">
                        <div className="split-label">FOR CCTV OWNERS</div>
                        <h2 className="split-headline">Monetize and Protect Your Community</h2>
                        <p className="split-body">
                            Join our trusted network of CCTV owners. Help citizens find lost items or resolve incidents while maintaining complete control over your data.
                        </p>
                        <div className="split-checklist">
                            <div className="check-item">
                                <div className="check-icon">
                                    <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4l2 2 4-4" stroke="#1D9E75" strokeWidth="1.2" fill="none"/></svg>
                                </div>
                                <span className="check-text">Earn ₹100–300 per approved footage request</span>
                            </div>
                            <div className="check-item">
                                <div className="check-icon">
                                    <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4l2 2 4-4" stroke="#1D9E75" strokeWidth="1.2" fill="none"/></svg>
                                </div>
                                <span className="check-text">Total anonymity and privacy protection</span>
                            </div>
                            <div className="check-item">
                                <div className="check-icon">
                                    <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4l2 2 4-4" stroke="#1D9E75" strokeWidth="1.2" fill="none"/></svg>
                                </div>
                                <span className="check-text">Approve or deny requests at your discretion</span>
                            </div>
                        </div>
                        <Link to="/register">
                            <button className="btn-primary" style={{ marginTop: '24px' }}>Become an Owner</button>
                        </Link>
                    </div>
                    <div className="split-right">
                        <div className="mockup-card">
                            <div className="mockup-header">
                                <div className="mockup-dots">
                                    <div className="dot" style={{ backgroundColor: '#ED6A5E' }}></div>
                                    <div className="dot" style={{ backgroundColor: '#F4BF4F' }}></div>
                                    <div className="dot" style={{ backgroundColor: '#61C554' }}></div>
                                </div>
                                <div className="mockup-search">owner.cctvaccess.com</div>
                            </div>
                            <div className="mockup-body">
                                <div className="mockup-stats">
                                    <div className="m-stat" style={{ backgroundColor: '#0f2d1f', border: '1px solid var(--green)' }}>
                                        <div style={{ color: 'var(--green)', fontSize: '12px' }}>Earnings</div>
                                        <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>₹4,250</div>
                                    </div>
                                    <div className="m-stat" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Requests</div>
                                        <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>12 pending</div>
                                    </div>
                                </div>
                                <div className="mockup-grid">
                                    <div className="m-thumb"></div>
                                    <div className="m-thumb"></div>
                                    <div className="m-thumb"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
