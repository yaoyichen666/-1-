import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLuxuryWish = async (recipient: string, tone: 'elegant' | 'warm'): Promise<string> => {
  try {
    const prompt = `
      Write a very short, sophisticated, and luxurious Christmas wish for "${recipient}".
      The tone should be ${tone}.
      Use metaphoric language evoking gold, starlight, emeralds, and timeless elegance.
      Max 2 sentences.
      Do not use emojis.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Speed over deep thought for this creative task
        temperature: 0.8,
      }
    });

    return response.text?.trim() || "May your holidays shine with the brilliance of gold and the peace of emerald nights.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Wishing you a season of grandeur and timeless beauty.";
  }
};