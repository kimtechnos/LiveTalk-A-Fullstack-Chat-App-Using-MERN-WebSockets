import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isDevelopment = process.env.NODE_ENV === "development";

  const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: isDevelopment ? "lax" : "none", // CSRF attacks cross-site request forgery attacks
    secure: !isDevelopment, // only send cookie over HTTPS in production
    path: "/", // Ensure cookie is available for all paths
    domain: isDevelopment ? undefined : ".onrender.com", // Set domain for cross-subdomain cookies
  };

  console.log("Setting cookie with options:", cookieOptions);
  console.log("Token being set:", token.substring(0, 20) + "...");
  res.cookie("jwt", token, cookieOptions);
  console.log("Cookie set successfully");

  return token;
};
