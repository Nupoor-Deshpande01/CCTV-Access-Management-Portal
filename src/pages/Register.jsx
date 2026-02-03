import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Navbar from '../components/layout/Navbar';

const Register = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState('citizen');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await signup(email, password, role, name || 'New User');
            // Redirect based on role
            if (user && role === 'citizen') navigate('/dashboard');
            else if (user && role === 'owner') navigate('/owner');
            else navigate('/dashboard');
        } catch (err) {
            setError('Failed to create an account. ' + err.message);
        }

        setLoading(false);
    };

    return (
        <>
            <Navbar />
            <div className="container flex-center" style={{ minHeight: '80vh' }}>
                <Card title="Create Account" style={{ width: '100%', maxWidth: '400px' }}>
                    {error && <div className="alert alert-danger" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                    <form onSubmit={handleRegister}>
                        <div className="input-group">
                            <label className="input-label">I am a...</label>
                            <select
                                className="input-field"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="citizen">Citizen</option>
                                <option value="owner">CCTV Owner</option>
                            </select>
                        </div>

                        <Input
                            label="Full Name"
                            placeholder="Your Name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            label="Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Button block type="submit" className="u-mt-4" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>

                        <p className="u-mt-4 text-center text-muted" style={{ fontSize: '0.9rem' }}>
                            Already have an account? <Link to="/login" className="text-primary">Log in</Link>
                        </p>
                    </form>
                </Card>
            </div>
        </>
    );
};

export default Register;
