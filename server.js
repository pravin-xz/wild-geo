const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
require("dotenv").config();

const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Create uploads folder
const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// Serve images to React
app.use("/uploads", express.static(uploadDir));

// Configure image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP, and GIF images are allowed"));
    }
  },
});

// Helper: remove an uploaded file
function removeFile(imagePath) {
  if (!imagePath || !imagePath.startsWith("/uploads/")) {
    return;
  }

  const filename = path.basename(imagePath);
  const fullPath = path.join(uploadDir, filename);

  fs.unlink(fullPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Image cleanup failed:", err);
    }
  });
}

// Test route
app.get("/", (req, res) => {
  res.send("Wild Animals API is running");
});

// 1. GET: Read all animals
app.get("/api/animals", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM animals ORDER BY id DESC");

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch animals",
    });
  }
});

// 2. POST: Add an animal with an image
app.post("/api/animals", upload.single("image"), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      (description != null && typeof description !== "string")
    ) {
      if (req.file) removeFile(`/uploads/${req.file.filename}`);

      return res.status(400).json({
        message: "Valid animal name is required",
      });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.execute(
      `INSERT INTO animals (name, description, image)
         VALUES (?, ?, ?)`,
      [name.trim(), description || "", image],
    );

    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      description: description || "",
      image,
    });
  } catch (error) {
    if (req.file) removeFile(`/uploads/${req.file.filename}`);

    console.error(error);
    res.status(500).json({
      message: "Failed to add animal",
    });
  }
});

// 3. PUT: Update animal details or image
app.put("/api/animals/:id", upload.single("image"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    if (
      !Number.isSafeInteger(id) ||
      id < 1 ||
      typeof name !== "string" ||
      !name.trim() ||
      (description != null && typeof description !== "string")
    ) {
      if (req.file) removeFile(`/uploads/${req.file.filename}`);

      return res.status(400).json({
        message: "Valid animal details are required",
      });
    }

    const [rows] = await db.execute("SELECT * FROM animals WHERE id = ?", [id]);

    if (rows.length === 0) {
      if (req.file) removeFile(`/uploads/${req.file.filename}`);

      return res.status(404).json({
        message: "Animal not found",
      });
    }

    // Keep the old image if no new image was selected
    const image = req.file ? `/uploads/${req.file.filename}` : rows[0].image;

    await db.execute(
      `UPDATE animals
         SET name = ?, description = ?, image = ?
         WHERE id = ?`,
      [name.trim(), description || "", image, id],
    );

    // Remove the previous image after a successful update
    if (req.file && rows[0].image) {
      removeFile(rows[0].image);
    }

    res.json({
      message: "Animal updated successfully",
      image,
    });
  } catch (error) {
    if (req.file) removeFile(`/uploads/${req.file.filename}`);

    console.error(error);
    res.status(500).json({
      message: "Failed to update animal",
    });
  }
});

// 4. DELETE: Delete animal and its image
app.delete("/api/animals/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid animal ID",
      });
    }

    const [rows] = await db.execute("SELECT image FROM animals WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Animal not found",
      });
    }

    await db.execute("DELETE FROM animals WHERE id = ?", [id]);

    if (rows[0].image) {
      removeFile(rows[0].image);
    }

    res.json({
      message: "Animal deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete animal",
    });
  }
});

// Handle upload errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image must be 5 MB or smaller"
        : err.message;

    return res.status(400).json({ message });
  }

  if (err) {
    return res.status(400).json({
      message: err.message || "Upload failed",
    });
  }

  next();
});

// Connect to MySQL and start server
async function startServer() {
  try {
    await db.query("SELECT 1");

    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
