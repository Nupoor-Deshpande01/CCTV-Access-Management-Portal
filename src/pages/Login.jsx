import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Navbar from '../components/layout/Navbar';

const Login = () => {
    const { login, loginWithGoogle, user } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // If already logged in, redirect based on role (simple check)
    // Effect handling is better in protected routes, but this is a UX enhancement

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to login. ' + err.message);
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to login with Google. ' + err.message);
        }
        setLoading(false);
    };

    return (
        <>
            <Navbar />
            <div className="container flex-center" style={{ minHeight: '80vh' }}>
                <Card title="Welcome Back" style={{ width: '100%', maxWidth: '400px' }}>
                    {error && <div className="alert alert-danger" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                    <form onSubmit={handleLogin}>
                        <Input
                            label="Email"
                            type="email"
                            placeholder="your@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="******"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Button block type="submit" className="u-mt-4" disabled={loading}>
                            {loading ? 'Logging in...' : 'Enter Dashboard'}
                        </Button>

                        <div className="text-center u-my-2" style={{ position: 'relative' }}>
                            <span style={{ background: '#fff', padding: '0 10px', color: '#666', position: 'relative', zIndex: 1 }}>OR</span>
                            <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '1px', background: '#eee', zIndex: 0 }}></div>
                        </div>

                        <Button
                            block
                            type="button"
                            variant="secondary" // Assuming we have variants or I can style it manually
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            style={{ backgroundColor: '#fff', color: '#333', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
                            Sign in with Google
                        </Button>

                        <p className="u-mt-4 text-center text-muted" style={{ fontSize: '0.9rem' }}>
                            No account? <Link to="/register" className="text-primary">Sign up</Link>
                        </p>
                    </form>
                </Card>
            </div>
        </>
    );
};

export default Login;
