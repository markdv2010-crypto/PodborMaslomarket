import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface VehicleInfo {
  vin: string;
  make: string;
  model: string;
  year: number;
  engine: string;
}

export async function decodeVin(vin: string): Promise<VehicleInfo> {
  if (vin.length !== 17) {
    throw new Error("VIN код должен содержать 17 символов");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Расшифруй этот VIN код: ${vin}. Верни марку, модель, год выпуска и наиболее вероятный тип/объем двигателя. Если точный двигатель неизвестен, укажи базовый для этой модели.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            make: { type: Type.STRING, description: "Марка авто" },
            model: { type: Type.STRING, description: "Модель авто" },
            year: { type: Type.INTEGER, description: "Год выпуска" },
            engine: { type: Type.STRING, description: "Двигатель (объем, тип топлива)" }
          },
          required: ["make", "model", "year", "engine"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Пустой ответ от ИИ");
    }

    const data = JSON.parse(response.text);
    return {
      vin: vin.toUpperCase(),
      make: data.make,
      model: data.model,
      year: data.year,
      engine: data.engine
    };
  } catch (error) {
    console.error("VIN Decode Error:", error);
    throw new Error("Не удалось расшифровать VIN. Проверьте правильность кода.");
  }
}
