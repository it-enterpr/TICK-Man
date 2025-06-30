// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// =======================================================================
// ZDE VLOŽTE SVŮJ ZKOPÍROVANÝ firebaseConfig OBJEKT Z KROKU 3
// =======================================================================
const firebaseConfig = {
    apiKey: "AIzaSyDa8NNTMZSW2mXxFLdabiON8ne-qyZtMMM",
    authDomain: "it-enterprise-solutions.firebaseapp.com",
    projectId: "it-enterprise-solutions",
    storageBucket: "it-enterprise-solutions.firebasestorage.app",
    messagingSenderId: "98218926179",
    appId: "1:98218926179:web:efe53f1978d08388ce9856",
    measurementId: "G-KH49C6CD7G"
};
// =======================================================================


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exportujte služby, které budete potřebovat v jiných částech aplikace
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();