import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Nav=()=>{
    const auth = localStorage.getItem('user');
    const navigate = useNavigate();
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        updateCount();
        window.addEventListener('cartUpdated', updateCount);
        return () => {
            window.removeEventListener('cartUpdated', updateCount);
        };
    }, [auth]); // Recalculate on auth state changes as well

    const updateCount = () => {
        try {
            const cart = localStorage.getItem('cart');
            if (cart) {
                const parsed = JSON.parse(cart);
                const totalQty = parsed.reduce((sum, item) => sum + (item.quantity || 1), 0);
                setCartCount(totalQty);
            } else {
                setCartCount(0);
            }
        } catch (e) {
            setCartCount(0);
        }
    };
    
    // Safely parse user data
    let user = null;
    try {
        user = auth ? JSON.parse(auth) : null;
    } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        user = null;
    }

    const logout=()=>{
        localStorage.clear();
        setCartCount(0);
        navigate('/signup')
    }
    return(
        <nav>
            { auth && user ? <ul className="nav-ul">
                <li>
                    <img alt="logo" className='logo' 
                    src={`${process.env.PUBLIC_URL}/logo.png`} />
                </li>
                
                {/* Admin-only Nav links */}
                {user.role === 'admin' ? (
                    <>
                        <li><Link to="/" style={{ fontWeight: '600' }}>🏠 Home</Link></li>
                        <li><Link to="/admin" style={{ color: 'var(--primary-color)', fontWeight: '700' }}>👑 Admin Dashboard</Link></li>
                        <li><Link to="/products">Products Shop</Link></li>
                        <li><Link to="/add">Add Product</Link></li>
                    </>
                ) : (
                    /* Customer-only Nav links */
                    <>
                        <li><Link to="/" style={{ fontWeight: '600' }}>🏠 Home</Link></li>
                        <li><Link to="/products">Products Shop</Link></li>
                        <li>
                            <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                Cart
                                {cartCount > 0 && (
                                    <span style={{
                                        background: 'var(--primary-color)',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontWeight: '700',
                                        boxShadow: '0 0 10px var(--primary-color)'
                                    }}>
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </li>
                        <li><Link to="/orders">My Orders</Link></li>
                    </>
                )}

                { location.pathname.includes('/update') && 
                    <li><Link to={location.pathname} style={{ color: 'var(--primary-color)' }}>Update Product</Link></li> 
                }
                <li style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid var(--primary-color)',
                        background: 'rgba(255,255,255,0.1)',
                        marginRight: '-10px', // Pull it closer to the text
                        zIndex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '0.6rem',
                        fontWeight: 'bold',
                        color: 'var(--text-primary)'
                    }}>
                        {user && user.profileImage ? (
                            <img src={user.profileImage} alt="nav-profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span>{user && user.name ? user.name.charAt(0).toUpperCase() : '?'}</span>
                        )}
                    </div>
                    <Link to="/profile">Profile</Link>
                </li>
                <li className="nav-right">
                    <Link onClick={logout} to="/signup" className="logout-btn">
                        Logout ({user && user.name ? `${user.name} [${user.role || 'user'}]` : 'User'})
                    </Link>
                </li>
            </ul>
            :
            <ul className="nav-ul nav-right">
                <li><Link to="/signup">Sign Up</Link></li>
                <li><Link to="/login">Login</Link></li>
            </ul>
            }
        </nav>
    )
}

export default Nav;