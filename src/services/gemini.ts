import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateImagePrompt(sentence: string, style?: string): Promise<string> {
  try {
    const styleInstruction = style ? `Sử dụng phong cách nghệ thuật sau: "${style}". ` : "";
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Bạn là một chuyên gia viết prompt cho AI tạo ảnh (như Midjourney, Stable Diffusion). 
Hãy chuyển câu văn sau đây thành một prompt tiếng Anh chi tiết, sống động, bao gồm ánh sáng và bố cục.
${styleInstruction}
Câu văn: "${sentence}"

Chỉ trả về đoạn prompt tiếng Anh, không thêm giải thích gì khác.`,
    });
    return response.text || "Failed to generate prompt.";
  } catch (error) {
    console.error("Error generating prompt:", error);
    return "Error generating prompt.";
  }
}

export async function generateBatchPrompts(sentences: string[]): Promise<string[]> {
  // For batch, we could do individual calls or one big call. 
  // Individual calls are safer for long scripts but slower.
  // Let's try to do them in parallel with a small delay or just map them.
  const promises = sentences.map(s => generateImagePrompt(s));
  return Promise.all(promises);
}
