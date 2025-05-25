import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { app } from "@/firebase.config";

/** Gọi một lần khi app khởi động */
export async function ensureFirebaseSignedIn() {
    const auth = getAuth(app);

    if (auth.currentUser) return;

    try {
        await signInAnonymously(auth);
        console.log("✅ Firebase anonymous sign-in success");
    } catch (err) {
        console.error("❌ Anonymous sign-in failed", err);
    }

    // Log để kiểm chứng
    onAuthStateChanged(auth, (u) =>
        console.log(u ? "▶ onAuthStateChanged: signed-in" : "▶ NOT signed-in")
    );
}
