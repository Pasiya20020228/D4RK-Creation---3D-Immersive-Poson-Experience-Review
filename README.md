# D4RK Creation - 3D Immersive Poson Experience

An interactive, full-stack 3D Poson Poya Kuduwa (Lantern) built with Three.js, Vite, and a Node.js Express backend. This project creates a vibrant digital celebration for Poson Poya, bringing the traditional Sri Lankan thorana and kuduwa experience directly into the web browser.

## ✨ Features

- **Procedural 3D Environment:** A majestic, highly-detailed Mihintale temple complex featuring the Maha Seya (Stupa), Bodhiya, Shrine Room, and a glowing Lord Buddha background against a starry night sky.
- **Dynamic 3D Kuduwa:** A beautiful rotating lantern split into upper and lower rotating groups with synchronized physics.
- **5 Custom Lighting Patterns:** Interactive buttons to switch between dynamic lighting effects (Chasing, Flashing, Fading, Pulse, and Wave).
- **Background Bakthi Geetha:** Seamlessly integrated YouTube audio with a sleek play/pause and volume control UI.
- **Live Image Dashboard:** A secret admin dashboard allowing users to upload and change images on all 16 panels of the 3D lantern in real-time.
- **Interactive UI:** Clickable panels to view images in full-screen, an introductory Poson story modal, and a developer notice popup featuring glassmorphic design.

## 🛠️ Technology Stack

- **Frontend:** HTML, Vanilla CSS, JavaScript, Three.js (WebGL), Vite
- **Backend:** Node.js, Express, Multer (for handling multipart/form-data uploads)
- **Data Storage:** Local JSON storage (`data.json`)
- **Hosting/Dev:** Concurrently runs both frontend (Vite) and backend (Express API)

## 🚀 How to Run the Project Locally

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Installation
Clone the repository and install the required dependencies:
```bash
git clone https://github.com/Pasiya20020228/D4RK-Creation---3D-Immersive-Poson-Experience-Review.git
cd D4RK-Creation---3D-Immersive-Poson-Experience-Review
npm install
```

### 3. Start the Server
This project uses a single command to boot up both the frontend Vite server and the Node backend:
```bash
npm run dev
```

### 4. View the Application
Once the server is running, open your browser and navigate to:
- **Main 3D Experience:** [http://localhost:5173](http://localhost:5173)

### 5. Access the Admin Dashboard
You can upload images to the 16 panels by accessing the secret dashboard:
- **Dashboard URL:** [http://localhost:5173/dashboard.html](http://localhost:5173/dashboard.html)
- **Secret Password:** `Mihintale2026`

*(When you upload images, they are saved locally in the `uploads/` directory and mapped to the 3D model via `data.json`.)*

## 🎨 Developers & Credits

**D4RK Creation Development**
- **Developer:** H.G.P. Madhumal
- **Visual & Support:** T.H.T.C. Sankalpa, W.C.D.M. Lakkhana

---
*Created for Poson Poya 2026*
