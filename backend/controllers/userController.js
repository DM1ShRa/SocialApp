import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";


const getUserProfile = async(req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username }).select("-password").select("-updatedAt");
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "User profile failed" });
        console.log("Error in getUserProfile", error.message);
    }
};
const signupUser = async(req, res) => {
    try {
        const { name, username, email, password } = req.body;
        const user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword,
        });
        await newUser.save();
        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
            });
        } else {
            res.status(400).json({ error: "User signup failed" });
        }
    } catch (error) {
        res.status(500).json({ error: "User signup failed" });
        console.log("Error in signupUser", error.message);
    }
};

const loginUser = async(req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isPasswordValid = await bcrypt.compare(password, user.password || "");
        if (!user || !isPasswordValid) {
            return res.status(400).json({ error: "Invalid username or password" });
        }
        generateTokenAndSetCookie(user._id, res);
        res.status(200).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
        });
    } catch (error) {
        res.status(500).json({ error: "User login failed" });
        console.log("Error in loginUser", error.message);
    }
};

const logoutUser = async(req, res) => {
    try {
        res.cookie("token", "", {
            maxAge: 1,
        });
        res.status(200).json({ message: "User logged out" });
    } catch (error) {
        res.status(500).json({ error: "User logout failed" });
        console.log("Error in logoutUser", error.message);
    }
};

const followUnFollowUser = async(req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);
        if (id === req.user._id.toString()) {
            return res
                .status(400)
                .json({ message: "You cannot follow/unfollow yourself" });
        }
        if (!userToModify || !currentUser) {
            return res.status(404).json({ error: "User not found" });
        }
        const isFollowing = currentUser.following.includes(id);
        if (isFollowing) {
            //unfollow user
            await User.findByIdAndUpdate(req.user._id, {
                $pull: { following: id },
            });
            await User.findByIdAndUpdate(id, {
                $pull: { followers: req.user._id },
            });
            res.status(200).json({ message: "User unfollowed" });
        } else {
            //follow user
            await User.findByIdAndUpdate(req.user._id, {
                $push: { following: id },
            });
            await User.findByIdAndUpdate(id, {
                $push: { followers: req.user._id },
            });
            res.status(200).json({ message: "User followed" });
        }
    } catch (error) {
        res.status(500).json({ error: "User follow/unfollow failed" });
        console.log("Error in followUnFollowUser", error.message);
    }
};
const updateUser = async(req, res) => {
    const { name, username, email, password, profilePic, bio } = req.body;
    const userId = req.user._id;
    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (req.params.id !== userId.toString()) {
            return res
                .status(400)
                .json({ error: "You are not authorized to update this user" });
        }
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        user.name = name || user.name;
        user.username = username || user.username;
        user.email = email || user.email;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = await user.save();
        res.status(200).json({
            message: "User updated",
            user,
        });
    } catch (error) {
        res.status(500).json({ error: "User update failed" });
        console.log("Error in updateUser", error.message);
    }
};




export { signupUser, loginUser, logoutUser, followUnFollowUser, updateUser, getUserProfile };