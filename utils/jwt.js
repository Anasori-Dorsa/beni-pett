// utils/jwt.js
const jwt = require("jsonwebtoken");

const COOKIE_NAME = "beni_token";
const TOKEN_TTL = "30d";

function signAuthToken(user) {
  return jwt.sign(
    { sub: user.id, phone: user.phone, is_admin: !!user.is_admin },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL },
  );
}

function verifyAuthToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 روز
    path: "/",
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

module.exports = { COOKIE_NAME, signAuthToken, verifyAuthToken, setAuthCookie, clearAuthCookie };
