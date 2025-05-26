console.log("🔑 SERVER PK:", process.env.CLERK_PUBLISHABLE_KEY);
console.log("🔑 SERVER SK:", process.env.CLERK_SECRET_KEY);
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard", "/my-resume/:resumeId/edit"]);

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
