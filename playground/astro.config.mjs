// @ts-check
import { defineConfig } from 'astro/config';
import devRelish from "astro-devrelish";
import db from "@astrojs/db";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [db(), react(), devRelish()]
});
