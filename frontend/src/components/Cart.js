import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [shippingAddress, setShippingAddress] = useState('');

    useEffect(() => {
        loadCart();
    }, []);

    const formatPrice = (price) => {
        if (!price) return "0.00";
        const clean = String(price).replace(/[₹$,]/g, '');
        const num = parseFloat(clean);
        return isNaN(num) ? "0.00" : num.toFixed(2);
    };

    const loadCart = () => {
        try {
            const cart = localStorage.getItem('cart');
            if (cart) {
                setCartItems(JSON.parse(cart));
            } else {
                setCartItems([]);
            }
        } catch (e) {
            console.error("Error reading cart", e);
            setCartItems([]);
        }
    };

    const updateQuantity = (id, delta) => {
        let cart = [...cartItems];
        cart = cart.map(item => {
            if (item._id === id) {
                const currentQty = item.quantity || 1;
                const newQty = currentQty + delta;
                return { ...item, quantity: newQty > 0 ? newQty : 1 };
            }
            return item;
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        setCartItems(cart);
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const removeFromCart = (id) => {
        let cart = cartItems.filter(item => item._id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        setCartItems(cart);
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const calculateTotal = () => {
        return cartItems.reduce((acc, item) => {
            const price = parseFloat(formatPrice(item.price)) || 0;
            const qty = item.quantity || 1;
            return acc + (price * qty);
        }, 0).toFixed(2);
    };

    const handleCheckout = async () => {
        const auth = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!auth || !token) {
            alert("Please log in to complete your purchase");
            return;
        }

        if (!shippingAddress.trim()) {
            alert("Please enter a shipping address before completing your purchase.");
            return;
        }

        const user = JSON.parse(auth);
        const parsedToken = JSON.parse(token);

        const orderData = {
            userId: user._id,
            products: cartItems.map(item => ({
                productId: item._id,
                name: item.name,
                price: item.price,
                company: item.company,
                category: item.category,
                quantity: item.quantity || 1
            })),
            totalAmount: parseFloat(calculateTotal()),
            shippingAddress: shippingAddress.trim()
        };

        try {
            let result = await fetch(`${API_BASE_URL}/place-order`, {
                method: 'POST',
                body: JSON.stringify(orderData),
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `bearer ${parsedToken}`
                }
            });
            result = await result.json();
            if (result && result._id) {
                // Clear cart locally
                localStorage.removeItem('cart');
                setCartItems([]);
                window.dispatchEvent(new Event('cartUpdated'));
                setShowSuccess(true);
            } else {
                alert("Checkout failed. Please try again.");
            }
        } catch (err) {
            console.error("Checkout Error:", err);
            alert("An error occurred during checkout. Please try again.");
        }
    };

    const totalAmount = calculateTotal();

    if (showSuccess) {
        return (
            <div className="product profile-container" style={{ maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '5rem', color: 'var(--success-color)', marginBottom: '20px', animation: 'scaleUp 0.5s ease-out' }}>🎉</div>
                <h1 style={{ marginBottom: '15px' }}>Purchase Successful!</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    Thank you for your order! Your items will be processed immediately. You can view your purchase history in your Orders dashboard.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <Link to="/orders" className="appButton" style={{ margin: 0, flex: 1, textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        View Orders
                    </Link>
                    <Link to="/products" className="appButton" style={{ margin: 0, flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', boxShadow: 'none', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="product-list-container" style={{ maxWidth: '900px' }}>
            <h1 style={{ marginBottom: '10px' }}>Shopping Cart</h1>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '40px' }}>
                {cartItems.length > 0 ? `You have ${cartItems.length} unique item(s) in your cart.` : 'Your shopping cart is currently empty.'}
            </p>

            {cartItems.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Cart Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {cartItems.map((item) => (
                            <div key={item._id} className="product-card" style={{ 
                                display: 'flex', 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                padding: '20px 25px', 
                                textAlign: 'left', 
                                gap: '20px',
                                opacity: 1,
                                animation: 'none'
                            }}>
                                <div style={{ flex: 2 }}>
                                    <span style={{ fontSize: '0.8rem', background: 'linear-gradient(135deg, var(--secondary-color), var(--primary-color))', padding: '4px 10px', borderRadius: '10px', color: 'white', fontWeight: '600' }}>
                                        {item.category}
                                    </span>
                                    <h3 style={{ margin: '10px 0 5px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{item.name}</h3>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>by {item.company}</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <button 
                                        onClick={() => updateQuantity(item._id, -1)}
                                        style={{ 
                                            background: 'rgba(255,255,255,0.05)', 
                                            border: '1px solid var(--border-color)', 
                                            color: 'var(--text-primary)', 
                                            width: '32px', 
                                            height: '32px', 
                                            borderRadius: '8px', 
                                            fontSize: '1.2rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'var(--transition)'
                                        }}
                                        className="qty-btn"
                                    >-</button>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>
                                        {item.quantity || 1}
                                    </span>
                                    <button 
                                        onClick={() => updateQuantity(item._id, 1)}
                                        style={{ 
                                            background: 'rgba(255,255,255,0.05)', 
                                            border: '1px solid var(--border-color)', 
                                            color: 'var(--text-primary)', 
                                            width: '32px', 
                                            height: '32px', 
                                            borderRadius: '8px', 
                                            fontSize: '1.2rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'var(--transition)'
                                        }}
                                        className="qty-btn"
                                    >+</button>
                                </div>

                                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                                        ₹{(parseFloat(formatPrice(item.price)) * (item.quantity || 1)).toFixed(2)}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        ₹{formatPrice(item.price)} each
                                    </span>
                                </div>

                                <div>
                                    <button 
                                        onClick={() => removeFromCart(item._id)}
                                        className="action-btn delete-btn"
                                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="product-card" style={{ 
                        opacity: 1, 
                        animation: 'none', 
                        alignSelf: 'flex-end', 
                        width: '100%', 
                        maxWidth: '400px', 
                        padding: '30px', 
                        textAlign: 'left',
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))'
                    }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '15px' }}>Order Summary</h2>
                        
                        {/* Shipping Address Textarea */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                📍 Shipping Address
                            </label>
                            <textarea 
                                placeholder="Enter your full home or office delivery address..." 
                                value={shippingAddress}
                                onChange={(e) => setShippingAddress(e.target.value)}
                                style={{
                                    width: '100%',
                                    minHeight: '80px',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    resize: 'vertical',
                                    transition: 'var(--transition)',
                                    fontFamily: 'inherit',
                                    lineHeight: '1.4'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                            <span>Subtotal</span>
                            <span>₹{totalAmount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-secondary)' }}>
                            <span>Shipping</span>
                            <span style={{ color: 'var(--success-color)', fontWeight: '600' }}>FREE</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: '700', borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginBottom: '25px' }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--primary-color)' }}>₹{totalAmount}</span>
                        </div>
                        <button onClick={handleCheckout} className="appButton" style={{ margin: 0 }}>
                            Proceed to Buy
                        </button>
                    </div>
                </div>
            ) : (
                <div className="no-products" style={{ padding: '80px 20px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛒</div>
                    <h2>Your Cart is Empty</h2>
                    <p style={{ margin: '10px 0 30px' }}>Check out our dynamic items and add something to your list!</p>
                    <Link to="/products" className="appButton" style={{ maxWidth: '250px', margin: '0 auto', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        Browse Products
                    </Link>
                </div>
            )}
        </div>
    );
}

export default Cart;
