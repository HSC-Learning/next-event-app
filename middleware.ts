// import { clerkMiddleware } from "@clerk/nextjs/server";

// export default clerkMiddleware({
//   publicRoutes: [
//     "/",
//     "/events/:id",
//     "/api/webhook/clerk",
//     "/api/webhook/stripe",
//     "/api/uploadthing",
//   ],
//   ignoredRoutes: [
//     "/api/webhook/clerk",
//     "/api/webhook/stripe",
//     "/api/uploadthing",
//   ],
// });

// export const config = {
//   matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// };
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isTenantRoute = createRouteMatcher([
  "/organization-selector(.*)",
  "/orgid/(.*)",
]);

const isTenantAdminRoute = createRouteMatcher([
  "/orgId/(.*)/memberships",
  "/orgId/(.*)/domain",
]);

export default clerkMiddleware((auth, req) => {
  // Restrict admin routes to users with specific permissions
  if (isTenantAdminRoute(req)) {
    auth().protect((has) => {
      return (
        has({ permission: "org:sys_memberships:manage" }) ||
        has({ permission: "org:sys_domains_manage" })
      );
    });
  }
  // Restrict organization routes to signed in users
  if (isTenantRoute(req)) auth().protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
