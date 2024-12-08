const bcrypt = require("bcrypt");
const User = require("./models/user"); // Adjust path based on file structure
require("./db"); // Ensure the database connection is established

const addUser = async () => {
    try {
        const hashedPassword = await bcrypt.hash("myPassword123", 10); // Hash the password
        const user = new User({
            username: "testUser",
            password: hashedPassword,
        });
        await user.save();
        console.log("User added successfully");
    } catch (err) {
        console.error("Error adding user:", err.message);
    }
};

addUser();
