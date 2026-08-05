import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import API_BASE_URL from '../config';

const UpdateProduct = () => {
    const [name, setName] = React.useState('');
    const [price, setPrice] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [company, setCompany] = React.useState('');
    const [error, setError] = React.useState(false);
    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        getProductDetails();
    }, []);

    const getProductDetails = async () => {
        try {
            let result = await fetch(`${API_BASE_URL}/product/${params.id}`, {
                headers: {
                    authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });
            result = await result.json();
            if (result) {
                setName(result.name);
                setPrice(result.price);
                setCategory(result.category);
                setCompany(result.company);
            }
        } catch (err) {
            console.error("Get Product Details Error:", err);
            alert(`Failed to fetch product details from ${API_BASE_URL}. Error: ${err.message}`);
        }
    }

    const updateProduct = async () => {
        // Prevent empty strings from overriding valid inputs
        if (!name || !price || !company || !category) {
            setError(true);
            return false;
        }

        // Sanitize price (remove currency symbol or commas if any)
        const cleanPrice = String(price).replace(/[₹$,]/g, '');
        const parsedPrice = parseFloat(cleanPrice);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            setError(true);
            alert("Please enter a valid numeric price");
            return false;
        }

        try {
            console.warn(name, price, category, company);
            let result = await fetch(`${API_BASE_URL}/product/${params.id}`, {
                method: 'Put',
                body: JSON.stringify({ name, price: parsedPrice.toFixed(2), category, company }),
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });
            result = await result.json();
            console.warn(result);
            if (result) {
                const auth = localStorage.getItem('user');
                const user = auth ? JSON.parse(auth) : null;
                if (user && user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            console.error("Update Product Error:", err);
            alert(`Failed to update product at ${API_BASE_URL}. Error: ${err.message}`);
        }
    }


    return (
        <div className='product'>
            <h1>Update Product</h1>
            <input type="text" placeholder='Enter product name' className='inputBox'
                value={name} onChange={(e) => { setName(e.target.value) }}
            />
            {error && !name && <span className='invalid-input'>Enter valid name</span>}

            <input type="number" step="0.01" min="0" placeholder='Enter product price' className='inputBox'
                value={price} onChange={(e) => { setPrice(e.target.value) }}
            />
            {error && !price && <span className='invalid-input'>Enter valid price</span>}

            <input type="text" placeholder='Enter product category' className='inputBox'
                value={category} onChange={(e) => { setCategory(e.target.value) }}
            />
            {error && !category && <span className='invalid-input'>Enter valid category</span>}

            <input type="text" placeholder='Enter product company' className='inputBox'
                value={company} onChange={(e) => { setCompany(e.target.value) }}
            />
            {error && !company && <span className='invalid-input'>Enter valid company</span>}

            <button onClick={updateProduct} className='appButton'>Update Product</button>
        </div>
    )
}

export default UpdateProduct;
