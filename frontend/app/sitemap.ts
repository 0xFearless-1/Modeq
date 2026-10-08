import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://modeq.unitynodes.com";
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/app`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/audit`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/demo`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
