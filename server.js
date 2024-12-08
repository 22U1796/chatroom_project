const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const User = require("./models/user");
const connectDB = require("./db");

// Initialize app and DB connection
const app = express();
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Create HTTP server and socket.io instance
const server = http.createServer(app);
const io = socketIo(server);

// Routes for user approval (Admin action)
app.post("/approve", async (req, res) => {
    const { username } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send("User not found.");

        user.approved = true;
        await user.save();
        res.send("User approved successfully.");
    } catch (err) {
        res.status(500).send("An error occurred.");
    }
});

// Socket.io events
io.on("connection", (socket) => {
    console.log("A user connected");

    // Registration
    socket.on("register", async ({ username, password }, callback) => {
        try {
            const existingUser = await User.findOne({ username });
            if (existingUser) return callback({ success: false, message: "Username already exists." });

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ username, password: hashedPassword });
            await newUser.save();

            callback({ success: true, message: "Registration successful. Awaiting approval." });
        } catch (err) {
            callback({ success: false, message: "Registration failed. Try again later." });
        }
    });

    // Login
    socket.on("login", async ({ username, password }, callback) => {
        try {
            const user = await User.findOne({ username });
            if (!user) return callback({ success: false, message: "Invalid username or password." });
            if (!user.approved) return callback({ success: false, message: "Account not approved yet." });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return callback({ success: false, message: "Invalid username or password." });

            callback({ success: true });
        } catch (err) {
            callback({ success: false, message: "An error occurred." });
        }
    });

    // Send Message
    socket.on("send_message", (data) => {
        io.emit("receive_message", {
            username: data.username,
            message: data.message,
        });
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

// Start the server
server.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
