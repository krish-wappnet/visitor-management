import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { environment } from "./environments/environment";

// Initialize Firebase
const app = initializeApp(environment.firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
