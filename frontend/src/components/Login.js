import React, {useEffect} from 'react'
import {useNavigate} from 'react-router-dom'

import API_BASE_URL from '../config';

const Login=()=>{
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [isForgotPassword, setIsForgotPassword] = React.useState(false);
    const [newPassword, setNewPassword] = React.useState('');
    const navigate = useNavigate();
    useEffect(()=>{
        const auth = localStorage.getItem('user');
        if(auth) {
            try {
                const user = JSON.parse(auth);
                navigate(user.role === 'admin' ? '/admin' : '/');
            } catch (e) {
                navigate('/');
            }
        }
    }, [navigate])

    const handleLogin= async () =>{
        if (!email || !password) {
            setError(true);
            return false;
        }

        console.warn("email, password", email, password)
        try {
            let response = await fetch(`${API_BASE_URL}/login`, {
                method: 'post',
                body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                alert(errData.result || "Login failed. Please check your credentials.");
                return;
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                alert("Server returned an invalid response. The backend server might be offline.");
                return;
            }

            let result = await response.json();
            if (result.auth) {
                localStorage.setItem("user", JSON.stringify(result.user));
                localStorage.setItem("token", JSON.stringify(result.auth));
                navigate(result.user.role === 'admin' ? '/admin' : '/');
            }
            else {
                alert(result.result || "please enter correct details");
            }
        } catch (err) {
            console.error("Login Error:", err);
            alert(`Failed to connect to the server. Please ensure the backend is running.`);
        }
    }

    const handleResetPassword = async () => {
        if (!email || !newPassword) {
            setError(true);
            return false;
        }

        try {
            let response = await fetch(`${API_BASE_URL}/reset-password`, {
                method: 'post',
                body: JSON.stringify({ email: email.trim().toLowerCase(), newPassword }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            let result = await response.json();
            if (response.ok) {
                alert(result.result);
                setIsForgotPassword(false);
                setNewPassword('');
                setPassword('');
                setError(false);
            } else {
                alert(result.result || "Failed to reset password.");
            }
        } catch (err) {
            console.error("Reset Password Error:", err);
            alert(`Failed to connect to the server. Please ensure the backend is running.`);
        }
    };

    return(
        <div className="login">
            <h1>{isForgotPassword ? "Reset Password" : "Login Page"}</h1>
            <input type="text" className='inputBox' placeholder='Enter Email' 
            onChange={(e)=>setEmail(e.target.value)} value={email} />
            {error && !email && <span className='invalid-input'>Enter valid email</span>}

            {!isForgotPassword ? (
                <>
                    <div className="password-container" style={{ position: 'relative', width: '100%', margin: '15px 0' }}>
                        <input type={showPassword ? "text" : "password"} className='inputBox' placeholder='Enter Password'
                        onChange={(e)=>setPassword(e.target.value)} value={password} style={{ paddingRight: '45px', margin: 0 }} />
                        <span 
                            onClick={() => setShowPassword(prev => !prev)}
                            onMouseDown={(e) => e.preventDefault()}
                            style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                            title={showPassword ? "Hide Password" : "Show Password"}
                        >
                            {showPassword ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                        </span>
                    </div>
                    {error && !password && <span className='invalid-input'>Enter valid password</span>}

                    <div style={{ width: '100%', textAlign: 'right', marginTop: '-5px', marginBottom: '15px' }}>
                        <span onClick={() => { setIsForgotPassword(true); setError(false); }} style={{ color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.9rem' }}>Forgot Password?</span>
                    </div>

                    <button onClick={handleLogin} className="appButton" type="button">Login</button>
                </>
            ) : (
                <>
                    <div className="password-container" style={{ position: 'relative', width: '100%', margin: '15px 0' }}>
                        <input type={showPassword ? "text" : "password"} className='inputBox' placeholder='Enter New Password'
                        onChange={(e)=>setNewPassword(e.target.value)} value={newPassword} style={{ paddingRight: '45px', margin: 0 }} />
                        <span 
                            onClick={() => setShowPassword(prev => !prev)}
                            onMouseDown={(e) => e.preventDefault()}
                            style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                            title={showPassword ? "Hide Password" : "Show Password"}
                        >
                            {showPassword ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                        </span>
                    </div>
                    {error && !newPassword && <span className='invalid-input'>Enter valid new password</span>}

                    <div style={{ width: '100%', textAlign: 'right', marginTop: '-5px', marginBottom: '15px' }}>
                        <span onClick={() => { setIsForgotPassword(false); setError(false); }} style={{ color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.9rem' }}>Back to Login</span>
                    </div>

                    <button onClick={handleResetPassword} className="appButton" type="button">Reset Password</button>
                </>
            )}
        </div>
    )
}

export default Login