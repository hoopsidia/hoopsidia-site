import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export function proxy(request: import("next/server").NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  // Exclude api, _next, static files, and the /pimpmycourt subtree (its own
  // locale-less product route) from next-intl locale handling.
  matcher: ["/((?!api|_next|pimpmycourt|.*\\..*).*)"],
};
