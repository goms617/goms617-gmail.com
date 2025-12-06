import { GoogleGenAI, Type } from "@google/genai";
import { Product, AIAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize client only if key exists to avoid immediate errors, handle gracefully in caller
const getClient = () => {
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const analyzePortfolio = async (products: Product[]): Promise<AIAnalysisResult> => {
  const ai = getClient();
  if (!ai) {
    throw new Error("API Key not found. Please provide a valid Gemini API Key.");
  }

  if (products.length === 0) {
    throw new Error("没有足够的电子产品数据进行分析。");
  }

  const prompt = `
    作为一位精明的电子产品消费顾问，请分析以下用户的电子产品资产组合。
    
    产品列表数据 (JSON格式):
    ${JSON.stringify(products)}
    
    今天的日期是: ${new Date().toLocaleDateString()}
    
    请根据购买日期、价格和状态，分析：
    1. 哪些产品“回本”了（日均使用成本低）？
    2. 哪些产品是“冲动消费”或利用率可能较低的？
    3. 根据产品的使用年限（例如手机通常2-3年，电脑3-5年），建议哪些可能需要升级。
    4. 整体消费习惯评价。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "整体消费习惯的简短总结评价 (100字以内)" },
            bestValueItem: { type: Type.STRING, description: "最具性价比（日均成本最低或使用最久）的产品名称" },
            worstValueItem: { type: Type.STRING, description: "最不划算或可能闲置的产品名称" },
            upgradeSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productName: { type: Type.STRING },
                  reason: { type: Type.STRING, description: "建议升级或处理的原因" }
                }
              },
              description: "建议升级或出售的清单"
            },
            categoryInsights: { type: Type.STRING, description: "关于用户在不同类别（如手机、音频）投入的洞察" }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    throw new Error("No data returned from Gemini.");
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};
