import React from 'react';
import { useNavigate } from 'react-router-dom';

import API_BASE_URL from '../config';

const AddProduct = () => {
    const [name, setName] = React.useState('');
    const [price, setPrice] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [company, setCompany] = React.useState('');
    const [error, setError] = React.useState(false);
    const navigate = useNavigate();

    const addProduct = async () => {
        if (!name || !price || !category || !company) {
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

        const userId = JSON.parse(localStorage.getItem('user'))._id;
        try {
            let result = await fetch(`${API_BASE_URL}/add-product`, {
                method: "post",
                body: JSON.stringify({ name, price: parsedPrice.toFixed(2), category, company, userId }),
                headers: {
                    "Content-Type": "application/json",
                    authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`
                }
            });
            result = await result.json();
            console.warn(result);
            if (result) {
                alert("Product is added");
                const auth = localStorage.getItem('user');
                const user = auth ? JSON.parse(auth) : null;
                if (user && user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            console.error("Add Product Error:", err);
            alert(`Failed to add product at ${API_BASE_URL}. Error: ${err.message}. Please ensure the backend is running.`);
        }
    }


    return (
        <div className='product'>
            <h1>Add Product</h1>
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

            <button onClick={addProduct} className='appButton'>Add Product</button>
        </div>
    )
}

export default AddProduct;
