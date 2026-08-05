import React, { useEffect, useState } from 'react';

import API_BASE_URL from '../config';

const Profile = () => {
    const auth = localStorage.getItem('user');
    const [userData, setUserData] = useState(auth ? JSON.parse(auth) : null);
    const [image, setImage] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', email: '' });

    useEffect(() => {
        if (userData && userData._id) {
            getUserDetails();
        }
    }, []);

    const getUserDetails = async () => {
        try {
            let result = await fetch(`${API_BASE_URL}/user/${userData._id}`, {
                headers: {
                    authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });
            result = await result.json();
            if (result && !result.result) {
                setUserData(result);
                setEditData({ name: result.name, email: result.email });
                localStorage.setItem('user', JSON.stringify(result)); // Sync local storage
            }
        } catch (err) {
            console.error("Get User Details Error:", err);
            alert(`Failed to fetch user details from ${API_BASE_URL}. Error: ${err.message}`);
        }
    }

    const handleUpdateDetails = async () => {
        try {
            let result = await fetch(`${API_BASE_URL}/user/${userData._id}`, {
                method: 'PUT',
                body: JSON.stringify(editData),
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });
            result = await result.json();
            if (result.acknowledged) {
                setUserData({ ...userData, ...editData });
                localStorage.setItem('user', JSON.stringify({ ...userData, ...editData }));
                setIsEditing(false);
                alert("Profile updated successfully!");
            }
        } catch (err) {
            console.error("Update Details Error:", err);
            alert(`Failed to update profile at ${API_BASE_URL}. Error: ${err.message}`);
        }
    }

    const handleImageUpload = async () => {
        if (!image) {
            alert("Please select an image first");
            return;
        }

        const formData = new FormData();
        formData.append('profileImage', image);

        try {
            let result = await fetch(`${API_BASE_URL}/upload-profile/${userData._id}`, {
                method: 'POST',
                body: formData,
                headers: {
                    authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });

            result = await result.json();
            if (result.profileImage) {
                setUserData({ ...userData, profileImage: result.profileImage });
                localStorage.setItem('user', JSON.stringify({ ...userData, profileImage: result.profileImage }));
                alert("Profile image updated successfully!");
            } else {
                alert(result.result || "Upload failed");
            }
        } catch (err) {
            console.error("Image Upload Error:", err);
            alert(`Failed to upload image to ${API_BASE_URL}. Error: ${err.message}`);
        }
    }


    return (
        <div className="product profile-container" style={{ maxWidth: '500px', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))' }}>
            <h1>{userData && userData.role === 'admin' ? "ADMIN PROFILE" : "USER PROFILE"}</h1>
            {userData ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '10px' }}>
                    
                    {/* Profile Image View */}
                    <div style={{ marginBottom: '25px', position: 'relative', cursor: 'pointer' }}>
                        <div 
                            onClick={() => document.getElementById('profile-upload').click()}
                            style={{
                                width: '140px',
                                height: '140px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '3px solid var(--primary-color)',
                                background: 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                                transition: 'var(--transition)',
                                position: 'relative'
                        }}>
                            {userData.profileImage ? (
                                <img src={userData.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '3.5rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                                    {userData.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                            {/* Hover Overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                background: 'rgba(0,0,0,0.6)',
                                width: '100%',
                                padding: '5px 0',
                                fontSize: '0.7rem',
                                color: 'white',
                                textAlign: 'center',
                                opacity: 0.8
                            }}>
                                CHANGE
                            </div>
                        </div>
                        
                        <input 
                            id="profile-upload"
                            type="file" 
                            accept="image/*"
                            onChange={(e) => {
                                if(e.target.files[0]) {
                                    setImage(e.target.files[0]);
                                    // Trigger auto-upload for better UX
                                    const confirmUpload = window.confirm("Update profile picture?");
                                    if(confirmUpload) handleImageUpload();
                                }
                            }}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* User Details Form/View */}
                    <div style={{ 
                        width: '100%', 
                        padding: '25px', 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        borderRadius: '16px', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '5px' }}>Full Name</label>
                            {isEditing ? (
                                <input 
                                    className="inputBox" 
                                    value={editData.name} 
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })} 
                                    style={{ margin: 0, padding: '12px' }}
                                />
                            ) : (
                                <div style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '500' }}>{userData.name}</div>
                            )}
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '5px' }}>Email Address</label>
                            {isEditing ? (
                                <input 
                                    className="inputBox" 
                                    value={editData.email} 
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })} 
                                    style={{ margin: 0, padding: '12px' }}
                                />
                            ) : (
                                <div style={{ color: 'var(--text-primary)', fontSize: '1.1rem', opacity: 0.9 }}>{userData.email}</div>
                            )}
                        </div>

                        <div style={{ marginBottom: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>INTERNAL ID: {userData._id}</span>
                        </div>
                        
                        <div style={{ marginTop: '25px', display: 'flex', gap: '12px' }}>
                            {isEditing ? (
                                <>
                                    <button onClick={handleUpdateDetails} className="appButton" style={{ margin: 0, flex: 2 }}>Save Changes</button>
                                    <button onClick={() => setIsEditing(false)} className="appButton" style={{ margin: 0, flex: 1, background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}>Cancel</button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="appButton" style={{ margin: 0 }}>Edit Profile Information</button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading profile data...</p>
                </div>
            )}
        </div>
    )
}

export default Profile;
