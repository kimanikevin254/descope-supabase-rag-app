import { runExtractor } from "./lib/extractor.js";
import { supabase } from "./lib/supabase.js";
import stripIndent from 'strip-indent';
import dotenv from 'dotenv';
import { openai } from "./lib/openai.js";

// Load environment variables
dotenv.config();

async function main() {
    const query = 'Why is the sky blue?';
    console.log('🔍 Generating embeddings for the input...');

    try {
        const { data: queryEmbedding }  = await runExtractor(query);
        console.log('✅ Embeddings generated.');

        // Call Supabase function to get matching docs
        try {
            const { data, error } = await supabase.rpc('get_relevant_docs', {
                query_embedding: Array.from(queryEmbedding),
                threshold: 0.8,
                docs_count: 3
            });

            if (error) {
                throw new Error(error.message);
            }

            console.log(`✅ ${data.length} Relevant documents retrieved successfully`);

            // Concat docs
            const context = data.map(doc => stripIndent(doc.content.trim())).join("\n");


            console.log('Generating response');

            const system_message = `
                You are a friendly Descope chatbot. \
                You can answer questions about Descope, its features, and docs. \
                You respond in a concise, technically credible tone. \
                If the answer is not explicitly provided in the context, say "Sorry, I can't help with that."
            `;
        
            const messages = [
                { role: 'system', content: system_message },
                { role: 'user', content: query },
                { role: 'assistant', content: `Relevant information: ${context}` }
            ];

            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages,
            });

            console.log(response.choices[0].message.content);
        } catch (err) {
            console.error('❌ Error fetching relevant documents:', err);
        }

    } catch (err) {
        console.error('❌ Error occurred:', err);
    }
}

main().catch(error => {
    console.error('❌ Fatal error in main execution:', error);
});