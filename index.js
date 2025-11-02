import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = 3000;

app.get("/api/reel", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Please provide a reel URL" });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const jsonText = $('script[type="application/ld+json"]').html();

    if (!jsonText) {
      return res.status(404).json({ error: "Reel data not found" });
    }

    const jsonData = JSON.parse(jsonText);
    const videoUrl = jsonData?.video?.contentUrl || null;

    if (!videoUrl) {
      return res.status(404).json({ error: "Video URL not found" });
    }

    res.json({
      success: true,
      download_url: videoUrl,
      thumbnail: jsonData?.thumbnailUrl || null,
      caption: jsonData?.caption || null,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reel data" });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
