const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

router.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        return res.status(201).json({
            message: "User created successfully",
            user: data.user
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const { data, error } =
            await supabase.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        return res.status(200).json({
            message: "Login successful",
            access_token: data.session.access_token,
            user: data.user
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

router.post("/logout", async (req, res) => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.status(200).json({
        message: "Logout successful"
    });
});

module.exports = router;