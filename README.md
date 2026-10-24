
# EyeGuard 👁️

### Webcam-Based Blink Monitoring and Eye-Rest Reminder System

EyeGuard is a web-based project developed for the Biomedical Project. It uses real-time facial landmark detection to monitor blinking patterns, calculate eye-related metrics, estimate an experimental Ocular Protection Index (OPI), and remind users to take short eye-rest breaks.

## 🌐 Live Demo

**Try EyeGuard here:**  
https://biomedical-project-breadth.vercel.app/

## ✨ Features

- 👁️ **Real-Time Eye Monitoring:** Detects facial landmarks around the eyes using MediaPipe.
- 🔄 **Blink Detection:** Identifies blinks using the Eye Aspect Ratio (EAR).
- 📊 **Blink Count:** Tracks the total number of detected blinks.
- 📈 **Blink Rate:** Estimates the number of blinks per minute.
- ⏱️ **Inter-Blink Interval (IBI):** Tracks the time between successive blinks.
- 📉 **EAR Monitoring:** Displays the current Eye Aspect Ratio and minimum EAR during the last accepted blink.
- 🧮 **OPI Estimation:** Calculates an experimental Ocular Protection Index estimate.
- 🔔 **Desktop Notifications:** Sends browser notifications when the estimated OPI enters the configured low range.
- 💬 **Toast Notifications:** Displays eye-rest reminders inside the application.
- 🌙 **Dark Mode:** Supports light and dark themes.
- 📷 **Camera Controls:** Allows users to start and stop webcam monitoring.

## 🛠️ Tech Stack

- React
- Vite
- JavaScript
- Tailwind CSS
- MediaPipe Tasks Vision
- Browser MediaDevices API
- Browser Notifications API
- React Hot Toast

## ⚙️ How It Works

### 1. Facial Landmark Detection

EyeGuard uses MediaPipe Face Landmarker to detect facial landmarks around the eyes from webcam frames.

### 2. Eye Aspect Ratio (EAR)

The Eye Aspect Ratio estimates eye openness using distances between selected eye landmarks. Lower EAR values generally indicate greater eye closure. Thresholds and closure-duration checks are used to identify blinks.

### 3. Blink Metrics

The application tracks blink events and displays:

- Total blink count
- Recent blink rate
- Current EAR
- Inter-blink interval (IBI)
- Minimum EAR during the last accepted blink

### 4. Ocular Protection Index (OPI)

The current prototype calculates an experimental OPI estimate using an assumed tear-film breakup time (TFBUT) and the elapsed time since the last detected blink.

The calculation is:

`Estimated OPI = Assumed TFBUT / Elapsed time since last detected blink`

TFBUT is entered by the user; it is not measured by the webcam.

### 5. Eye-Rest Reminders

When the estimated OPI enters the configured low range, EyeGuard can display a reminder:

> Close your eyes gently for 10–20 seconds and relax.

The application supports both in-app toast messages and desktop notifications. Desktop notifications require browser permission and may be affected by operating-system notification settings.

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm
- A modern web browser
- Webcam access
- Notification permission for desktop alerts

### Installation

Clone the repository:

```bash
git clone https://github.com/rajdipsaha-IIT-KGP/Biomedical-Project-Breadth.git
```

Navigate to the project directory:

```bash
cd Biomedical-Project-Breadth
```

Install dependencies:

```bash
npm install
```

Ensure the MediaPipe model file is available at the path configured in `useFaceLandmarker.js`. For example:

```text
public/models/face_landmarker.task
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### Build for Production

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

These commands assume the corresponding scripts are configured in `package.json`.

## 📖 How to Use

1. Open the [EyeGuard live demo](https://biomedical-project-breadth.vercel.app/).
2. Allow camera access when prompted.
3. Click **Start Camera** to begin monitoring.
4. Keep your face visible to the webcam.
5. Review the blink metrics displayed on the dashboard.
6. Enter an assumed TFBUT value in the OPI panel.
7. Enable desktop notifications and grant browser permission.
8. When the configured low-OPI condition is met, follow the eye-rest reminder.
9. Click **Stop Camera** when you finish.

## 🔔 Notification Setup

EyeGuard provides two notification types:

- **Toast notifications:** Appear inside the EyeGuard webpage.
- **Desktop notifications:** Use the browser Notifications API and can appear while another browser tab is active.

For desktop notifications, allow notifications for the site in your browser settings. On macOS, also check **System Settings → Notifications** and Focus or Do Not Disturb settings.

The current implementation requires the webpage to remain open and running for webcam monitoring and automatic reminders. It does not continue monitoring after the page is closed.

## 📁 Project Structure

The source code is organized into reusable React components and custom hooks. A representative structure is:

```text
src/
├── App.jsx
├── useFaceLandmarker.js
├── components/
│   ├── Header.jsx
│   ├── CameraPanel.jsx
│   ├── EyeMetrics.jsx
│   ├── OPIPanel.jsx
│   └── NotificationPanel.jsx
└── opi/
    ├── useOPI.js
    ├── useEyeGuardNotifications.js
    └── opiUtils.js
```

The exact structure may vary depending on the current implementation.

## 🔒 Privacy

EyeGuard requires webcam permission to detect facial landmarks and monitor blinks. Review the application code and dependencies before deployment to understand how data is processed. Do not assume all processing is local unless this has been verified.

## ⚠️ Limitations

- Blink detection can be affected by lighting, camera quality, face position, and occlusion.
- TFBUT is entered as an assumed value rather than measured by the webcam.
- OPI is an experimental estimate and is not a clinically validated measurement.
- EyeGuard is not a medical device and should not be used to diagnose eye conditions.
- Desktop notifications depend on browser permission and operating-system settings.

## 🚀 Future Improvements

- Improve blink detection under varying lighting conditions.
- Add customizable reminder intervals.
- Add automated tests for blink detection and OPI calculations.
- Improve notification settings and accessibility.
- Explore background monitoring through a browser extension or installed application.

## License

Developed as part of an academic project at the
Indian Institute of Technology Kharagpur (IIT KGP).

Licensing and intellectual property terms are subject
to applicable institute policies and project requirements.

---

**Developed as a Biomedical Project**  
**Live Demo:** https://biomedical-project-breadth.vercel.app/  
**GitHub Repository:** https://github.com/rajdipsaha-IIT-KGP/Biomedical-Project-Breadth
