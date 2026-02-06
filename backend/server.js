import express from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";

const app = express();
const PORT = 5000;

// app.use(cors());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersFilePath = path.join(__dirname, "data", "users.json");


app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const users = fs.existsSync(usersFilePath)
            ? JSON.parse(fs.readFileSync(usersFilePath, "utf8"))
            : [];
        const user = users.find(u => u.username === username);
        if(!user) {
            return res.status(401).json({ success:false, message:"Invalid username or password" });
        }
        const match = await bcrypt.compare(password, user.password);
        if(!match) {
            return res.status(401).json({ success: false, message: "Invalid username or password." });
        }
        res.json({ success:true, message:"Login successful", userId:username });
    } catch (err){
        console.error("Error reading from users.json", err);
        res.status(500).json({ success: false, message:"Server error." });
    }
});
app.post("/create-account", async (req, res) => {
    const { username, password } = req.body;
    if(!username || !password) {
        return res.status(400).json({ success:false, message:"Username and password are required." });
    }
    try {
        const data = fs.existsSync(usersFilePath)
            ? JSON.parse(fs.readFileSync(usersFilePath, "utf8"))
            : [];
        if(data.find(u => u.username === username)) {
            return res.status(400).json({ success:false, message:"Username already exists" })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        data.push({ username, password: hashedPassword });
        fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
        res.json({ success:true, message:"Account created successfully!", userId: username });
    } catch (err) {
        console.error("Error writign to users.json:", err);
        res.status(500).json({ success:false, message:"Server error." });
    }
});

//testing stuff
app.get("/", (req, res) => {
    res.send("Assignment Tracker backend is running!")
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});