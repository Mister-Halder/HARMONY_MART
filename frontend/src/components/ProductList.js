import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import API_BASE_URL from '../config';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [masterProducts, setMasterProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState(1000);
    const [maxCatalogPrice, setMaxCatalogPrice] = useState(1000);
    const navigate = useNavigate();

    const auth = localStorage.getItem('user');
    let user = null;
    try {
        user = auth ? JSON.parse(auth) : null;
    } catch (e) {
        user = null;
    }

    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = async () => {
        let token = "";
        try {
            const storedToken = localStorage.getItem('token');
            token = storedToken ? JSON.parse(storedToken) : "";
        } catch (e) {
            console.error("Error parsing token", e);
        }

        try {
            let result = await fetch(`${API_BASE_URL}/products`, {
                headers: {
                    authorization: `bearer ${token}`
                }
            });
            result = await result.json();
            if (Array.isArray(result)) {
                setProducts(result);
                setMasterProducts(result);
                
                // Dynamically calculate the maximum catalog price
                const prices = result.map(p => {
                    const clean = String(p.price).replace(/[₹$,]/g, '');
                    const num = parseFloat(clean);
                    return isNaN(num) ? 0 : num;
                });
                const calculatedMax = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
                setMaxCatalogPrice(calculatedMax);
                setPriceRange(calculatedMax); // Set default range filter to max catalog value
                
                applyFilters(searchTerm, selectedCategory, calculatedMax, result);
            } else {
                setProducts([]);
                setMasterProducts([]);
            }
        } catch (err) {
            console.error("Fetch Products Error:", err);
            setProducts([]);
            setMasterProducts([]);
        }
    }

    const deleteProduct = async (id) => {
        try {
            let result = await fetch(`${API_BASE_URL}/product/${id}`, {
                method: "Delete",
                headers: {
                    authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });
            result = await result.json();
            if (result) {
                getProducts(); // Refetch after successful deletion
            }
        } catch (err) {
            console.error("Delete Product Error:", err);
            alert(`Failed to delete product at ${API_BASE_URL}. Error: ${err.message}`);
        }
    }

    const applyFilters = (searchVal, categoryVal, priceVal, rawProducts = masterProducts) => {
        let filtered = [...rawProducts];

        // 1. Category Filter
        if (categoryVal && categoryVal !== 'All') {
            filtered = filtered.filter(p => p.category === categoryVal);
        }

        // 2. Text Search Filter
        if (searchVal) {
            const lowKey = searchVal.toLowerCase();
            filtered = filtered.filter(p => 
                (p.name && p.name.toLowerCase().includes(lowKey)) ||
                (p.company && p.company.toLowerCase().includes(lowKey)) ||
                (p.category && p.category.toLowerCase().includes(lowKey))
            );
        }

        // 3. Price Filter (show products with price <= priceVal)
        if (priceVal !== undefined) {
            filtered = filtered.filter(p => {
                const clean = String(p.price).replace(/[₹$,]/g, '');
                const num = parseFloat(clean);
                const itemPrice = isNaN(num) ? 0 : num;
                return itemPrice <= priceVal;
            });
        }

        setProducts(filtered);
    };

    const searchHandle = (event) => {
        const val = event.target.value;
        setSearchTerm(val);
        applyFilters(val, selectedCategory, priceRange);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        applyFilters(searchTerm, category, priceRange);
    };

    const handlePriceChange = (event) => {
        const val = parseFloat(event.target.value);
        setPriceRange(val);
        applyFilters(searchTerm, selectedCategory, val);
    };

    const clearSearch = () => {
        setSearchTerm('');
        applyFilters('', selectedCategory, priceRange);
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

    const formatPrice = (price) => {
        if (!price) return "0.00";
        const clean = String(price).replace(/[₹$,]/g, '');
        const num = parseFloat(clean);
        return isNaN(num) ? "0.00" : num.toFixed(2);
    };

    const uniqueCategories = ['All', ...new Set(masterProducts.map(p => p.category).filter(Boolean))];

    return (
        <div className="product-list-container">
            <h1>Products Dashboard</h1>
            
            {user && user.role === 'admin' && (
                <div style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px dashed var(--primary-color)',
                    padding: '15px 20px',
                    borderRadius: '12px',
                    maxWidth: '600px',
                    margin: '0 auto 25px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        👑 You are logged in as <strong>Administrator</strong>. Access the management tools here:
                    </span>
                    <button 
                        onClick={() => navigate('/admin')}
                        style={{
                            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Go to Admin Dashboard
                    </button>
                </div>
            )}

            {/* Beautiful Custom Search Section */}
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '30px',
                maxWidth: '850px',
                margin: '0 auto 40px',
                boxShadow: 'var(--glass-shadow)',
                backdropFilter: 'blur(12px)',
                textAlign: 'center'
            }}>
                <h2 style={{
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                    background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                }}>
                    🔍 What are you looking for today?
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
                    Search by name, brand, category, or filter immediately by price!
                </p>

                {/* Glassmorphic Search Bar */}
                <div style={{ position: 'relative', maxWidth: '650px', margin: '0 auto 25px' }}>
                    <span style={{
                        position: 'absolute',
                        left: '18px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-secondary)',
                        fontSize: '1.1rem',
                        pointerEvents: 'none'
                    }}>
                        🔍
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search products by name, company, or category..." 
                        onChange={searchHandle}
                        value={searchTerm}
                        style={{ 
                            width: '100%', 
                            padding: '16px 50px 16px 48px', 
                            margin: 0,
                            borderRadius: '30px',
                            border: '1px solid var(--border-color)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            color: 'var(--text-primary)',
                            fontSize: '1.05rem',
                            outline: 'none',
                            transition: 'var(--transition)',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    />
                    {searchTerm && (
                        <button 
                            onClick={clearSearch}
                            style={{
                                position: 'absolute',
                                right: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'var(--transition)'
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Quick Filters Chips */}
                {uniqueCategories.length > 1 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', alignItems: 'center', marginTop: '15px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginRight: '5px', fontWeight: '600' }}>Filters:</span>
                        {uniqueCategories.map((category) => {
                            const isActive = selectedCategory === category;
                            return (
                                <button
                                    key={category}
                                    onClick={() => handleCategorySelect(category)}
                                    style={{
                                        background: isActive 
                                            ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' 
                                            : 'rgba(255, 255, 255, 0.04)',
                                        border: isActive ? 'none' : '1px solid var(--border-color)',
                                        color: isActive ? 'white' : 'var(--text-secondary)',
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'var(--transition)',
                                        boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                                    }}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Dynamic Price Filter Slider */}
                {masterProducts.length > 0 && (
                    <div style={{
                        marginTop: '25px',
                        paddingTop: '20px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        maxWidth: '550px',
                        margin: '25px auto 0 auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                💵 Max Price Limit:
                            </span>
                            <span style={{ 
                                color: 'var(--primary-color)', 
                                fontSize: '1rem', 
                                fontWeight: '800',
                                background: 'rgba(99, 102, 241, 0.15)',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                border: '1px solid rgba(99, 102, 241, 0.3)'
                            }}>
                                Up to ₹{priceRange.toFixed(2)}
                            </span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max={maxCatalogPrice || 1000} 
                            step="1"
                            value={priceRange} 
                            onChange={handlePriceChange}
                            style={{
                                width: '100%',
                                height: '6px',
                                borderRadius: '5px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                outline: 'none',
                                cursor: 'pointer',
                                marginTop: '5px'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '6px' }}>
                            <span>₹0.00</span>
                            <span>Max Item Limit: ₹{maxCatalogPrice.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                {/* Search Meta Info Dynamic Count */}
                <div style={{ marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {products.length === masterProducts.length ? (
                        <span>Showing all <strong>{products.length}</strong> premium catalog products</span>
                    ) : (
                        <span>Found <strong>{products.length}</strong> matching products out of <strong>{masterProducts.length}</strong></span>
                    )}
                </div>
            </div>
            
            <div className="product-grid">
                {
                    products.length > 0 ? products.map((item, index) =>
                        <div key={item._id} className="product-card" style={{animationDelay: `${index * 0.05}s`}}>
                            <div className="product-badge">{item.category}</div>
                            <h3 className="product-name">{item.name}</h3>
                            <div className="product-price">₹{formatPrice(item.price)}</div>
                            <div className="product-company">by <span>{item.company}</span></div>
                            
                            {/* Purchase Actions */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <button 
                                    onClick={() => addToCart(item)} 
                                    className="action-btn"
                                    style={{ 
                                        background: 'rgba(255, 255, 255, 0.05)', 
                                        border: '1px solid var(--border-color)', 
                                        color: 'var(--text-primary)',
                                        fontSize: '0.9rem',
                                        padding: '12px 10px'
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
                                        fontSize: '0.9rem',
                                        padding: '12px 10px',
                                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
                                    }}
                                >
                                    Buy Now
                                </button>
                            </div>

                            {/* Inventory Actions */}
                            {user && user.role === 'admin' && (
                                <div className="product-actions" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '15px' }}>
                                    <button onClick={() => deleteProduct(item._id)} className="action-btn delete-btn" style={{ fontSize: '0.85rem', padding: '8px' }}>Delete</button>
                                    <Link to={`/update/${item._id}`} className="action-btn edit-btn" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.85rem', padding: '8px' }}>Edit</Link>
                                </div>
                            )}
                        </div>
                    )
                    : <div className="no-products">
                        <h2>No Products Found</h2>
                        <p>Get started by adding some products to your inventory.</p>
                      </div>
                }
            </div>
        </div>
    )
}

export default ProductList;
