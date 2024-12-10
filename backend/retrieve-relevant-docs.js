import { runExtractor } from "./lib/extractor.js";
import { supabase } from "./lib/supabase.js";

async function main() {
    const query = 'Why do customers choose Descope over Ping Identity?';
    console.log('🔍 Generating embeddings for the input...');

    try {
        const { data: queryEmbedding }  = await runExtractor(query);
        console.log('✅ Embeddings generated.');

        // Call supabase function to get matching docs
        const { data, error } = await supabase.rpc('get_relevant_docs', {
            query_embedding: Array.from(queryEmbedding),
            threshold: 0.8,
            docs_count: 3
        });

        if (error) {
            console.error('❌ Error fetching relavant documents:', error);
            return;
        }

        console.log('✅ Relevant documents retrieved successfully:', data);
    } catch (err) {
        console.error('❌ Error occurred:', err);
    }
}

main().catch(error => {
    console.error('❌ Fatal error in main execution:', error);
});
