import './App.css';
import Nav from './components/Nav';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import SignUp from './components/SignUp';
import PrivateComponent from './components/PrivateComponent';
import Login from './components/Login';  
import AddProduct from './components/AddProduct';
import ProductList from './components/ProductList';
import UpdateProduct from './components/UpdateProduct';
import Profile from './components/Profile';
import Cart from './components/Cart';
import Orders from './components/Orders';
import AdminDashboard from './components/AdminDashboard';
import AdminPrivateComponent from './components/AdminPrivateComponent';
import Home from './components/Home';

import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/AdminLayout';

function App() {
  const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  return (
    <div className="App">
      <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        {/* Routes that use the standard Customer Layout with Nav and Footer */}
        <Route element={<CustomerLayout />}>
          {/* Customer Private Routes */}
          <Route element={<PrivateComponent />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/add" element={<AddProduct />} />
            <Route path="/update/:id" element={<UpdateProduct />} />
            <Route path="/logout" element={<h1>Logout Component</h1>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
          </Route>
          
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Routes that use the separate Admin Layout */}
        <Route element={<AdminLayout />}>
          <Route element={<AdminPrivateComponent />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
