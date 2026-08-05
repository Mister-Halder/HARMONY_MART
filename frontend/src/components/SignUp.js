import React, {useState, useEffect} from 'react'

import {useNavigate} from 'react-router-dom'

import API_BASE_URL from '../config';

const SignUp=()=>{
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);
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

    const collectData = async () => {
        if (!name || !email || !password) {
            setError(true);
            return false;
        }

        console.warn(name, email, password);
        try {
            let response = await fetch(`${API_BASE_URL}/register`, {
                method: 'post',
                body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password, role: 'user' }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                alert(errData.result || "Registration failed. Please try again.");
                return;
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                alert("Server returned an invalid response. The backend server might be offline.");
                return;
            }

            let result = await response.json();
            if (result && result.auth) {
                localStorage.setItem("user", JSON.stringify(result.user));
                localStorage.setItem("token", JSON.stringify(result.auth));
                navigate(result.user.role === 'admin' ? '/admin' : '/');
            } else {
                alert("Please enter valid details");
            }
        } catch (err) {
            console.error("Signup Error:", err);
            alert(`Failed to connect to the server. Please ensure the backend is running.`);
        }
    }


    return(
        <div className="register">
            <h1>Register</h1>
            <input className="inputBox" type="text" 
            value={name} onChange={(e)=>setName(e.target.value)} placeholder="Enter Name" />
            {error && !name && <span className='invalid-input'>Enter valid name</span>}

            <input className="inputBox" type="text" 
            value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Enter Email" />
            {error && !email && <span className='invalid-input'>Enter valid email</span>}

            <div className="password-container" style={{ position: 'relative', width: '100%', margin: '15px 0' }}>
                <input className="inputBox" type={showPassword ? "text" : "password"} 
                value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter Password" style={{ paddingRight: '45px', margin: 0 }} />
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


            <button onClick={collectData} className="appButton" type="button" style={{ display: 'block', margin: '20px auto 0' }}>Sign Up</button>
        </div>
    )
}

export default SignUp;