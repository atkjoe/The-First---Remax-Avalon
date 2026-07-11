const dns = require("dns");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { getAdminContact, getAdminNameVariants, matchesAdminName, publicUser, users } = require("./adminDirectory");

require("dotenv").config();

const app = express();
mongoose.set("bufferCommands", false);

const ROOT_DIR = path.join(__dirname, "..");
const FRONTEND_DIR = path.join(ROOT_DIR, "frontend");
const FRONTEND_DIST = fs.existsSync(path.join(ROOT_DIR, "dist"))
    ? path.join(ROOT_DIR, "dist")
    : path.join(FRONTEND_DIR, "dist");
const UPLOADS_DIR = path.join(FRONTEND_DIR, "uploads");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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


let dbConnectionPromise;

const connectDB = async () => {
    const url = process.env.MONGODB_URI;
    if (!url) {
        throw new Error("MONGODB_URI environment variable is missing");
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!dbConnectionPromise) {
        dbConnectionPromise = mongoose.connect(url, {
            connectTimeoutMS: 8000,
            serverSelectionTimeoutMS: 8000,
            maxPoolSize: 5
        }).then(() => {
            console.log("Database connected");
            return mongoose.connection;
        }).catch((error) => {
            dbConnectionPromise = null;
            throw error;
        });
    }

    return dbConnectionPromise;
};

connectDB().catch((error) => {
    console.error("Database connection failed:", error.message);
});

async function requireDatabase(req, res, next) {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(503).json({
            message: `Database connection failed: ${error.message}`
        });
    }
}

/* ================= USERS ================= */

/* ================= JWT ================= */

const SECRET = process.env.JWT_SECRET || "REMAX_LOCAL_SECRET";

/* ================= MODELS ================= */

const Property = mongoose.models.Property || mongoose.model("Property", new mongoose.Schema({
    title: String,
    type: String,
    price: Number,
    beds: Number,
    baths: Number,
    area: Number,
    image: String,
    notes: String,
    listedBy: String,
    listedByRole: String,
    contactPhone: String,
    contactWhatsapp: String,
    createdAt: { type: Date, default: Date.now }
}));

const Request = mongoose.models.Request || mongoose.model("Request", new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    requesterType: { type: String, enum: ["Broker", "Client"], required: true },
    location: { type: String, required: true },
    budget: { type: Number, required: true },
    type: String,
    bedrooms: Number,
    notes: String,
    createdAt: { type: Date, default: Date.now }
}));

const SellRequest = mongoose.models.SellRequest || mongoose.model("SellRequest", new mongoose.Schema({
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

const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", new mongoose.Schema({
    owner: { type: String, required: true, index: true },
    clientName: String,
    clientPhone: String,
    propertyTitle: String,
    scheduledAt: { type: Date, required: true },
    reminderMinutesBefore: { type: Number, default: 30 },
    notes: String,
    createdAt: { type: Date, default: Date.now }
}));

const ClientNote = mongoose.models.ClientNote || mongoose.model("ClientNote", new mongoose.Schema({
    owner: { type: String, required: true, index: true },
    clientName: String,
    clientPhone: String,
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}));

/* ================= AUTH ================= */

app.post("/api/login", (req, res) => {

    const { name, idCode } = req.body;

    const user = users.find((u) => matchesAdminName(u, name) && u.idCode === idCode);

    if (!user) {
        return res.status(401).json({ message: "Invalid login" });
    }

    const token = jwt.sign(
        { name: user.name, role: user.role },
        SECRET,
        { expiresIn: "1d" }
    );

    res.json({ user: publicUser(user), token });
});

app.use("/api", requireDatabase);

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

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image uploads are allowed"));
        }
        cb(null, true);
    }
});

function handleUploadError(err, req, res, next) {
    if (!err) {
        return next();
    }

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Image must be 5MB or smaller" });
    }

    return res.status(400).json({ message: err.message || "Image upload failed" });
}

function uploadImageToCloudinary(file) {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error("Cloudinary environment variables are missing");
    }

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: process.env.CLOUDINARY_FOLDER || "remax-avalon/properties",
                resource_type: "image"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            }
        );

        stream.end(file.buffer);
    });
}

/* ================= PROPERTIES ================= */

app.get("/api/properties", async (req, res) => {
    try {
        const data = await Property.find();
        res.json(data.map((property) => {
            const item = property.toObject();
            const contact = getAdminContact(item.listedBy);
            return {
                ...item,
                listedBy: contact.name,
                listedByRole: item.listedByRole || contact.role,
                contactPhone: item.contactPhone || contact.phone,
                contactWhatsapp: item.contactWhatsapp || contact.whatsapp
            };
        }));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/properties", auth, adminOnly, upload.single("image"), handleUploadError, async (req, res) => {
    try {
        const contact = getAdminContact(req.user.name);
        const imageUpload = req.file ? await uploadImageToCloudinary(req.file) : null;
        const property = new Property({
            ...req.body,
            listedBy: contact.name,
            listedByRole: contact.role,
            contactPhone: contact.phone,
            contactWhatsapp: contact.whatsapp,
            image: imageUpload?.secure_url || ""
        });

        await property.save();
        res.json(property);
    } catch (err) {
        res.status(500).json({ message: err.message ,error:err });
    }
});

app.delete("/api/properties/:id", auth, superAdminOnly, async (req, res) => {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json({ ok: true });
});

/* ================= REQUESTS ================= */

app.get("/api/requests", auth, adminOnly, async (req, res) => {
    const data = await Request.find();
    res.json(data);
});

app.post("/api/requests", async (req, res) => {
    try {
        const { name, phone, requesterType, location, budget } = req.body;
        if (!name || !phone || !requesterType || !location || !budget) {
            return res.status(400).json({ message: "Name, phone, requester type, location, and budget are required" });
        }
        const r = new Request(req.body);
        await r.save();
        res.json(r);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete("/api/requests/:id", auth, superAdminOnly, async (req, res) => {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Buyer request not found" });
    res.json({ ok: true });
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

app.delete("/api/sell-requests/:id", auth, superAdminOnly, async (req, res) => {
    const sellRequest = await SellRequest.findByIdAndDelete(req.params.id);
    if (!sellRequest) return res.status(404).json({ message: "Sell request not found" });
    res.json({ ok: true });
});

/* ================= DASHBOARD ================= */

app.get("/api/dashboard", auth, adminOnly, async (req, res) => {

    const properties = await Property.countDocuments();
    const requests = await Request.countDocuments();
    const sell = await SellRequest.countDocuments();
    const ownerNames = getAdminNameVariants(req.user.name);
    const appointments = await Appointment.countDocuments({ owner: { $in: ownerNames } });
    const clientNotes = await ClientNote.countDocuments({ owner: { $in: ownerNames } });

    res.json({ properties, requests, sell, appointments, clientNotes });
});

/* ================= APPOINTMENTS ================= */

app.get("/api/appointments", auth, adminOnly, async (req, res) => {
    const data = await Appointment.find({ owner: { $in: getAdminNameVariants(req.user.name) } }).sort({ scheduledAt: 1 });
    res.json(data);
});

app.post("/api/appointments", auth, adminOnly, async (req, res) => {
    const appointment = new Appointment({
        ...req.body,
        owner: req.user.name
    });
    await appointment.save();
    res.json(appointment);
});

app.put("/api/appointments/:id", auth, adminOnly, async (req, res) => {
    const { owner, ...updates } = req.body;
    const appointment = await Appointment.findOneAndUpdate(
        { _id: req.params.id, owner: { $in: getAdminNameVariants(req.user.name) } },
        updates,
        { new: true }
    );
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
});

app.delete("/api/appointments/:id", auth, adminOnly, async (req, res) => {
    const appointment = await Appointment.findOneAndDelete({ _id: req.params.id, owner: { $in: getAdminNameVariants(req.user.name) } });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json({ ok: true });
});

/* ================= CLIENT NOTES ================= */

app.get("/api/client-notes", auth, adminOnly, async (req, res) => {
    const data = await ClientNote.find({ owner: { $in: getAdminNameVariants(req.user.name) } }).sort({ updatedAt: -1 });
    res.json(data);
});

app.post("/api/client-notes", auth, adminOnly, async (req, res) => {
    const note = new ClientNote({
        ...req.body,
        owner: req.user.name
    });
    await note.save();
    res.json(note);
});

app.put("/api/client-notes/:id", auth, adminOnly, async (req, res) => {
    const { owner, ...updates } = req.body;
    const note = await ClientNote.findOneAndUpdate(
        { _id: req.params.id, owner: { $in: getAdminNameVariants(req.user.name) } },
        { ...updates, updatedAt: new Date() },
        { new: true }
    );
    if (!note) return res.status(404).json({ message: "Client note not found" });
    res.json(note);
});

app.delete("/api/client-notes/:id", auth, adminOnly, async (req, res) => {
    const note = await ClientNote.findOneAndDelete({ _id: req.params.id, owner: { $in: getAdminNameVariants(req.user.name) } });
    if (!note) return res.status(404).json({ message: "Client note not found" });
    res.json({ ok: true });
});

/* ================= REACT APP ================= */

app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
        return res.status(404).json({ message: "API route not found" });
    }

    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

/* ================= START ================= */

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
