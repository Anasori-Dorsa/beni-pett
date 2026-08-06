// routes/categories.js
const express = require("express");
const { query } = require("../config/db");

const router = express.Router();

// GET /api/categories
router.get("/", async (_req, res) => {
  const rows = await query(
    "SELECT id, slug, name_fa, name_en, sort_order FROM categories ORDER BY sort_order ASC, id ASC",
  );
  res.json(rows);
});

module.exports = router;
