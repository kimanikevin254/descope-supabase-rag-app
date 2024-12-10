import { supabase } from "../utils/supabase";

export async function fetchRelevantDocs(queryEmbedding) {
    return supabase.rpc('get_relevant_docs', {
        query_embedding: Array.from(queryEmbedding),
        threshold: 0.8,
        docs_count: 3,
    });
}