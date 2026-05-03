// ============================================
// ROOTS & ROUTES — Firebase Configuration
// Replace with your actual Firebase project credentials
// ============================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "roots-and-routes.firebaseapp.com",
  projectId: "roots-and-routes",
  storageBucket: "roots-and-routes.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Import Firebase modules (CDN ESM or script tags)
// Using compat SDK for browser without bundler:
// <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

// Initialize Firebase (only once)
let app, db, auth;

try {
  if (typeof firebase !== "undefined") {
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = firebase.app();
    }
    db = firebase.firestore();
    auth = firebase.auth();
    console.log("✅ Firebase initialized successfully");
  } else {
    // Dev mode: use mock db
    console.warn("⚠️ Firebase SDK not loaded — running in offline/mock mode");
  }
} catch (e) {
  console.warn("Firebase init error (dev mode):", e.message);
}

// ============================================
// AUTH HELPERS
// ============================================

async function signInWithGoogle() {
  if (!auth) return showToast("Auth not available in dev mode", "warning");
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    await saveUserProfile(user);
    showToast(`Welcome, ${user.displayName}!`);
    setTimeout(() => (window.location.href = "index.html"), 1200);
  } catch (err) {
    showToast("Google Sign-In failed: " + err.message, "danger");
  }
}

async function signInWithEmail(email, password) {
  if (!auth) return showToast("Auth not available in dev mode", "warning");
  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    showToast(`Welcome back, ${cred.user.email}!`);
    setTimeout(() => (window.location.href = "index.html"), 1200);
  } catch (err) {
    showToast("Login failed: " + err.message, "danger");
  }
}

async function registerWithEmail(name, email, password) {
  if (!auth) return showToast("Auth not available in dev mode", "warning");
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
    await saveUserProfile(cred.user);
    showToast(`Account created! Welcome, ${name}!`);
    setTimeout(() => (window.location.href = "index.html"), 1200);
  } catch (err) {
    showToast("Registration failed: " + err.message, "danger");
  }
}

async function signOut() {
  if (!auth) return;
  await auth.signOut();
  showToast("Signed out successfully");
  setTimeout(() => (window.location.href = "login.html"), 1000);
}

async function saveUserProfile(user) {
  if (!db) return;
  await db.collection("users").doc(user.uid).set({
    name: user.displayName || "Traveler",
    email: user.email,
    photoURL: user.photoURL || "",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    wishlist: [],
    bookings: []
  }, { merge: true });
}

// Auth state observer
if (typeof firebase !== "undefined" && auth) {
  auth.onAuthStateChanged((user) => {
    const navSignIn = document.querySelector('a[href="login.html"]');
    const navRegister = document.querySelector('a[href="register.html"]');
    if (user && navSignIn) {
      navSignIn.textContent = user.displayName || "Account";
      navSignIn.href = "#";
      navSignIn.onclick = signOut;
    }
  });
}

// ============================================
// FIRESTORE HELPERS
// ============================================

async function getDestinations(filter = "all") {
  if (!db) return getMockDestinations(filter);
  try {
    let query = db.collection("destinations");
    if (filter !== "all") query = query.where("category", "==", filter);
    const snap = await query.orderBy("rating", "desc").limit(6).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return getMockDestinations(filter);
  }
}

async function getTours() {
  if (!db) return getMockTours();
  try {
    const snap = await db.collection("tours").orderBy("popularity", "desc").limit(4).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return getMockTours();
  }
}

async function addToWishlist(destId) {
  if (!auth || !auth.currentUser) {
    showToast("Please sign in to save to wishlist", "warning");
    return;
  }
  const uid = auth.currentUser.uid;
  await db.collection("users").doc(uid).update({
    wishlist: firebase.firestore.FieldValue.arrayUnion(destId)
  });
  showToast("Added to wishlist ♥");
}

async function subscribeToNewsletter(email) {
  if (!db) {
    showToast("Subscribed! (dev mode)");
    return;
  }
  await db.collection("newsletter").add({
    email,
    subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  showToast("🎉 You're subscribed! Welcome aboard.");
}
