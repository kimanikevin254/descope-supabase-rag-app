import { pipeline, env } from "@xenova/transformers";

// Issue linked here -> https://github.com/huggingface/transformers.js/issues/142#
env.allowLocalModels = false;
// env.useBrowserCache = false;

let extractor;

// Function to extract embeddings
export async function runExtractor(text) {
    try {
        if (!extractor) {
            extractor = await pipeline("feature-extraction", "Supabase/gte-small");
        }        

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

