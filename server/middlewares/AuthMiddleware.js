import jwt from "jsonwebtoken";

/**
 * Middleware to verify JWT tokens from cookies.
 */
export const verifyToken = (req, res, next) => {
  try {
    console.log("Cookies:", req.cookies); // Debugging log

    // Ensure the JWT cookie exists
    if (!req.cookies || !req.cookies.jwt) {
      return res.status(401).json({ error: "You are not authenticated! No token found." });
    }

    let token;
    try {
      // Parse the cookie if it contains a JSON object, otherwise assume it's a plain string
      const parsedCookie = JSON.parse(req.cookies.jwt);
      token = parsedCookie.jwt || req.cookies.jwt;
    } catch (e) {
      token = req.cookies.jwt; // If parsing fails, assume it's a plain string
    }

    if (!token) {
      return res.status(401).json({ error: "Token is missing from the cookie!" });
    }

    // Verify JWT token
    jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
      if (err) {
        console.error("JWT Verification Error:", err);
        return res.status(403).json({ error: "Token is not valid!" });
      }

      req.userId = payload?.userId;
      console.log("Token verified! User ID:", req.userId);
      next();
    });

  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
