import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalSales: 0,
        recentOrders: []
    });
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKey, setSearchKey] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const auth = localStorage.getItem('user');
        if (!auth) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(auth);
        if (user.role !== 'admin') {
            alert("Access Denied! Administrators only.");
            navigate('/');
            return;
        }

        fetchDashboardData();
    }, [activeTab]);

    const fetchDashboardData = async () => {
        setLoading(true);
        const token = JSON.parse(localStorage.getItem('token'));
        const headers = { authorization: `bearer ${token}` };

        try {
            if (activeTab === 'overview') {
                let res = await fetch(`${API_BASE_URL}/admin/stats`, { headers });
                let data = await res.json();
                if (data && !data.result) {
                    setStats(data);
                }
            } else if (activeTab === 'products') {
                let res = await fetch(`${API_BASE_URL}/products`, { headers });
                let data = await res.json();
                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    setProducts([]);
                }
            } else if (activeTab === 'orders') {
                let res = await fetch(`${API_BASE_URL}/admin/orders`, { headers });
                let data = await res.json();
                if (Array.isArray(data)) {
                    setOrders(data);
                } else {
                    setOrders([]);
                }
            } else if (activeTab === 'users') {
                let res = await fetch(`${API_BASE_URL}/admin/users`, { headers });
                let data = await res.json();
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    setUsers([]);
                }
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            let result = await fetch(`${API_BASE_URL}/product/${id}`, {
                method: "Delete",
                headers: {
                    authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });
            result = await result.json();
            if (result) {
                // Refresh list
                const updated = products.filter(p => p._id !== id);
                setProducts(updated);
            }
        } catch (err) {
            console.error("Delete Product Error:", err);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            let result = await fetch(`${API_BASE_URL}/admin/order-status/${orderId}`, {
                method: "Put",
                body: JSON.stringify({ status: newStatus }),
                headers: {
                    "Content-Type": "application/json",
                    authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });
            result = await result.json();
            if (result) {
                // Update local state
                const updatedOrders = orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o);
                setOrders(updatedOrders);
                alert(`Order status updated to "${newStatus}"`);
            }
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            let result = await fetch(`${API_BASE_URL}/admin/user/${id}`, {
                method: "Delete",
                headers: {
                    authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });
            result = await result.json();
            if (result) {
                const updated = users.filter(u => u._id !== id);
                setUsers(updated);
            }
        } catch (err) {
            console.error("Delete User Error:", err);
        }
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            let result = await fetch(`${API_BASE_URL}/admin/user-role/${userId}`, {
                method: "Put",
                body: JSON.stringify({ role: newRole }),
                headers: {
                    "Content-Type": "application/json",
                    authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });
            result = await result.json();
            if (result) {
                const updatedUsers = users.map(u => u._id === userId ? { ...u, role: newRole } : u);
                setUsers(updatedUsers);
                alert(`User role updated to "${newRole}"`);
            }
        } catch (err) {
            console.error("Failed to update user role", err);
        }
    };

    const searchProduct = async (e) => {
        let key = e.target.value;
        setSearchKey(key);
        if (key) {
            try {
                let result = await fetch(`${API_BASE_URL}/search/${key}`, {
                    headers: {
                        authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                    }
                });
                result = await result.json();
                if (result) {
                    setProducts(result);
                }
            } catch (err) {
                console.error("Search Error:", err);
            }
        } else {
            fetchDashboardData();
        }
    };

    const formatPrice = (price) => {
        if (!price) return "0.00";
        const clean = String(price).replace(/[₹$,]/g, '');
        const num = parseFloat(clean);
        return isNaN(num) ? "0.00" : num.toFixed(2);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', minHeight: '80vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Manage products, view customer orders, and track business statistics.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/add" style={{
                        background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <span>➕ Add Product</span>
                    </Link>
                    <Link to="/products" style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        🛒 Customer Shop
                    </Link>
                    <button 
                        onClick={() => {
                            localStorage.clear();
                            navigate('/login');
                        }}
                        style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid var(--error-color)',
                            color: 'var(--error-color)',
                            padding: '12px 20px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </div>

            {/* Dashboard Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '30px', gap: '15px', overflowX: 'auto', paddingBottom: '2px' }}>
                {['overview', 'products', 'orders', 'users'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-secondary)',
                            padding: '12px 24px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            borderBottom: activeTab === tab ? '3px solid var(--primary-color)' : '3px solid transparent',
                            textTransform: 'capitalize',
                            transition: 'var(--transition)'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px 0', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                    Loading data...
                </div>
            ) : (
                <div>
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div>
                            {/* KPI Metrics */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '25px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Sales</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '10px', color: 'var(--success-color)' }}>
                                        ₹{formatPrice(stats.totalSales)}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Combined order revenues</div>
                                </div>
                                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '25px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Orders Placed</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '10px' }}>
                                        {stats.totalOrders}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Transactions completed</div>
                                </div>
                                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '25px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Products Catalog</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '10px', color: 'var(--primary-color)' }}>
                                        {stats.totalProducts}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Items live in the shop</div>
                                </div>
                                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '25px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Customers Registered</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '10px', color: 'var(--secondary-color)' }}>
                                        {stats.totalUsers}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Active platform accounts</div>
                                </div>
                            </div>

                            {/* Recent Activity Table */}
                            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '25px', backdropFilter: 'blur(10px)' }}>
                                <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', fontWeight: '700' }}>Recent Orders</h3>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Order Date</th>
                                                <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Order ID</th>
                                                <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Customer ID</th>
                                                <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Amount</th>
                                                <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recentOrders && stats.recentOrders.length > 0 ? (
                                                stats.recentOrders.map((order) => (
                                                    <tr key={order._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                        <td style={{ padding: '12px' }}>{new Date(order.orderDate).toLocaleDateString()}</td>
                                                        <td style={{ padding: '12px', fontSize: '0.85rem', fontFamily: 'monospace' }}>{order._id}</td>
                                                        <td style={{ padding: '12px', fontSize: '0.85rem', fontFamily: 'monospace' }}>{order.userId}</td>
                                                        <td style={{ padding: '12px', color: 'var(--success-color)', fontWeight: '600' }}>₹{formatPrice(order.totalAmount)}</td>
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
                    )}

                    {/* PRODUCTS TAB */}
                    {activeTab === 'products' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Manage Products ({products.length})</h3>
                                <input
                                    type="text"
                                    value={searchKey}
                                    onChange={searchProduct}
                                    placeholder="Search products..."
                                    style={{
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'var(--text-primary)',
                                        width: '100%',
                                        maxWidth: '300px'
                                    }}
                                />
                            </div>

                            <div style={{ overflowX: 'auto', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>S.No.</th>
                                            <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Product Name</th>
                                            <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Price</th>
                                            <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Category</th>
                                            <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Company</th>
                                            <th style={{ padding: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.length > 0 ? (
                                            products.map((p, index) => (
                                                <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                    <td style={{ padding: '12px' }}>{index + 1}</td>
                                                    <td style={{ padding: '12px', fontWeight: '600' }}>{p.name}</td>
                                                    <td style={{ padding: '12px', color: 'var(--success-color)' }}>₹{formatPrice(p.price)}</td>
                                                    <td style={{ padding: '12px' }}>{p.category}</td>
                                                    <td style={{ padding: '12px' }}>{p.company}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                            <Link to={`/update/${p._id}`} style={{
                                                                padding: '6px 12px',
                                                                background: 'rgba(99, 102, 241, 0.2)',
                                                                color: 'var(--primary-color)',
                                                                borderRadius: '6px',
                                                                textDecoration: 'none',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '700',
                                                                border: '1px solid var(--primary-color)'
                                                            }}>
                                                                Edit
                                                            </Link>
                                                            <button onClick={() => deleteProduct(p._id)} style={{
                                                                padding: '6px 12px',
                                                                background: 'rgba(239, 68, 68, 0.2)',
                                                                color: 'var(--error-color)',
                                                                borderRadius: '6px',
                                                                border: '1px solid var(--error-color)',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '700',
                                                                cursor: 'pointer'
                                                            }}>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No products in database.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ORDERS TAB */}
                    {activeTab === 'orders' && (
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>Comprehensive Customer Orders ({orders.length})</h3>
                            <div style={{ overflowX: 'auto', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Order Info</th>
                                            <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Products Summary</th>
                                            <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Total Price</th>
                                            <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Current Status</th>
                                            <th style={{ padding: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>Modify Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.length > 0 ? (
                                            orders.map((o) => (
                                                <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', verticalAlign: 'top' }}>
                                                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                                                        <div><strong>ID:</strong> <code style={{ color: 'var(--text-secondary)' }}>{o._id}</code></div>
                                                        <div style={{ marginTop: '4px' }}><strong>User ID:</strong> <code style={{ color: 'var(--text-secondary)' }}>{o.userId}</code></div>
                                                        <div style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>{new Date(o.orderDate).toLocaleString()}</div>
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                                                        {o.products && o.products.map((prod, idx) => (
                                                            <div key={idx} style={{ marginBottom: '6px', borderBottom: idx < o.products.length - 1 ? '1px dashed rgba(255,255,255,0.03)' : 'none', paddingBottom: '4px' }}>
                                                                {prod.name} <span style={{ color: 'var(--text-secondary)' }}>x{prod.quantity}</span> (₹{formatPrice(prod.price)})
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td style={{ padding: '12px', color: 'var(--success-color)', fontWeight: '700', fontSize: '1.05rem' }}>
                                                        ₹{formatPrice(o.totalAmount)}
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{
                                                            background: o.status === 'Delivered' ? 'rgba(16, 185, 129, 0.15)' : o.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                                            color: o.status === 'Delivered' ? 'var(--success-color)' : o.status === 'Cancelled' ? 'var(--error-color)' : 'var(--primary-color)',
                                                            padding: '6px 12px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '700',
                                                            display: 'inline-block'
                                                        }}>
                                                            {o.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                                        <select
                                                            value={o.status}
                                                            onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                                                            style={{
                                                                padding: '6px 12px',
                                                                borderRadius: '8px',
                                                                border: '1px solid var(--border-color)',
                                                                background: 'rgba(0,0,0,0.2)',
                                                                color: 'var(--text-primary)',
                                                                cursor: 'pointer',
                                                                outline: 'none',
                                                                fontSize: '0.85rem'
                                                            }}
                                                        >
                                                            <option value="Confirmed">Confirmed</option>
                                                            <option value="Shipped">Shipped</option>
                                                            <option value="Delivered">Delivered</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No orders available in system database.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>Registered Customers & Admin List ({users.length})</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <div key={user._id} style={{
                                            background: 'var(--card-bg)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '16px',
                                            padding: '20px',
                                            display: 'flex',
                                            gap: '15px',
                                            alignItems: 'center',
                                            backdropFilter: 'blur(10px)'
                                        }}>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '50%',
                                                overflow: 'hidden',
                                                border: '2px solid var(--primary-color)',
                                                background: 'rgba(255,255,255,0.05)',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '1.2rem',
                                                flexShrink: 0
                                            }}>
                                                {user.profileImage ? (
                                                    <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <span>{user.name.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div style={{ overflow: 'hidden', flex: 1 }}>
                                                <h4 style={{ margin: 0, fontSize: '1.05rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.name}</h4>
                                                <p style={{ margin: '4px 0 8px', fontSize: '0.85rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.email}</p>
                                                
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <select
                                                        value={user.role || 'user'}
                                                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                                                        style={{
                                                            background: user.role === 'admin' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                                                            border: user.role === 'admin' ? '1px solid var(--secondary-color)' : '1px solid rgba(255,255,255,0.1)',
                                                            color: user.role === 'admin' ? 'var(--secondary-color)' : 'var(--text-secondary)',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            outline: 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <option value="user" style={{ background: '#1e1b4b', color: 'var(--text-primary)' }}>User</option>
                                                        <option value="admin" style={{ background: '#1e1b4b', color: 'var(--text-primary)' }}>Admin</option>
                                                    </select>
                                                    
                                                    <button onClick={() => deleteUser(user._id)} style={{
                                                        padding: '4px 10px',
                                                        background: 'rgba(239, 68, 68, 0.2)',
                                                        color: 'var(--error-color)',
                                                        borderRadius: '6px',
                                                        border: '1px solid var(--error-color)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        cursor: 'pointer'
                                                    }}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }}>No users found.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
