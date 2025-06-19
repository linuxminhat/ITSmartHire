import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { app } from "@/firebase.config";

export async function ensureFirebaseSignedIn() {
    const auth = getAuth(app);

    if (auth.currentUser) return;

    try {
        await signInAnonymously(auth);
        console.log("✅ Firebase anonymous sign-in success");
    } catch (err) {
        console.error("❌ Anonymous sign-in failed", err);
    }

    onAuthStateChanged(auth, (u) =>
        console.log(u ? "▶ onAuthStateChanged: signed-in" : "▶ NOT signed-in")
    );
}
