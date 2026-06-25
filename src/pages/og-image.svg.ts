import type { APIRoute } from "astro";
import ogImage from "../../public/og-image.svg?raw";

export const GET: APIRoute = () =>
  new Response(ogImage, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=604800",
    },
  });
