import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { environment } from "./environments/environment";
import { getAuth } from 'firebase/auth'; // Add this for auth

// Initialize Firebase
const app = initializeApp(environment.firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth }; // export the auth object for use in services

export { app, analytics };
