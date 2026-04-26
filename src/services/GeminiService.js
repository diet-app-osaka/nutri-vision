import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeMealImage = async (base64Image) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Analyze this meal image and estimate its nutritional content.
    Return the result strictly in the following JSON format:
    {
      "mealName": "料理名（日本語で出力）",
      "nutrients": {
        "energy": { "value": number, "unit": "kcal" },
        "protein": { "value": number, "unit": "g" },
        "fat": { "value": number, "unit": "g" },
        "carbohydrates": { "value": number, "unit": "g" },
        "sugar": { "value": number, "unit": "g" },
        "fiber": { "value": number, "unit": "g" },
        "vitamins": { "value": number, "unit": "% (daily sufficiency score)" },
        "minerals": { "value": number, "unit": "% (daily sufficiency score)" }
      },
      "description": "管理栄養士・医学博士の視点からの辛口コメント（関西弁）"
    }

    IMPORTANT RULES:
    1. "mealName" MUST be in Japanese.
    2. "description" MUST be in Japanese Kansai dialect (関西弁).
    3. The "description" MUST be STRICT, SHARP, and ANALYTICAL from a dietitian/medical doctor's perspective. If there are too many carbs, fats, or calories, point it out harshly but with Kansai humor (e.g., "アカン！炭水化物ばっかりやんけ！", "脂質摂りすぎや！血ドロドロになるで！"). Don't hold back.
    4. If vitamins or minerals are low, provide specific, practical advice on what kind of foods or side dishes the user should add to get those nutrients (e.g., "ほうれん草や小松菜のお浸しを一品足しや！", "海藻類やキノコ類をもっと食べなアカンで！"). Keep this advice in Kansai dialect.
    5. Include an exercise recommendation at the end based on the estimated calories. State roughly how many minutes of walking (散歩) or jogging (ジョギング) are needed to burn it off. Add strict but humorous encouragement like "寝るまでに頑張って動きや！" or "今日はエレベーターもエスカレーターも禁止や！全部階段使いや〜！". Keep it in Kansai dialect.
    6. The "vitamins" and "minerals" values should be an estimated average percentage of the recommended daily intake for a typical adult.
    Return ONLY the JSON string without any markdown formatting like \`\`\`json.
  `;

  const imagePart = {
    inlineData: {
      data: base64Image.split(",")[1],
      mimeType: "image/jpeg",
    },
  };

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    // Extract JSON from response if it contains markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
