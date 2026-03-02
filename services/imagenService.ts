// Fix: Changed GenerateImageResponse to GenerateImagesResponse
import { GoogleGenAI, GenerateImagesResponse }  from "@google/genai";
import { ModelNames } from "../types";

let genAIInstance: GoogleGenAI | null = null;

const getGenAI = (): GoogleGenAI => {
  if (!genAIInstance) {
    // This check is crucial for browser environments where `process` might not be defined.
    if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
      throw new Error("A API_KEY não está configurada. Certifique-se de que está definida no seu ambiente de hospedagem.");
    }
    genAIInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return genAIInstance;
};

/**
 * Retries an async function with exponential backoff.
 * @param apiCall The async function to call.
 * @param maxRetries The maximum number of retries.
 * @param initialDelay The initial delay in milliseconds.
 * @returns The result of the async function.
 */
const withRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> => {
  let attempt = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await apiCall();
    } catch (error) {
      attempt++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check for rate limit error (429)
      if (errorMessage.includes('429') && attempt < maxRetries) {
        console.warn(`Rate limit exceeded. Retrying in ${delay / 1000}s... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        // For other errors or if max retries are reached, rethrow the error.
        throw error;
      }
    }
  }
};

export const generateImageWithImagen = async (prompt: string): Promise<string> => {
  const ai = getGenAI();
  try {
    return await withRetry(async () => {
      const response: GenerateImagesResponse = await ai.models.generateImages({
        model: ModelNames.IMAGEN,
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
      });

      if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
        return response.generatedImages[0].image.imageBytes; // This is a base64 encoded string
      } else {
        console.warn("A resposta do Imagen não continha dados de imagem para o prompt:", prompt, response);
        throw new Error("Nenhuma imagem gerada ou dados da imagem ausentes.");
      }
    });
  } catch (error) {
    console.error("Erro final ao gerar imagem com o Imagen:", error);
    if (error instanceof Error && error.message.includes("429")) {
        throw new Error(`O serviço de imagem está sobrecarregado. Tentando novamente...`);
    }
    if (error instanceof Error && error.message.includes("API key not valid")) {
      throw new Error("A chave da API Imagen não é válida. Por favor, verifique sua configuração.");
    }
    throw new Error(`Falha ao gerar imagem para o prompt: "${prompt}". Por favor, tente novamente.`);
  }
};