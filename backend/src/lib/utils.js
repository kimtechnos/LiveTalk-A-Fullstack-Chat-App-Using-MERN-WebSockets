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
  };

  // In production, set domain to allow cross-domain cookies
  if (!isDevelopment) {
    cookieOptions.domain = "onrender.com"; // Allow cookies for onrender.com domain
  }

  console.log("Setting cookie with options:", cookieOptions);
  res.cookie("jwt", token, cookieOptions);

  return token;
};
