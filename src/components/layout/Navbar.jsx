import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Camera } from 'lucide-react';
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
                        <Camera size={20} color="var(--text-primary)" />
                    </div>
                    <div className="nav-brand-text">
                        <span className="nav-title">CCTVAccess</span>
                        <span className="nav-subtitle">SECURE · PRIVATE · TRUSTED</span>
                    </div>
                </Link>

                {/* Center */}
                {user && (
                    <div className="nav-links">
                        {user.role === 'citizen' && (
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        )}
                        {user.role === 'owner' && (
                            <Link to="/owner" className="nav-link">My Cameras</Link>
                        )}
                        {user.role === 'admin' && (
                            <Link to="/admin" className="nav-link">Admin Console</Link>
                        )}
                    </div>
                )}

                {/* Right */}
                <div className="nav-actions">
                    {!user ? (
                        <>
                            <Link to="/login" className="nav-link-ghost">Sign In</Link>
                            <Link to="/register">
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
