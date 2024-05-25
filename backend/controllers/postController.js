import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import { v2 as cloudinary } from "cloudinary";

const createPost = async(req, res) => {
    try {
        const { postedBy, text } = req.body;
        let { img } = req.body;
        if (!postedBy || !text) {
            return res
                .status(400)
                .json({ error: "PostedBy and text fields are required" });
        }
        const user = await User.findById(postedBy);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized to post" });
        }
        const maxLength = 500;
        if (text.length > maxLength) {
            return res
                .status(400)
                .json({ message: `Text must be less than ${maxLength} characters` });
        }
        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }
        const newPost = new Post({
            postedBy,
            text,
            img,
        });
        await newPost.save();
        res.status(201).json({ message: "Post created", newPost });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
};
const getPost = async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        res.status(200).json({ post });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
};

const deletePost = async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized to delete" });
        }
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Post deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
};

const likeUnlikePost = async(req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const isLiked = post.likes.includes(userId);
        if (isLiked) {
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            res.status(200).json({ message: "Post unliked" });
        } else {
            post.likes.push(userId);
            await post.save();
            res.status(200).json({ message: "Post liked" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
};

const replyToPost = async(req, res) => {
    try {
        const { id: postId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;
        const userProfilePic = req.user.profilePic;
        const username = req.user.username;
        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const reply = {
            userId,
            text,
            userProfilePic,
            username,
        };
        post.replies.push(reply);
        await post.save();
        res.status(201).json({ message: "Replied to post", reply });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
};

const getFeedPosts = async(req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const following = user.following;
        const feedposts = await Post.find({ postedBy: { $in: following } }).sort({
            createdAt: -1,
        });
        res.status(200).json({ feedposts });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
};

export {
    createPost,
    getPost,
    deletePost,
    likeUnlikePost,
    replyToPost,
    getFeedPosts,
};