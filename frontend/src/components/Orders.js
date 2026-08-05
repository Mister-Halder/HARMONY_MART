import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const auth = localStorage.getItem('user');

    const formatPrice = (price) => {
        if (!price) return "0.00";
        const clean = String(price).replace(/[₹$,]/g, '');
        const num = parseFloat(clean);
        return isNaN(num) ? "0.00" : num.toFixed(2);
    };

    useEffect(() => {
        if (auth) {
            getOrders();
        }
    }, []);

    const getOrders = async () => {
        try {
            const user = JSON.parse(auth);
            const token = JSON.parse(localStorage.getItem('token'));
            
            let result = await fetch(`${API_BASE_URL}/orders/${user._id}`, {
                headers: {
                    authorization: `bearer ${token}`
                }
            });
            result = await result.json();
            if (Array.isArray(result)) {
                setOrders(result);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error("Fetch Orders Error:", err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) {
            return;
        }

        try {
            const token = JSON.parse(localStorage.getItem('token'));
            let result = await fetch(`${API_BASE_URL}/order-cancel/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `bearer ${token}`
                }
            });
            result = await result.json();
            if (result.modifiedCount > 0) {
                alert("Order cancelled successfully!");
                getOrders(); // Reload order list
            } else {
                alert("Failed to cancel order.");
            }
        } catch (err) {
            console.error("Cancel Order Error:", err);
            alert("An error occurred while cancelling your order.");
        }
    };

    if (loading) {
        return (
            <div className="product-list-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <h2 style={{ color: 'var(--text-secondary)' }}>Loading Order History...</h2>
            </div>
        );
    }

    return (
        <div className="product-list-container" style={{ maxWidth: '900px' }}>
            <h1 style={{ marginBottom: '10px' }}>Order History</h1>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '40px' }}>
                View details of all your previous purchases.
            </p>

            {orders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {orders.map((order) => (
                        <div key={order._id} className="product-card" style={{ 
                            opacity: 1, 
                            animation: 'none', 
                            textAlign: 'left', 
                            padding: '25px 30px',
                            background: 'rgba(30, 41, 59, 0.4)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px'
                        }}>
                            {/* Order Header Info */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                flexWrap: 'wrap',
                                gap: '15px',
                                borderBottom: '1px solid var(--border-color)',
                                paddingBottom: '15px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Order ID
                                    </div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                        {order._id}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Date Placed
                                    </div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                        {new Date(order.orderDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                                <div>
                                    <span style={{ 
                                        background: order.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
                                        color: order.status === 'Cancelled' ? '#ef4444' : 'var(--success-color)', 
                                        border: order.status === 'Cancelled' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                                        padding: '5px 15px', 
                                        borderRadius: '20px', 
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        letterSpacing: '0.5px',
                                        marginRight: '10px',
                                        display: 'inline-block'
                                    }}>
                                        {order.status}
                                    </span>
                                    {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                                        <button
                                            onClick={() => cancelOrder(order._id)}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                color: '#ef4444',
                                                padding: '5px 15px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'var(--transition)'
                                            }}
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Order Product List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {order.products.map((item, index) => (
                                    <div key={index} style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        padding: '5px 0'
                                    }}>
                                        <div>
                                            <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>{item.name}</span>
                                            {item.company && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '10px' }}>by {item.company}</span>}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                            {item.quantity} x ₹{formatPrice(item.price)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Shipping Address Display */}
                            {order.shippingAddress && (
                                <div style={{ 
                                    padding: '12px 18px', 
                                    background: 'rgba(255, 255, 255, 0.02)', 
                                    borderRadius: '10px', 
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)',
                                    marginTop: '10px'
                                }}>
                                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '4px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        📍 Shipping Address
                                    </span>
                                    {order.shippingAddress}
                                </div>
                            )}

                            {/* Order Total Footer */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                borderTop: '1px solid var(--border-color)',
                                paddingTop: '15px',
                                marginTop: '10px'
                            }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Order Total</span>
                                <span style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                                    ₹{formatPrice(order.totalAmount)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-products" style={{ padding: '80px 20px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📦</div>
                    <h2>No Orders Found</h2>
                    <p style={{ margin: '10px 0 30px' }}>You haven't placed any orders yet.</p>
                    <Link to="/products" className="appButton" style={{ maxWidth: '250px', margin: '0 auto', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        Go Shopping
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Orders;
