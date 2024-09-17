Here’s a detailed `README.md` to guide users in setting up and running the project:

---

# WebRTC Video Call with MediaPipe Pose Tracking

This project enables two users to establish a WebRTC-based video call with live MediaPipe Pose detection and customized skeleton visualization. The project uses Firebase for signaling between peers and MediaPipe Pose for real-time pose estimation and display on a canvas.

## Table of Contents

- [WebRTC Video Call with MediaPipe Pose Tracking](#webrtc-video-call-with-mediapipe-pose-tracking)
  - [Table of Contents](#table-of-contents)
  - [Project Setup](#project-setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Firebase Setup](#firebase-setup)
  - [Running the Application](#running-the-application)
  - [How It Works](#how-it-works)

## Project Setup

1. **WebRTC**: This project uses WebRTC to establish peer-to-peer video calls.
2. **MediaPipe Pose**: Tracks body poses using Google's MediaPipe.
3. **Firebase Firestore**: Firestore is used for signaling in the WebRTC connection.

## Prerequisites

Before running this project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Firebase account with a Firestore database

## Installation

1. Clone this repository to your local machine:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install the firebase-tools

   ```bash
   npm firebse-tools -g
   ```

3. Install the project dependencies:

   ```bash
   npm install
   ```

## Firebase Setup

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).

2. In your Firebase project, navigate to **Firestore Database** and click **Create Database**.

3. Go to **Project Settings** -> **General** -> **Your apps** and add a new web app. Copy the Firebase configuration.

4. Replace the Firebase configuration placeholder in the code with your own Firebase credentials inside the `firebaseConfig` object:

   ```js
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };
   ```

## Running the Application

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open your browser and navigate to the local server:

   ```
   http://localhost:3000
   ```

3. To test the WebRTC call, open the application in two different browser windows or devices.

## How It Works

- **WebRTC Setup**: The app establishes a peer-to-peer connection using WebRTC. STUN servers are used for NAT traversal.
- **Signaling via Firebase**: Firebase Firestore is used to exchange SDP (Session Description Protocol) information and ICE (Interactive Connectivity Establishment) candidates between peers.
- **MediaPipe Pose Detection**: The app tracks the user's skeleton with MediaPipe and draws the landmarks and connections on a canvas. Certain pose points are filtered out to customize the visualization.

---

This `README.md` provides all necessary steps and details for users to get started with the project. Let me know if you need any more adjustments!
