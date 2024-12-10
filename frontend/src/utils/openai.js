import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_SECRET_KEY, dangerouslyAllowBrowser: true });