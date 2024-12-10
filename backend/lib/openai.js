import OpenAI from "openai/index.mjs";
import dotenv from "dotenv";

dotenv.config();

export const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRET_KEY });