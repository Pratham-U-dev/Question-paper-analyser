# 📄 AcademiQ — Vision-Based Academic Intelligence System

> Built as part of the **CLPBL Initiative** at St. Joseph Engineering College, Mangaluru

---

## 🏆 Achievement

> 🥉 **3rd Place** — CLPBL Project Showcase, St. Joseph Engineering College, Mangaluru

---

## 🧠 What is AcademiQ?

Engineering students and faculty spend **1–5 hours manually** analyzing scanned question papers — with zero structured data to show for it.

**AcademiQ eliminates that.**

It accepts scanned or digital question paper PDFs, extracts structured data using **Google Gemini Vision API**, and surfaces it through smart dashboards — turning hours of manual work into **under 60 seconds of automation**.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔍 **Smart OCR Extraction** | Gemini Vision API handles complex multi-column academic layouts — far beyond Tesseract's capability |
| 🧩 **Bloom's Taxonomy Analytics** | Auto-classifies questions and shows distribution across cognitive levels |
| 🔥 **Module-wise Heatmaps** | Visualizes question frequency per module across multiple years |
| 📚 **Searchable Question Bank** | Unified, searchable archive of all extracted historical papers |
| ⚡ **AI Paper Generator** | Generates balanced exam papers in <60s, respecting Bloom's levels, marks, and module coverage |
| 📤 **Export Support** | Download generated papers as DOCX or PDF |
| 👥 **Role Dashboards** | Separate views for students and faculty |

---

## 🛠 Tech Stack

```
Frontend    →  React + TypeScript
Database    →  Supabase (PostgreSQL)
AI / OCR    →  Google Gemini Vision API
Export      →  DOCX / PDF generation
```

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/23e46pratham-lab/PBL_frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase URL, Supabase anon key, and Gemini API key

# Start the dev server
npm run dev
```

---

## 📐 System Overview

```
PDF Upload
    ↓
Gemini Vision API  →  Structured Question Data
    ↓
Supabase (PostgreSQL)
    ↓
React Dashboard
    ├── Student View   → Question bank, analytics
    └── Faculty View   → Heatmaps, paper generator, export
```

---

## 🎓 Context

This project was developed under the **Course-Level Problem-Based Learning (CLPBL)** initiative at **St. Joseph Engineering College, Mangaluru** — designed to solve a real, recurring problem faced by students and faculty every semester.

---

## 📬 Contact

For queries or collaboration, reach out via GitHub Issues or the college project portal.
