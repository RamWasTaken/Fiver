import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    console.log("Cookies:", req.cookies);
    console.log("Authorization Header:", req.headers.authorization); // Debugging

    let token = null;

    // 1️⃣ Try extracting token from cookies
    if (req.cookies && req.cookies.jwt) {
      try {
        const parsedCookie = JSON.parse(req.cookies.jwt);
        token = parsedCookie.jwt || req.cookies.jwt;
      } catch (e) {
        token = req.cookies.jwt; // If parsing fails, assume it's a plain string
      }
    }

    // 2️⃣ If no token in cookies, check Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
      }
    }

    // 3️⃣ If token is still missing, return error
    if (!token) {
      return res.status(401).json({ error: "You are not authenticated! No token found." });
    }

    // 4️⃣ Verify JWT token
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
