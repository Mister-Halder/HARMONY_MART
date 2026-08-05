import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const Home = () => {
    const auth = localStorage.getItem('user');
    const navigate = useNavigate();
    
    // Safely parse user data
    let user = null;
    try {
        user = auth ? JSON.parse(auth) : null;
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
    }

    // States for Customer View
    const [featuredProducts, setFeaturedProducts] = useState([]);
    
    // States for Admin View
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalSales: 0,
        recentOrders: []
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            navigate('/login');
            return;
        }
        
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth]);

    const fetchData = async () => {
        setLoading(true);
        const token = JSON.parse(localStorage.getItem('token'));
        const headers = { authorization: `bearer ${token}` };

        try {
            if (user && user.role === 'admin') {
                // Fetch Admin stats
                let res = await fetch(`${API_BASE_URL}/admin/stats`, { headers });
                let data = await res.json();
                if (data && !data.result) {
                    setStats(data);
                }
            } else {
                // Fetch products for featured list
                let res = await fetch(`${API_BASE_URL}/products`, { headers });
                let data = await res.json();
                if (Array.isArray(data)) {
                    // Just take top 4 products as featured items
                    setFeaturedProducts(data.slice(0, 4));
                }
            }
        } catch (error) {
            console.error("Error fetching homepage data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (!price) return "0.00";
        const clean = String(price).replace(/[₹$,]/g, '');
        const num = parseFloat(clean);
        return isNaN(num) ? "0.00" : num.toFixed(2);
    };

    const addToCart = (product, silent = false) => {
        try {
            let cart = localStorage.getItem('cart');
            cart = cart ? JSON.parse(cart) : [];
            
            const existingIndex = cart.findIndex(item => item._id === product._id);
            if (existingIndex > -1) {
                cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated'));
            if (!silent) {
                alert(`"${product.name}" added to cart!`);
            }
        } catch (e) {
            console.error("Error adding to cart", e);
        }
    };

    const buyNow = (product) => {
        addToCart(product, true);
        navigate('/cart');
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                <div className="animate-pulse" style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                    Loading Your Premium Experience...
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto 100px', padding: '0 20px', minHeight: '80vh' }}>
            
            {/* ========================================================================= */}
            {/* ADMIN HOMEPAGE VIEW */}
            {/* ========================================================================= */}
            {user && user.role === 'admin' ? (
                <div>
                    {/* Welcome Hero Banner */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '24px',
                        padding: '40px',
                        marginBottom: '40px',
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(10px)',
                        boxShadow: 'var(--glass-shadow)'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-20%',
                            right: '-10%',
                            width: '300px',
                            height: '300px',
                            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
                            pointerEvents: 'none'
                        }}></div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '3px solid var(--primary-color)',
                                background: 'rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '1.8rem',
                                fontWeight: 'bold',
                                color: 'var(--text-primary)',
                                boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
                            }}>
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span>{user.name.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div>
                                <span style={{
                                    background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '30px',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    display: 'inline-block',
                                    marginBottom: '10px'
                                }}>
                                    👑 Administrator Hub
                                </span>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, background: 'linear-gradient(to right, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Welcome back, {user.name}!
                                </h1>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1.05rem', maxWidth: '600px' }}>
                                    Your store catalog has active clients. View live system metrics and perform quick administrative tasks.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Metric Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '25px', borderRadius: '20px', backdropFilter: 'blur(10px)', boxShadow: 'var(--glass-shadow)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Gross Store Sales</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '12px', color: 'var(--success-color)' }}>
                                ₹{formatPrice(stats.totalSales)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Calculated from order revenues</div>
                        </div>

                        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '25px', borderRadius: '20px', backdropFilter: 'blur(10px)', boxShadow: 'var(--glass-shadow)' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Active Users</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '12px', color: 'var(--secondary-color)' }}>
                                {stats.totalUsers}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Registered customer profiles</div>
                        </div>

                        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '25px', borderRadius: '20px', backdropFilter: 'blur(10px)', boxShadow: 'var(--glass-shadow)' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Products in Store</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '12px', color: 'var(--primary-color)' }}>
                                {stats.totalProducts}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Active items in live catalog</div>
                        </div>

                        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '25px', borderRadius: '20px', backdropFilter: 'blur(10px)', boxShadow: 'var(--glass-shadow)' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Orders Completed</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '12px', color: '#fbbf24' }}>
                                {stats.totalOrders}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Customer checkouts complete</div>
                        </div>
                    </div>

                    {/* Quick Admin Actions Grid */}
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '20px', background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            ⚡ Immediate Admin Control Panel
                        </h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                            <div 
                                onClick={() => navigate('/admin')}
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '20px',
                                    padding: '25px',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                }}
                            >
                                <div style={{ fontSize: '2rem' }}>📊</div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Business Analytics</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    View overall statistics, gross revenue records, and recent sales trends.
                                </p>
                                <span style={{ color: 'var(--primary-color)', fontWeight: '600', fontSize: '0.85rem', marginTop: '10px' }}>Open Dashboard →</span>
                            </div>

                            <div 
                                onClick={() => navigate('/add')}
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '20px',
                                    padding: '25px',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.borderColor = 'var(--secondary-color)';
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                }}
                            >
                                <div style={{ fontSize: '2rem' }}>➕</div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Add New Product</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    Upload products, set pricing, define brand company details, and choose category tags.
                                </p>
                                <span style={{ color: 'var(--secondary-color)', fontWeight: '600', fontSize: '0.85rem', marginTop: '10px' }}>Create Listing →</span>
                            </div>

                            <div 
                                onClick={() => { navigate('/admin'); /* will select orders tab in dashboard */ }}
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '20px',
                                    padding: '25px',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.borderColor = '#fbbf24';
                                    e.currentTarget.style.background = 'rgba(251, 191, 36, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                }}
                            >
                                <div style={{ fontSize: '2rem' }}>📦</div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Manage Orders</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    Monitor incoming customer shipments, cancel orders, or update shipment statuses.
                                </p>
                                <span style={{ color: '#fbbf24', fontWeight: '600', fontSize: '0.85rem', marginTop: '10px' }}>View Shipments →</span>
                            </div>

                            <div 
                                onClick={() => navigate('/products')}
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '20px',
                                    padding: '25px',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.borderColor = 'var(--success-color)';
                                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                }}
                            >
                                <div style={{ fontSize: '2rem' }}>🛒</div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Customer Shop</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    View the client storefront as customers experience it, search catalog items, or test purchases.
                                </p>
                                <span style={{ color: 'var(--success-color)', fontWeight: '600', fontSize: '0.85rem', marginTop: '10px' }}>Shop Front →</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Store Orders Section */}
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '30px', backdropFilter: 'blur(10px)', boxShadow: 'var(--glass-shadow)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0 }}>🛒 Recent Order Activity</h3>
                            <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
                                View All Orders →
                            </button>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Order Date</th>
                                        <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Order ID</th>
                                        <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Client ID</th>
                                        <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Price</th>
                                        <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Shipment Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentOrders && stats.recentOrders.length > 0 ? (
                                        stats.recentOrders.map((order) => (
                                            <tr key={order._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <td style={{ padding: '12px' }}>{new Date(order.orderDate).toLocaleDateString()}</td>
                                                <td style={{ padding: '12px', fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{order._id}</td>
                                                <td style={{ padding: '12px', fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{order.userId}</td>
                                                <td style={{ padding: '12px', color: 'var(--success-color)', fontWeight: '700' }}>₹{formatPrice(order.totalAmount)}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{
                                                        background: order.status === 'Delivered' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                                        color: order.status === 'Delivered' ? 'var(--success-color)' : 'var(--primary-color)',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '700'
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No orders placed yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                
                /* ========================================================================= */
                /* CUSTOMER HOMEPAGE VIEW */
                /* ========================================================================= */
                <div>
                    {/* Welcome Hero Banner */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '24px',
                        padding: '50px 40px',
                        marginBottom: '50px',
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(10px)',
                        boxShadow: 'var(--glass-shadow)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-30%',
                            left: '-20%',
                            width: '450px',
                            height: '450px',
                            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 60%)',
                            pointerEvents: 'none'
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            bottom: '-30%',
                            right: '-20%',
                            width: '450px',
                            height: '450px',
                            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 60%)',
                            pointerEvents: 'none'
                        }}></div>

                        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                            <span style={{
                                background: 'rgba(99, 102, 241, 0.15)',
                                color: 'var(--primary-color)',
                                padding: '6px 16px',
                                borderRadius: '30px',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                display: 'inline-block',
                                marginBottom: '15px'
                            }}>
                                ✨ Premium E-Commerce Experience
                            </span>
                            
                            <h1 style={{ 
                                fontSize: '3.2rem', 
                                fontWeight: '900', 
                                margin: '10px 0 20px', 
                                background: 'linear-gradient(to right, #ffffff, #e2e8f0, var(--primary-color), var(--secondary-color))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                lineHeight: '1.2'
                            }}>
                                Elevate Your Lifestyle. <br />
                                Curated Premium Collection.
                            </h1>
                            
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', marginBottom: '35px', lineHeight: '1.6' }}>
                                Welcome back, <strong>{user ? user.name : 'Customer'}</strong>! Discover high-end electronics, modern fashion accessories, and premium devices hand-picked just for you.
                            </p>

                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button 
                                    onClick={() => navigate('/products')}
                                    style={{
                                        background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                                        color: 'white',
                                        border: 'none',
                                        padding: '16px 36px',
                                        borderRadius: '30px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                                        transition: 'var(--transition)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    🛍️ Start Shopping Now
                                </button>
                                <button 
                                    onClick={() => navigate('/orders')}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-color)',
                                        padding: '16px 36px',
                                        borderRadius: '30px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        transition: 'var(--transition)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    📦 Track My Orders
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Promotions & Offers Banner */}
                    <div style={{
                        background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '20px',
                        padding: '25px',
                        marginBottom: '50px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '20px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ fontSize: '2.5rem' }}>⚡</div>
                            <div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#fbbf24' }}>
                                    Special MERN Dashboard Promo Offer!
                                </h4>
                                <p style={{ margin: '5px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    Use the checkout coupon code <strong style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', border: '1px dashed var(--border-color)' }}>MERN20</strong> to get <strong>20% discount</strong> on all items!
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/products')}
                            style={{
                                background: '#fbbf24',
                                color: '#0f172a',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'var(--transition)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Claim Deal
                        </button>
                    </div>

                    {/* Featured Category Blocks */}
                    <div style={{ marginBottom: '50px' }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '20px', background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            🏷️ Premium Categories to Explore
                        </h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div 
                                onClick={() => navigate('/products')}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.02) 100%)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '20px',
                                    padding: '30px',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                    textAlign: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(99,102,241,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💻</div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '10px' }}>Electronics & Devices</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    Laptops, smartphones, audio devices, and professional workspace hardware.
                                </p>
                            </div>

                            <div 
                                onClick={() => navigate('/products')}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.02) 100%)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '20px',
                                    padding: '30px',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                    textAlign: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.borderColor = 'var(--secondary-color)';
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(139,92,246,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👕</div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '10px' }}>Fashion Apparel</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    Designer clothing, luxury streetwear, athletic wear, and footwear.
                                </p>
                            </div>

                            <div 
                                onClick={() => navigate('/products')}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '20px',
                                    padding: '30px',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                    textAlign: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.borderColor = 'var(--success-color)';
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(16,185,129,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🏡</div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '10px' }}>Home & Decor</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    Premium furniture, smart home accessories, lightning, and decors.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Featured / Trending Products Showcase */}
                    <div style={{ marginBottom: '50px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: '700', margin: 0, background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                🔥 Trending Premium Products
                            </h2>
                            <button 
                                onClick={() => navigate('/products')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary-color)',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem'
                                }}
                            >
                                View Complete Catalog ({featuredProducts.length || '...'}) →
                            </button>
                        </div>

                        {featuredProducts.length > 0 ? (
                            <div className="product-grid">
                                {featuredProducts.map((item, index) => (
                                    <div key={item._id} className="product-card" style={{ animationDelay: `${index * 0.05}s` }}>
                                        <div className="product-badge">TRENDING</div>
                                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', marginBottom: '10px' }}>{item.category}</div>
                                        <h3 className="product-name" style={{ textAlign: 'left', fontSize: '1.2rem', minHeight: '44px', margin: '5px 0' }}>{item.name}</h3>
                                        <div className="product-company" style={{ textAlign: 'left', marginBottom: '15px' }}>by <span>{item.company}</span></div>
                                        <div className="product-price" style={{ textAlign: 'left', fontSize: '1.8rem', color: 'var(--success-color)', marginBottom: '20px' }}>₹{formatPrice(item.price)}</div>
                                        
                                        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                            <button 
                                                onClick={() => addToCart(item)} 
                                                className="action-btn"
                                                style={{ 
                                                    background: 'rgba(255, 255, 255, 0.04)', 
                                                    border: '1px solid var(--border-color)', 
                                                    color: 'var(--text-primary)',
                                                    fontSize: '0.85rem',
                                                    padding: '10px'
                                                }}
                                            >
                                                Add to Cart
                                            </button>
                                            <button 
                                                onClick={() => buyNow(item)} 
                                                className="action-btn"
                                                style={{ 
                                                    background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', 
                                                    color: 'white',
                                                    fontSize: '0.85rem',
                                                    padding: '10px',
                                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
                                                }}
                                            >
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--card-bg)', borderRadius: '20px', border: '1px dashed var(--border-color)' }}>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No trending products available right now. Please check back later!</p>
                            </div>
                        )}
                    </div>

                    {/* Platform Guarantee / Benefits Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '25px',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '50px'
                    }}>
                        <div style={{ textAlign: 'center', padding: '15px' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🚀</div>
                            <h5 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px' }}>Free Worldwide Shipping</h5>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Free express shipping on all orders over ₹75.</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '15px' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔒</div>
                            <h5 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px' }}>Secure Encrypted Checkout</h5>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>All transactions are 100% encrypted and bank-grade safe.</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '15px' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🤝</div>
                            <h5 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px' }}>24/7 Dedicated Support</h5>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Get friendly support from our team at any time of day.</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '15px' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>♻️</div>
                            <h5 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px' }}>30-Day Easy Returns</h5>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Return any undamaged product within 30 days for any reason.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
