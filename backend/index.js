require('dotenv').config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require('./db/config');
const User = require("./db/User");
const Product = require("./db/Product");
const Order = require("./db/Order");
const bcrypt = require("bcryptjs");
const Jwt = require('jsonwebtoken');
const jwtKey = 'e-comm';
const app = express();

app.use(express.json());
app.use(cors({
    origin: "*", // Allow all origins for dev; tighten for production
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Root route for connection health check
app.get("/", (req, res) => {
    res.send({ status: "Backend is running!", time: new Date().toISOString() });
});

// Logging middleware to track requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});


// Serve static images
app.use('/uploads', express.static('uploads'));

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // unique filename
    }
});

const upload = multer({ storage: storage });

// API to upload image and update User in DB
app.post("/upload-profile/:id", verifyToken, upload.single('profileImage'), async (req, resp) => {
    try {
        if (!req.file) {
            return resp.status(400).send({ result: "Please upload a file" });
        }
        
        // Use dynamic host for production (Render) instead of hardcoding localhost
        let imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        
        let result = await User.updateOne(
            { _id: req.params.id },
            { $set: { profileImage: imageUrl } }
        );

        if(result.modifiedCount > 0){
             resp.send({ result: "Image uploaded successfully", profileImage: imageUrl });
        } else {
             resp.status(404).send({ result: "User not found or nothing changed" });
        }
    } catch (error) {
        resp.status(500).send({ result: "Internal Server Error", error });
    }
});

app.get("/user/:id", verifyToken, async (req, resp) => {
    let result = await User.findOne({ _id: req.params.id }).select("-password");
    if (result) {
        resp.send(result);
    } else {
        resp.send({ result: "User not found" });
    }
});

app.put("/user/:id", verifyToken, async (req, resp) => {
    try {
        let result = await User.updateOne(
            { _id: req.params.id },
            { $set: req.body }
        );
        resp.send(result);
    } catch (error) {
        resp.status(500).send({ result: "Internal Server Error", error });
    }
});

app.post("/register", async (req, resp) => {
    try {
        if (!req.body.email || !req.body.password || !req.body.name) {
            return resp.status(400).send({ result: "Missing required fields" });
        }

        const email = req.body.email.trim().toLowerCase();
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return resp.status(400).send({ result: "Email already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        let user = new User({
            name: req.body.name.trim(),
            email: email,
            password: hashedPassword,
            role: req.body.role || 'user'
        });

        let result = await user.save();
        result = result.toObject();
        delete result.password;

        Jwt.sign({ user: result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
            if (err) {
                return resp.status(500).send({ result: "Something went wrong, Please try after sometime" });
            }
            resp.send({ user: result, auth: token });
        });
    } catch (error) {
        resp.status(500).send({ result: "Registration failed", error });
    }
});

app.post("/login", async (req, resp)=>{
    console.log(req.body);
    if (req.body.password && req.body.email) {
        const email = req.body.email.trim().toLowerCase();
        const password = req.body.password;

        // Hardcoded admin login logic
        if (email === 'debashishalder10@gmail.com' && password === 'debashishalder10') {
            let user = await User.findOne({ email });
            if (!user) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                user = new User({
                    name: "Admin Debashis",
                    email: email,
                    password: hashedPassword,
                    role: 'admin'
                });
                await user.save();
            } else {
                let isMatch = false;
                try { isMatch = await bcrypt.compare(password, user.password); } catch (e) {}
                const isPlainMatch = user.password === password;
                
                if (user.role !== 'admin' || (!isMatch && !isPlainMatch)) {
                    const salt = await bcrypt.genSalt(10);
                    user.role = 'admin';
                    user.password = await bcrypt.hash(password, salt);
                    await user.save();
                } else if (isPlainMatch) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(password, salt);
                    await user.save();
                }
            }
            
            user = user.toObject();
            delete user.password;

            Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    return resp.status(500).send({ result: "Something went wrong, Please try after sometime" });
                }
                resp.send({ user, auth: token });
            });
            return;
        }

        // Standard user login
        let user = await User.findOne({ email });
        if (user) {
            let isMatch = false;
            try { isMatch = await bcrypt.compare(password, user.password); } catch (e) {}
            const isPlainMatch = user.password === password;

            if (isMatch || isPlainMatch) {
                if (isPlainMatch) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(password, salt);
                    await user.save();
                }
                
                user = user.toObject();
                delete user.password;
                
                Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                    if (err) {
                        return resp.status(500).send({ result: "Something went wrong, Please try after sometime" });
                    }
                    resp.send({ user, auth: token });
                });
            } else {
                resp.send({ result: 'No User Found' });
            }
        } else {
            resp.send({ result: 'No User Found' });
        }
    } else {
        resp.send({ result: 'No User Found' });
    }
});

app.post("/reset-password", async (req, resp) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return resp.status(400).send({ result: "Email and new password are required" });
        }
        
        let user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return resp.status(404).send({ result: "User with this email not found" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        resp.send({ result: "Password reset successful. You can now login with your new password." });
    } catch (error) {
        resp.status(500).send({ result: "Failed to reset password", error });
    }
});

function verifyToken(req, resp, next) {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1];
        Jwt.verify(token, jwtKey, (err, valid) => {
            if (err) {
                resp.status(401).send({ result: "Please provide valid token" })
            } else {
                req.user = valid.user;
                next();
            }
        })
    } else {
        resp.status(403).send({ result: "Please add token with header" })
    }
}

function verifyAdmin(req, resp, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        resp.status(403).send({ result: "Access Denied: Admin privileges required" });
    }
}

app.post("/add-product", verifyToken, async (req, resp)=>{
    let product = new Product(req.body);
    let result = await product.save();
    resp.send(result)
})

app.get("/products", verifyToken, async (req, resp)=>{
    let products = await Product.find();
    if(products.length>0){
        resp.send(products)
    }else{
        resp.send({result:"No Products found"})
    }
})

app.delete("/product/:id", verifyToken, async (req, resp) => {
    let result = await Product.deleteOne({ _id: req.params.id });
    resp.send(result);
});

app.get("/product/:id", verifyToken, async (req, resp) => {
    let result = await Product.findOne({ _id: req.params.id });
    if(result) {
        resp.send(result)
    } else {
        resp.send({result: "No Record Found"})
    }
});

app.put("/product/:id", verifyToken, async (req, resp) => {
    let result = await Product.updateOne(
        { _id: req.params.id },
        { $set: req.body }
    );
    resp.send(result);
});

app.get("/search/:key", verifyToken, async (req, resp) => {
    // Utilize $or condition and $regex for flexible substring matching across multiple fields
    let result = await Product.find({
        "$or": [
            { name: { $regex: req.params.key, $options: 'i' } },
            { company: { $regex: req.params.key, $options: 'i' } },
            { category: { $regex: req.params.key, $options: 'i' } }
        ]
    });
    resp.send(result);
});

// API to place an order
app.post("/place-order", verifyToken, async (req, resp) => {
    try {
        const order = new Order(req.body);
        const result = await order.save();
        resp.send(result);
    } catch (error) {
        resp.status(500).send({ result: "Failed to place order", error });
    }
});

// API to get all orders of a user
app.get("/orders/:userId", verifyToken, async (req, resp) => {
    try {
        const result = await Order.find({ userId: req.params.userId }).sort({ orderDate: -1 });
        resp.send(result);
    } catch (error) {
        resp.status(500).send({ result: "Failed to fetch orders", error });
    }
});

// API to cancel an order by a user
app.put("/order-cancel/:id", verifyToken, async (req, resp) => {
    try {
        const result = await Order.updateOne(
            { _id: req.params.id },
            { $set: { status: 'Cancelled' } }
        );
        resp.send(result);
    } catch (error) {
        resp.status(500).send({ result: "Failed to cancel order", error });
    }
});

// Admin Stats Endpoint
app.get("/admin/stats", verifyToken, verifyAdmin, async (req, resp) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        
        const orders = await Order.find();
        const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const recentOrders = await Order.find().sort({ orderDate: -1 }).limit(5);

        resp.send({
            totalProducts,
            totalUsers,
            totalOrders,
            totalSales,
            recentOrders
        });
    } catch (error) {
        resp.status(500).send({ result: "Failed to fetch admin stats", error });
    }
});

// Admin Get All Orders Endpoint
app.get("/admin/orders", verifyToken, verifyAdmin, async (req, resp) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        resp.send(orders);
    } catch (error) {
        resp.status(500).send({ result: "Failed to fetch all orders", error });
    }
});

// Admin Update Order Status Endpoint
app.put("/admin/order-status/:id", verifyToken, verifyAdmin, async (req, resp) => {
    try {
        const { status } = req.body;
        const result = await Order.updateOne(
            { _id: req.params.id },
            { $set: { status } }
        );
        resp.send(result);
    } catch (error) {
        resp.status(500).send({ result: "Failed to update order status", error });
    }
});

// Admin Get All Users Endpoint
app.get("/admin/users", verifyToken, verifyAdmin, async (req, resp) => {
    try {
        const users = await User.find().select("-password");
        resp.send(users);
    } catch (error) {
        resp.status(500).send({ result: "Failed to fetch users", error });
    }
});

// Admin Delete User Endpoint
app.delete("/admin/user/:id", verifyToken, verifyAdmin, async (req, resp) => {
    try {
        let result = await User.deleteOne({ _id: req.params.id });
        resp.send(result);
    } catch (error) {
        resp.status(500).send({ result: "Failed to delete user", error });
    }
});

// Admin Update User Role Endpoint
app.put("/admin/user-role/:id", verifyToken, verifyAdmin, async (req, resp) => {
    try {
        const { role } = req.body;
        let result = await User.updateOne(
            { _id: req.params.id },
            { $set: { role } }
        );
        resp.send(result);
    } catch (error) {
        resp.status(500).send({ result: "Failed to update user role", error });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});