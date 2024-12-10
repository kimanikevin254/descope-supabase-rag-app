import { useEffect, useState, useCallback } from "react";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router";
import stripIndent from 'strip-indent';
import { runExtractor } from "../utils/extractor";
import { fetchRelevantDocs } from "../services/chatService";
import { openai } from "../utils/openai";

export default function Chat() {
    const navigate = useNavigate();

    const [hasCheckedSession, setHasCheckedSession] = useState(false);
    const [session, setSession] = useState(null);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [messages, setMessages] = useState([]);

    // console.log(session);

    const retrieveUserAndSession = async () => {
        const { data: { session: sessionInfo } } = await supabase.auth.getSession();
        setSession(sessionInfo);
        setHasCheckedSession(true);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!query.trim()) return;

        setLoading(true);
        setError("");

        try {
            // Add user message to the messages array
            setMessages((prev) => [...prev, { role: 'user', content: query }]);

            const { data: queryEmbedding } = await runExtractor(query);
            const { data, error } = await fetchRelevantDocs(queryEmbedding);

            if (error) throw error;

            // Concat docs
            const context = data.map(doc => stripIndent(doc.content.trim())).join("\n");

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

            const assistantMessage = response.choices[0].message.content;

            // Add assistant message to the messages array
            setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage }]);
        } catch (error) {
            setError('Something went wrong. Please try again.');
            console.error('Error:', error);
        } finally {
            setLoading(false);
            setQuery("");
        }
    };

    useEffect(() => {
        retrieveUserAndSession();
    }, []);

    useEffect(() => {
        if (hasCheckedSession && !session) {
            navigate('/auth/login', { replace: true });
        }
    }, [hasCheckedSession, session, navigate]);

    const handleInputChange = useCallback((e) => setQuery(e.target.value), []);

    return session ? (
        <div className="flex flex-col min-h-screen">
            {/* Fixed Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-between items-center z-10">
                <h1 className="text-xl font-bold">Descope GPT</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
                >
                    Logout
                </button>
            </nav>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 mt-16 mb-16">
                <div className="flex flex-col space-y-4 p-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`p-2 my-2 rounded-lg ${
                                message.role === "user"
                                    ? "bg-blue-100 text-blue-800 self-end"
                                    : "bg-gray-100 text-gray-800 self-start"
                            }`}
                        >
                            {message.content}
                        </div>
                    ))}
                </div>
            </div>

            {/* Fixed Form at the Bottom */}
            <form
                onSubmit={handleSubmit}
                className="fixed bottom-0 left-0 right-0 p-4 flex space-x-4 z-10 border-t bg-white"
            >
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Type your question here..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className={`p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {loading ? "Loading..." : "Send"}
                </button>
            </form>

            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    ) : null;
}
