# pitchly
🎵Pitchly is a mobile-friendly web app that plays custom musical chords and notes with timing control. Select a key signature, build harmonies, and save your sequences by song title using a cloud-connected backend.

Pitch Pipe & Chord Web Tool
===========================

This is a static web app for playing musical notes and chords, saving and loading settings to the cloud (Firebase Firestore). It is mobile-friendly and requires no build tools.

---

Deployment Instructions
----------------------
1. Upload all files in this folder (index.html, style.css, app.js, README.txt) to your web server.
2. The app is static and works from any web server (including OpenBSD httpd, nginx, Apache, etc).

---

Firebase Setup
--------------
1. Go to https://console.firebase.google.com/ and create a new project (no Google Analytics needed).
2. In the Firebase console, click Firestore Database > Create database > Start in test mode.
3. In Project Settings > General, scroll to "Your apps" and click "</>" (Web) to register a new web app. Give it a name and register.
4. Copy the Firebase config object shown (apiKey, authDomain, etc).
5. Open app.js and paste your config into the firebaseConfig object at the top of the file.
6. No authentication is required; Firestore rules in test mode allow open read/write.

---

Usage
-----
- Open index.html in your browser (or from your server's URL).
- Select 4 notes, key, timing, and enter a song title.
- Use Play to hear the 4-note sequence, Save to store, and Load to retrieve by title.

---

Branding
--------
- The main brand color is #9f1212 (deep red), used for headers and buttons.
- The UI is designed for clarity and mobile use.

---

Support
-------
- If you need to reset Firestore rules for public access, see Firebase docs: https://firebase.google.com/docs/firestore/security/get-started
- For any issues, check your browser console for errors. 
