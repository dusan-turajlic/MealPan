import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path") ?? "/";

  // Only allow relative paths to prevent open-redirect abuse
  const safePath = path.startsWith("/") ? path : "/";

  const manifest = {
    name: "Meal Plan",
    short_name: "MealPlan",
    description: "Your personal meal plan",
    start_url: safePath,
    display: "standalone",
    background_color: "#1c1814",
    theme_color: "#1c1814",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  });
}
