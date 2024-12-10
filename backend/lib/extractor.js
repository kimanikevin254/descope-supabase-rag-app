import { pipeline } from "@xenova/transformers";

const extractor = await pipeline("feature-extraction", "Supabase/gte-small");

// Function to extract embeddings
export async function runExtractor(text) {
    try {
        const { data, size } = await extractor([text], {
            pooling: "mean",
            normalize: true,
        });
        return { size, data };
    } catch (error) {
        console.error("❌ Error during embedding extraction:", error);
        throw error;
    }
}