import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RobotAuthForm.css';
import { API_BASE_URL } from '../config';

const RobotAuthForm = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                // Fallback for development if db failed to initialize
                if (username && password && res.status >= 500) {
                    console.warn("Backend failed, using mock auth for development.");
                    setTimeout(() => {
                        onLogin({ username, id: 1, preferences: {} });
                        navigate('/');
                    }, 1000);
                    return;
                }
                const data = await res.json();
                throw new Error(data.error || 'Authentication failed');
            }

            const data = await res.json();
            localStorage.setItem('token', data.token);
            onLogin(data.user);
            navigate('/');
        } catch (err) {
            setError(err.message);
            // Fallback
            if (err.message.includes('fetch')) {
                console.warn("Backend offline, mock auth active.");
                setTimeout(() => {
                    onLogin({ username: username || 'Guest', id: 1 });
                    navigate('/');
                }, 1000);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="robot-auth-container">
            <div className={`robot-avatar ${loading ? 'processing' : ''}`}>
                <div className="antenna">
                    <div className="antenna-bulb"></div>
                </div>
                <div className="robot-face glass-panel">
                    <div className="eyes-container">
                        <div className="eye"></div>
                        <div className="eye"></div>
                    </div>
                    <div className="mouth">
                        <div className="mouth-line"></div>
                    </div>
                </div>
            </div>

            <div className="auth-card glass-panel">
                <h2 className="auth-title text-accent">
                    {isLogin ? 'INITIATE_LOGIN' : 'REGISTER_UNIT'}
                </h2>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>IDENTIFIER_ID</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="e.g. user_alpha"
                        />
                    </div>
                    <div className="input-group">
                        <label>ACCESS_CODE</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="auth-btn bg-accent" disabled={loading}>
                        {loading ? 'PROCESSING...' : (isLogin ? 'AUTHENTICATE' : 'INITIALIZE')}
                    </button>
                </form>

                <p className="toggle-auth">
                    {isLogin ? 'No assigned unit? ' : 'Unit already assigned? '}
                    <span className="text-accent toggle-link" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Register Here' : 'Login Here'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default RobotAuthForm;
