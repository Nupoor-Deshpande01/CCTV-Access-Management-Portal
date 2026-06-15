import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Camera, Moon } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container nav-content">
                {/* Left */}
                <Link to="/" className="nav-brand">
                    <div className="nav-icon-box">
                        <Camera size={20} color="var(--accent)" />
                    </div>
                    <div className="nav-brand-text">
                        <span className="nav-title">CCTV<span style={{ color: 'var(--accent)' }}>Access</span></span>
                        <span className="nav-subtitle">SECURE · PRIVATE · TRUSTED</span>
                    </div>
                </Link>

                {/* Center */}
                <div className="nav-links">
                    {!user ? (
                        <>
                            <a href="#" className="nav-link">Home</a>
                            <a href="#about" className="nav-link">About</a>
                            <a href="#how-it-works" className="nav-link">How It Works</a>
                            <a href="#contact" className="nav-link">Contact</a>
                        </>
                    ) : (
                        <>
                            {user.role === 'citizen' && (
                                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            )}
                            {user.role === 'owner' && (
                                <Link to="/owner" className="nav-link">My Cameras</Link>
                            )}
                            {user.role === 'admin' && (
                                <Link to="/admin" className="nav-link">Admin Console</Link>
                            )}
                        </>
                    )}
                </div>

                {/* Right */}
                <div className="nav-actions">
                    <button className="nav-theme-toggle" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                        <Moon size={18} />
                    </button>
                    {!user ? (
                        <>
                            <Link to="/login" className="nav-link-ghost">Sign In</Link>
                            <Link to="/register?role=citizen">
                                <button className="nav-btn-primary">Get Started</button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <span className="nav-user-text">
                                Hello, {user.name || user.email}
                            </span>
                            <button className="nav-btn-ghost" onClick={handleLogout}>Logout</button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
