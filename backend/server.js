import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import postsRoutes from "./routes/postsRoutes.js";
dotenv.config();
connectDB();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/posts", postsRoutes);

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
});