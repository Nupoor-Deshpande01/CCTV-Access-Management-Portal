import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Navbar from '../components/layout/Navbar';
import './Landing.css';
import { Eye, ShieldCheck, Lock } from 'lucide-react';

const Landing = () => {
    return (
        <>
            <Navbar />
            <div className="container">
                <section className="hero">
                    <h1 className="hero-title">Ethical CCTV Access for Safer Communities</h1>
                    <p className="hero-subtitle">
                        A privacy-first platform that empowers citizens to request footage for valid reasons, while giving owners full control and incentives.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register">
                            <Button size="lg" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>Get Started</Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" size="lg" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>Log In</Button>
                        </Link>
                    </div>
                </section>

                <section className="features-grid">
                    <div className="feature-item">
                        <div className="feature-icon"><Eye size={24} /></div>
                        <h3 className="feature-title">Transparent Requests</h3>
                        <p className="text-muted">Request footage with a clear reason. Owners approve or deny based on validity.</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon"><Lock size={24} /></div>
                        <h3 className="feature-title">Privacy First</h3>
                        <p className="text-muted">Footage is secure. Only approved requests get temporary access links.</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon"><ShieldCheck size={24} /></div>
                        <h3 className="feature-title">Owner Control</h3>
                        <p className="text-muted">CCTV owners decide who sees what. Earn reputation and incentives for helping.</p>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Landing;
