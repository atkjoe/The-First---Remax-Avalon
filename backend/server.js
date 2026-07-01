const dns = require("dns");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const app = express();
const ROOT_DIR = path.join(__dirname, "..");
const FRONTEND_DIR = path.join(ROOT_DIR, "frontend");
const FRONTEND_DIST = path.join(FRONTEND_DIR, "dist");
const UPLOADS_DIR = path.join(FRONTEND_DIR, "uploads");

/* ================= PORT ================= */

const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.use(express.static(FRONTEND_DIST));
app.use("/uploads", express.static(UPLOADS_DIR));

/* ================= DB CONNECTION ================= */
       
           // Force Node.js to use Google's public DNS servers for resolving MongoDB hostnames
// This fixes the querySrv ECONNREFUSED error caused by local loopback (127.0.0.1) DNS configurations.
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (err) {
  console.warn("Could not set DNS servers programmatically:", err.message);
}

// Force Node.js to resolve IPv4 addresses first
dns.setDefaultResultOrder("ipv4first");


const connectDB = async () => {
  try {
    const url = "mongodb+srv://admin:OEw85q84QYRPkEbH@cluster0.r9msugv.mongodb.net/the-first-remax?retryWrites=true&w=majority";
    await mongoose.connect(url);
    console.log("Database connected");
  } catch (e) {
    console.log(e.message);
  }
};
    connectDB()        

/* ================= USERS ================= */

const users = [
    { name: "Mostafa", idCode: "#1", role: "admin" },
    { name: "Rahma", idCode: "#2", role: "admin" },
    { name: "Youssef", idCode: "#221204#", role: "superadmin" }
];

/* ================= JWT ================= */

const SECRET = "REMAX_SECRET";

/* ================= MODELS ================= */

const Property = mongoose.model("Property", new mongoose.Schema({
    title: String,
    type: String,
    price: Number,
    beds: Number,
    baths: Number,
    area: Number,
    image: String
}));

const Request = mongoose.model("Request", new mongoose.Schema({
    location: String,
    budget: Number,
    type: String,
    bedrooms: Number,
    notes: String,
    createdAt: { type: Date, default: Date.now }
}));

const SellRequest = mongoose.model("SellRequest", new mongoose.Schema({
    name: String,
    phone: String,
    address: String,
    type: String,
    area: Number,
    bedrooms: Number,
    bathrooms: Number,
    price: Number,
    status: { type: String, default: "new" },
    createdAt: { type: Date, default: Date.now }
}));

/* ================= AUTH ================= */

app.post("/api/login", (req, res) => {

    const { name, idCode } = req.body;

    const user = users.find(u => u.name === name && u.idCode === idCode);

    if (!user) {
        return res.status(401).json({ message: "Invalid login" });
    }

    const token = jwt.sign(
        { name: user.name, role: user.role },
        SECRET,
        { expiresIn: "1d" }
    );

    res.json({ user, token });
});

/* ================= AUTH MIDDLEWARE ================= */

function auth(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    try {
        req.user = jwt.verify(token, SECRET);
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid token" });
    }
}

function adminOnly(req, res, next) {
    if (req.user.role === "admin" || req.user.role === "superadmin") {
        next();
    } else {
        res.status(403).json({ message: "Admins only" });
    }
}

function superAdminOnly(req, res, next) {
    if (req.user.role === "superadmin") {
        next();
    } else {
        res.status(403).json({ message: "Super admin only" });
    }
}

/* ================= UPLOAD ================= */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

/* ================= PROPERTIES ================= */

app.get("/api/properties", async (req, res) => {
    try {
        const data = await Property.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/properties", auth, adminOnly, upload.single("image"), async (req, res) => {
    try {
        const property = new Property({
            ...req.body,
            image: req.file ? "/uploads/" + req.file.filename : ""
        });

        await property.save();
        res.json(property);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ================= REQUESTS ================= */

app.get("/api/requests", auth, adminOnly, async (req, res) => {
    const data = await Request.find();
    res.json(data);
});

app.post("/api/requests", async (req, res) => {
    const r = new Request(req.body);
    await r.save();
    res.json(r);
});

/* ================= SELL REQUESTS ================= */

app.get("/api/sell-requests", auth, superAdminOnly, async (req, res) => {
    const data = await SellRequest.find();
    res.json(data);
});

app.post("/api/sell-requests", async (req, res) => {
    const s = new SellRequest(req.body);
    await s.save();
    res.json(s);
});

/* ================= DASHBOARD ================= */

app.get("/api/dashboard", auth, adminOnly, async (req, res) => {

    const properties = await Property.countDocuments();
    const requests = await Request.countDocuments();
    const sell = await SellRequest.countDocuments();

    res.json({ properties, requests, sell });
});

/* ================= REACT APP ================= */

app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
        return res.status(404).json({ message: "API route not found" });
    }

    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

/* ================= START ================= */

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
