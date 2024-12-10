import puppeteer from "puppeteer";
import { supabase } from "./lib/supabase.js";
import { urls } from "./lib/urls.js";
import dotenv from "dotenv";
import pLimit from "p-limit";
import { runExtractor } from "./lib/extractor.js";

// Load env variables
dotenv.config();

// Utility to chunk arrays into smaller batches
function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

// Function to scrape data from a single page
async function scrapePage(browser, { role, url }) {
    const page = await browser.newPage();
    try {
        console.log(`🌍 Navigating to: ${url}`);
        await page.goto(url, { waitUntil: "networkidle2" });

        console.log(`🔍 Extracting data from ${url}...`);
        // Extract the full text content of the page
        const content = await page
            .evaluate(() => document.body.innerText)
            .catch(() => {
                console.warn(`⚠️ No content found for ${url}`);
                return "";
            });

        console.log("🚀 Generating embeddings...");
        const { data: embedding } = await runExtractor(content);
        console.log("✅ Embeddings generated successfully!");

        return {
            role,
            url,
            content,
            embedding: Array.from(embedding),
        };
    } catch (error) {
        console.error(`❌ Error scraping ${url}:`, error);
        return null; // Return null to skip failed pages
    } finally {
        await page.close();
    }
}

// Main function to scrape and push data
async function scrapeAndPushData() {
    console.log("🚀 Launching browser...");
    const browser = await puppeteer.launch({ headless: true });
    const scrapedData = [];
    const limit = pLimit(5); // Limit concurrency to 5

    try {
        const scrapeTasks = urls.map((url) =>
            limit(() => scrapePage(browser, url))
        );
        const results = await Promise.all(scrapeTasks);
        scrapedData.push(...results.filter((result) => result)); // Filter out null results

        console.log("🛑 Browser closed.");
    } catch (error) {
        console.error("❌ Error during scraping:", error);
    } finally {
        await browser.close();
    }

    // Push to Supabase in chunks
    if (scrapedData.length > 0) {
        console.log("🚀 Pushing data to Supabase...");
        const chunks = chunkArray(scrapedData, 10); // Chunk size of 10

        for (const chunk of chunks) {
            try {
                const { data, error } = await supabase
                    .from("documents")
                    .insert(chunk);

                if (error) {
                    console.error(
                        "❌ Error pushing data chunk to Supabase:",
                        error
                    );
                    throw new Error(error.message);
                } else {
                    console.log("✅ Data pushed successfully:", data);
                }
            } catch (error) {
                console.error("❌ Failed to push chunk:", error);
            }
        }
    } else {
        console.log("⚠️ No data to push to Supabase.");
    }
}

await scrapeAndPushData().catch((error) => {
    console.error("❌ Fatal Error:", error);
});