// --- CONFIGURATION ---
// TODO: Paste your Firebase config here
const firebaseConfig = {
  // apiKey: "...",
  // authDomain: "...",
  // projectId: "...",
  // storageBucket: "...",
  // messagingSenderId: "...",
  // appId: "..."
};

// --- NOTE DATA ---
const NOTES = [
  "C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2","A2","A#2","B2",
  "C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3",
  "C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4",
  "C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5",
  "C6"
];
const KEYS = [
  "C major","G major","D major","A major","E major","B major","F# major","C# major",
  "F major","Bb major","Eb major","Ab major","Db major","Gb major","Cb major",
  "A minor","E minor","B minor","F# minor","C# minor","G# minor","D# minor","A# minor",
  "D minor","G minor","C minor","F minor","Bb minor","Eb minor","Ab minor"
];

// Note frequencies (A4=440Hz)
const NOTE_FREQS = {
  "C2":65.41,"C#2":69.30,"D2":73.42,"D#2":77.78,"E2":82.41,"F2":87.31,"F#2":92.50,"G2":98.00,"G#2":103.83,"A2":110.00,"A#2":116.54,"B2":123.47,
  "C3":130.81,"C#3":138.59,"D3":146.83,"D#3":155.56,"E3":164.81,"F3":174.61,"F#3":185.00,"G3":196.00,"G#3":207.65,"A3":220.00,"A#3":233.08,"B3":246.94,
  "C4":261.63,"C#4":277.18,"D4":293.66,"D#4":311.13,"E4":329.63,"F4":349.23,"F#4":369.99,"G4":392.00,"G#4":415.30,"A4":440.00,"A#4":466.16,"B4":493.88,
  "C5":523.25,"C#5":554.37,"D5":587.33,"D#5":622.25,"E5":659.25,"F5":698.46,"F#5":739.99,"G5":783.99,"G#5":830.61,"A5":880.00,"A#5":932.33,"B5":987.77,
  "C6":1046.50
};

// --- UI POPULATION ---
function populateDropdown(id, options) {
  const sel = document.getElementById(id);
  sel.innerHTML = options.map(n => `<option value="${n}">${n}</option>`).join("");
}
["note1","note2","note3","chord1","chord2","chord3","chord4"].forEach(id => populateDropdown(id, NOTES));
populateDropdown("keySignature", KEYS);

// --- AUDIO PLAYBACK ---
function playNote(freq, duration, ctx) {
  return new Promise(res => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.18;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      osc.stop(ctx.currentTime + 0.1);
      res();
    }, duration);
  });
}
async function playSequence(notes, chord, totalMs) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const n = notes.length + 1;
  const per = Math.floor(totalMs / n);
  for (let note of notes) {
    await playNote(NOTE_FREQS[note], per, ctx);
  }
  // Play chord
  await new Promise(res => {
    const gains = chord.map(() => ctx.createGain());
    const oscs = chord.map((note, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = NOTE_FREQS[note];
      osc.connect(gains[i]).connect(ctx.destination);
      gains[i].gain.value = 0.15;
      return osc;
    });
    oscs.forEach(osc => osc.start());
    setTimeout(() => {
      gains.forEach(g => g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1));
      oscs.forEach(osc => osc.stop(ctx.currentTime + 0.1));
      res();
    }, per);
  });
  ctx.close();
}

// --- FIREBASE SETUP ---
let db = null;
function initFirebase() {
  if (!firebaseConfig.apiKey) return;
  if (!window.firebase) {
    showMessage("Firebase SDK not loaded.");
    return;
  }
  if (!db) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
  }
}

// --- UI LOGIC ---
function showMessage(msg, timeout=2000) {
  const el = document.getElementById("message");
  el.textContent = msg;
  if (timeout) setTimeout(() => { el.textContent = ""; }, timeout);
}

document.getElementById("playBtn").onclick = async function() {
  const notes = ["note1","note2","note3"].map(id => document.getElementById(id).value);
  const chord = ["chord1","chord2","chord3","chord4"].map(id => document.getElementById(id).value);
  const timing = parseInt(document.querySelector("input[name='timing']:checked").value);
  showMessage("Playing...");
  await playSequence(notes, chord, timing * 1000);
  showMessage("Done!");
};

document.getElementById("saveBtn").onclick = async function() {
  initFirebase();
  if (!db) return;
  const title = document.getElementById("songTitle").value.trim();
  if (!title) return showMessage("Enter a song title.");
  const notes = ["note1","note2","note3"].map(id => document.getElementById(id).value);
  const chord = ["chord1","chord2","chord3","chord4"].map(id => document.getElementById(id).value);
  const key = document.getElementById("keySignature").value;
  const timing = parseInt(document.querySelector("input[name='timing']:checked").value);
  try {
    await db.collection("songs").doc(title).set({
      notes, chord, key, timing, title
    });
    showMessage("Saved!");
  } catch (e) {
    showMessage("Save failed.");
  }
};

document.getElementById("loadBtn").onclick = async function() {
  initFirebase();
  if (!db) return;
  const title = document.getElementById("songTitle").value.trim();
  if (!title) return showMessage("Enter a song title.");
  try {
    const doc = await db.collection("songs").doc(title).get();
    if (!doc.exists) return showMessage("Not found.");
    const data = doc.data();
    ["note1","note2","note3"].forEach((id,i) => document.getElementById(id).value = data.notes[i]);
    ["chord1","chord2","chord3","chord4"].forEach((id,i) => document.getElementById(id).value = data.chord[i]);
    document.getElementById("keySignature").value = data.key;
    document.querySelector(`input[name='timing'][value='${data.timing}']`).checked = true;
    showMessage("Loaded!");
  } catch (e) {
    showMessage("Load failed.");
  }
};

// --- FIREBASE SDK LOADER ---
(function loadFirebaseSDK() {
  const script = document.createElement('script');
  script.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
  script.onload = function() {
    const script2 = document.createElement('script');
    script2.src = "https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js";
    document.body.appendChild(script2);
  };
  document.body.appendChild(script);
})();
