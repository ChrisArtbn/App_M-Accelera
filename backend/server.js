const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// ================= STORAGE =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ================= DATA =================

// 🔥 DATA PASIEN (INI YANG PENTING)
let patients = [
  { name: "Ody", room: "402", status: "Recovered", file: null },
  { name: "Faiz", room: "210", status: "Waiting", file: null },
  { name: "Chris", room: "105", status: "Critical", file: null },
];

let messages = [];

// ================= GET PATIENTS =================
app.get("/patients", (req, res) => {
  res.json(patients);
});

// ================= UPLOAD PER PASIEN =================
app.post("/upload/:name", upload.single("file"), (req, res) => {
  const patientName = req.params.name;

  const fileData = {
    name: req.file.originalname,
    url: `/uploads/${req.file.filename}`, // penting: relative path
  };

  // 🔥 cari pasien
  const patient = patients.find((p) => p.name === patientName);

  if (!patient) {
    return res.status(404).json({ error: "Pasien tidak ditemukan" });
  }

  // 🔥 simpan file ke pasien
  patient.file = fileData;

  console.log("Upload untuk:", patientName, fileData);

  res.json(fileData);
});

// ================= WHATSAPP =================
app.post("/webhook", (req, res) => {
  const msg = req.body.Body;

  messages.push({
    sender: "patient",
    name: "Lala (Patient)",
    text: msg,
  });

  res.send("<Response></Response>");
});

// ================= GET CHAT =================
app.get("/messages", (req, res) => {
  res.json(messages);
});

// ================= SERVE FILE =================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= ADMIN SEND =================
app.post("/send", (req, res) => {
  console.log("Admin kirim:", req.body.message);
  res.sendStatus(200);
});

// ================= RUN =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});