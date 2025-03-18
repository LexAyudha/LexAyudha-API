import jwt from "jsonwebtoken";

export const authenticateRequest = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log(err.message);
        return res.status(403).json({ error: "Invalid token" });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
