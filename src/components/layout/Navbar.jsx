import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import './Navbar.css';
import { Camera, Shield } from 'lucide-react';

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
                <Link to="/" className="nav-brand">
                    <Shield size={24} />
                    <span>CCTV Access</span>
                </Link>

                <div className="nav-links">
                    {!user ? (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register">
                                <Button>Get Started</Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <span className="nav-text" style={{ marginRight: '1rem' }}>
                                Hello, {user.name || user.email} ({user.role})
                            </span>
                            {user.role === 'citizen' && (
                                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            )}
                            {user.role === 'owner' && (
                                <Link to="/owner" className="nav-link">My Cameras</Link>
                            )}
                            {user.role === 'admin' && (
                                <Link to="/admin" className="nav-link">Admin Console</Link>
                            )}
                            <Button variant="outline" onClick={handleLogout}>Logout</Button>
                        </>
                    )}
                </div>
            </div>
        </nav >
    );
};

export default Navbar;
