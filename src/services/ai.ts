import { GoogleGenAI, Type } from "@google/genai";
import { VehicleInfo } from "./vin";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface UserPreferences {
  mileage: number;
  climate: string;
  drivingStyle: string;
}

export interface RecommendationResult {
  nodes: {
    nodeName: string;
    recommendedOils: {
      brand: string;
      name: string;
      viscosity: string;
      reasoning: string;
      matchScore: number; // 0-100
    }[];
  }[];
  generalAdvice: string;
}

export async function getAiRecommendation(
  vehicle: VehicleInfo,
  preferences: UserPreferences
): Promise<RecommendationResult> {
  const prompt = `
Вы — ведущий эксперт сервиса MasloMARKET Podbor AI по подбору автомобильных масел и технических жидкостей.
Автомобиль: ${vehicle.make} ${vehicle.model} ${vehicle.year}, двигатель ${vehicle.engine}.
Пробег: ${preferences.mileage} км.
Климат: ${preferences.climate}.
Стиль вождения: ${preferences.drivingStyle}.

ЗАДАЧА:
1. Подбери лучшие варианты масел и жидкостей для ВСЕХ ключевых узлов данного автомобиля:
   - Двигатель
   - Коробка передач (определи наиболее вероятный тип: АКПП, МКПП, Вариатор или Робот, исходя из модели авто)
   - Мосты / Редукторы / Раздаточная коробка (если применимо к данному авто)
2. Рекомендуй продукты СТРОГО из следующих премиальных брендов: RAVENOL, MOTUL, BARDAHL.
3. Для каждого узла предложи 2-3 лучших варианта, комбинируя указанные бренды.
4. Обязательно учти пробег, климат и стиль вождения при объяснении выбора каждого продукта.
5. Используй Google Search для уточнения допусков и спецификаций жидкостей для данного авто, если необходимо.
6. Верни результат строго в формате JSON.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            description: "Список узлов автомобиля (Двигатель, АКПП, Мосты и т.д.)",
            items: {
              type: Type.OBJECT,
              properties: {
                nodeName: { type: Type.STRING, description: "Название узла, например 'Двигатель', 'АКПП (Aisin)', 'Задний дифференциал'" },
                recommendedOils: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      brand: { type: Type.STRING, description: "Бренд (RAVENOL, MOTUL или BARDAHL)" },
                      name: { type: Type.STRING, description: "Название линейки/продукта" },
                      viscosity: { type: Type.STRING, description: "Вязкость или спецификация (например 5W-30, ATF SP-IV, 75W-90)" },
                      reasoning: { type: Type.STRING, description: "Почему это масло идеально подходит для данного узла и условий" },
                      matchScore: { type: Type.NUMBER, description: "Оценка совместимости от 0 до 100" }
                    },
                    required: ["brand", "name", "viscosity", "reasoning", "matchScore"]
                  }
                }
              },
              required: ["nodeName", "recommendedOils"]
            }
          },
          generalAdvice: { type: Type.STRING, description: "Общий совет по обслуживанию и интервалам замены жидкостей для этого авто" }
        },
        required: ["nodes", "generalAdvice"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Не удалось получить ответ от ИИ");
  }

  return JSON.parse(response.text) as RecommendationResult;
}
