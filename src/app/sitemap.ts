import type { MetadataRoute } from "next";

// TODO: Update base URL to actual deployment domain
const BASE_URL = "https://vt-studio.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    // -------------------------
    // Documentation
    // -------------------------
    {
      url: `${BASE_URL}/docs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/docs/connect-valtown`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/docs/temporary-session`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/docs/embed-iframe-client`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
  ];
}
