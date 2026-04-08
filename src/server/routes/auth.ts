import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/url", (req, res) => {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.APP_URL}/api/auth/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=repo,user`;
  res.json({ url });
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const { access_token } = response.data;

    if (!access_token) {
      throw new Error("Failed to get access token");
    }

    // Store token in cookie (secure:false for localhost HTTP dev)
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("github_token", access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth Error:", error);
    res.status(500).send("Authentication failed");
  }
});

router.get("/status", (req, res) => {
  const token = req.cookies.github_token;
  res.json({ authenticated: !!token });
});

router.post("/logout", (req, res) => {
  res.clearCookie("github_token");
  res.json({ success: true });
});

export default router;
