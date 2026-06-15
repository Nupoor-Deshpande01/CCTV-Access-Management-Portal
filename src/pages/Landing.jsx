import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import './Landing.css';
import { Shield, Users, Camera, Lock, Eye, ShieldCheck, FileText, CheckCircle, Search, Home, MapPin, Zap, Server, Globe, Clock } from 'lucide-react';

const Landing = () => {
    return (
        <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
            <Navbar />
            
            {/* Hero Section */}
            <section className="hero-section">
                {/* Faint camera watermark icons for background decoration */}
                <div className="hero-watermark wm-1"><Camera size={120} strokeWidth={0.5} /></div>
                <div className="hero-watermark wm-2"><Camera size={100} strokeWidth={0.5} /></div>
                <div className="hero-watermark wm-3"><Camera size={90} strokeWidth={0.5} /></div>
                <div className="hero-watermark wm-4"><Camera size={110} strokeWidth={0.5} /></div>

                <div className="container hero-centered-wrapper">
                    <div className="hero-trust-badge">
                        <Shield size={14} color="var(--accent)" strokeWidth={2} />
                        <span>Trusted by Smart Cities & Law Enforcement</span>
                    </div>

                    <h1 className="hero-title-centered">
                        Secure CCTV Access for a <span style={{ color: 'var(--accent)' }}>Safer</span>
                        <br />
                        <span style={{ color: 'var(--accent)' }}>Community</span>
                    </h1>

                    <p className="hero-subtitle-centered">
                        The centralized platform where CCTV owners register their cameras and citizens securely request footage. Privacy-first with AI-powered face & number plate masking.
                    </p>

                    <div className="hero-actions-centered">
                        <Link to="/register?role=owner">
                            <button className="btn-primary-centered">
                                <Camera size={16} />
                                Register as CCTV Owner
                            </button>
                        </Link>
                        <Link to="/register?role=citizen">
                            <button className="btn-outline-centered">
                                <Search size={16} />
                                Request Footage
                            </button>
                        </Link>
                    </div>

                    <div className="hero-stats-grid">
                        <div className="hero-stat-card">
                            <div className="hero-stat-icon-wrapper">
                                <Camera size={20} color="var(--accent)" />
                            </div>
                            <div className="hero-stat-value">2,450</div>
                            <div className="hero-stat-label">Cameras Registered</div>
                        </div>
                        <div className="hero-stat-card">
                            <div className="hero-stat-icon-wrapper">
                                <Users size={20} color="var(--accent)" />
                            </div>
                            <div className="hero-stat-value">12,500</div>
                            <div className="hero-stat-label">Active Users</div>
                        </div>
                        <div className="hero-stat-card">
                            <div className="hero-stat-icon-wrapper">
                                <Globe size={20} color="var(--accent)" />
                            </div>
                            <div className="hero-stat-value">15</div>
                            <div className="hero-stat-label">Cities Covered</div>
                        </div>
                        <div className="hero-stat-card">
                            <div className="hero-stat-icon-wrapper">
                                <Clock size={20} color="var(--accent)" />
                            </div>
                            <div className="hero-stat-value">2.5 hours</div>
                            <div className="hero-stat-label">Avg. Response Time</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-heading" style={{ marginBottom: '16px' }}>
                            Why Choose CCTV<span style={{ color: 'var(--accent)' }}>Access?</span>
                        </h2>
                        <p className="section-subheading">
                            Built with privacy, security, and transparency at its core. We're redefining how communities access surveillance footage.
                        </p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon-box">
                                <MapPin size={20} />
                            </div>
                            <h3 className="feature-title">Location-Based Search</h3>
                            <p className="feature-desc">
                                Find cameras near any incident location with our interactive map. Search by address, area, or coordinates.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon-box">
                                <Eye size={20} />
                            </div>
                            <h3 className="feature-title">AI Privacy Masking</h3>
                            <p className="feature-desc">
                                Automatic face and number plate detection with intelligent masking. Protect privacy while maintaining evidence integrity.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon-box">
                                <Lock size={20} />
                            </div>
                            <h3 className="feature-title">Secure Access Control</h3>
                            <p className="feature-desc">
                                Role-based permissions ensure only authorized personnel can approve and access sensitive footage.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon-box">
                                <Zap size={20} />
                            </div>
                            <h3 className="feature-title">Quick Turnaround</h3>
                            <p className="feature-desc">
                                Average response time of 2.5 hours. Urgent requests can be prioritized for faster processing.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon-box">
                                <Server size={20} />
                            </div>
                            <h3 className="feature-title">Enterprise Ready</h3>
                            <p className="feature-desc">
                                Designed for government, law enforcement, and large organizations with compliance and audit trails.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon-box">
                                <Shield size={20} />
                            </div>
                            <h3 className="feature-title">Verified Network</h3>
                            <p className="feature-desc">
                                All CCTV owners are verified before registration. Trusted network of cameras across cities.
                            </p>
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
                        <Link to="/register?role=owner">
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
                                    <div className="m-thumb">
                                        <div className="m-thumb-overlay">
                                            <span className="m-thumb-status"><span className="red-dot"></span>REC</span>
                                            <span className="m-thumb-title">Main Gate - Cam 01</span>
                                        </div>
                                        <div className="m-thumb-icon">
                                            <Camera size={16} />
                                        </div>
                                    </div>
                                    <div className="m-thumb">
                                        <div className="m-thumb-overlay">
                                            <span className="m-thumb-status"><span className="red-dot"></span>REC</span>
                                            <span className="m-thumb-title">Driveway - Cam 02</span>
                                        </div>
                                        <div className="m-thumb-icon">
                                            <Camera size={16} />
                                        </div>
                                    </div>
                                    <div className="m-thumb">
                                        <div className="m-thumb-overlay">
                                            <span className="m-thumb-status"><span className="red-dot"></span>REC</span>
                                            <span className="m-thumb-title">Backyard - Cam 03</span>
                                        </div>
                                        <div className="m-thumb-icon">
                                            <Camera size={16} />
                                        </div>
                                    </div>
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
