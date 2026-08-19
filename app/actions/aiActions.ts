"use server";

import { GoogleGenAI, Type, Schema } from "@google/genai";

export interface AIPlayerResult {
  name: string;
  position: string;
  lamasia_year: number;
  nationality: string;
  date_of_birth: string; // DD/MM/YYYY
  jersey_number?: number | null;
  height?: number | null;
  preferred_foot?: "Right" | "Left" | "Both" | null;
  current_status: "promoted" | "barca_atletic" | "juvenil_a" | "loaned" | "released" | "transferred";
  current_club: string;
  market_value_m?: number | null;
  first_team_debut_date?: string | null; // DD/MM/YYYY
  first_team_debut_match?: string | null; // e.g. "vs Real Betis (La Liga 2022/23)"
  description_th: string;
  social_instagram?: string | null;
  imageUrl?: string | null;
}

export interface AutofillResponse {
  success: boolean;
  data?: AIPlayerResult;
  error?: string;
}

const playerResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "Full official player name in Latin script (e.g. Guillermo Fernández, Marc Bernal)",
    },
    position: {
      type: Type.STRING,
      description: "Primary playing position code. MUST be one of: GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST",
    },
    lamasia_year: {
      type: Type.INTEGER,
      description: "The year (Christian Era / ค.ศ. e.g. 2018) the player joined FC Barcelona / La Masia academy",
    },
    nationality: {
      type: Type.STRING,
      description: "Primary country of nationality in English (e.g. Spain, Germany, France, Brazil, Mali, Morocco, Senegal, Argentina, Sweden)",
    },
    date_of_birth: {
      type: Type.STRING,
      description: "Date of birth in DD/MM/YYYY format (e.g. 18/06/2008)",
    },
    jersey_number: {
      type: Type.INTEGER,
      description: "Current squad jersey number if known, or null",
    },
    height: {
      type: Type.INTEGER,
      description: "Height in centimeters (e.g. 179) or null",
    },
    preferred_foot: {
      type: Type.STRING,
      description: "Preferred kicking foot: 'Right', 'Left', or 'Both'",
    },
    current_status: {
      type: Type.STRING,
      description: "Current team category: 'promoted' (First Team), 'barca_atletic' (Barça Atlètic), 'juvenil_a' (Juvenil A / U19), 'loaned', 'released', 'transferred'",
    },
    current_club: {
      type: Type.STRING,
      description: "Current club name (default 'FC Barcelona')",
    },
    market_value_m: {
      type: Type.NUMBER,
      description: "Estimated market value in million Euros (e.g. 5.0, 15.0) or null",
    },
    first_team_debut_date: {
      type: Type.STRING,
      description: "First team official debut date in DD/MM/YYYY format or null if not yet debuted",
    },
    first_team_debut_match: {
      type: Type.STRING,
      description: "Official first team debut match formatted strictly as: 'HomeTeam Score-Score AwayTeam (Competition Season)' in English (e.g. 'Barcelona 2-1 Valencia (La Liga 2024/25)', 'Barcelona 4-0 Real Betis (La Liga 2022/23)', 'Valencia 1-2 Barcelona (La Liga 2024/25)', 'Athletic Club 0-1 Barcelona (La Liga 2023/24)'), or null if the player has not yet debuted for the first team",
    },
    description_th: {
      type: Type.STRING,
      description: "Comprehensive Thai scouting report (2-3 paragraphs) detailing: 1. Background & journey at La Masia 2. Playing style, signature strengths & tactical traits 3. Nickname or comparison with senior players (e.g. เล่นคล้าย Iniesta, Busquets, Yamal, Pedri)",
    },
    social_instagram: {
      type: Type.STRING,
      description: "Instagram username without @ (e.g. lamineyamal, guillefernandezz) or null",
    },
  },
  required: [
    "name",
    "position",
    "lamasia_year",
    "nationality",
    "date_of_birth",
    "current_status",
    "current_club",
    "description_th",
  ],
};

export async function autofillPlayerWithAI(playerQuery: string): Promise<AutofillResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    return {
      success: false,
      error: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY ใน .env.local (สามารถขอรับ API Key ฟรีได้ที่ aistudio.google.com)",
    };
  }

  const query = playerQuery.trim();
  if (!query) {
    return {
      success: false,
      error: "กรุณาระบุชื่อนักเตะหรือข้อมูลที่ต้องการค้นหา",
    };
  }

  // Active Gemini 3.x Flash models in priority order
  const configuredModel = process.env.GEMINI_MODEL || "gemini-3.7-flash";
  const candidateModels = [
    configuredModel,
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
  ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i); // unique

  const systemInstruction = `You are an elite FC Barcelona & La Masia youth academy scout and football analyst.
Your task is to accurately extract, analyze, and synthesize detailed biographical, physical, and scouting data for the requested FC Barcelona / La Masia talent.
You have encyclopedic knowledge of:
- La Masia youth categories (Juvenil A, Barça Atlètic, First Team)
- Pre-season tour participants (USA tours, Asian tours) under Xavi Hernández, Hansi Flick, etc.
- Detailed player traits, birthdates, joining years, preferred foot, and tactical role.

For 'first_team_debut_match':
- Always format strictly as: 'HomeTeam Score-Score AwayTeam (Competition Season)' in English.
  Examples:
  - 'Barcelona 2-1 Valencia (La Liga 2024/25)'
  - 'Barcelona 4-0 Real Betis (La Liga 2022/23)'
  - 'Monaco 2-1 Barcelona (UCL 2024/25)'
  - 'Athletic Club 0-1 Barcelona (La Liga 2023/24)'
- Provide null if the player has not yet debuted for the first team.

For 'description_th':
- Write an engaging, insightful Thai scouting analysis (2-3 paragraphs in Thai).
- Highlight their playing style (สไตล์การเล่น), unique traits (จุดเด่น/ทักษะเฉพาะตัว).
- Include player comparisons (เล่นคล้ายใคร / เปรียบเทียบกับรุ่นพี่ เช่น Iniesta, Xavi, Busquets, Messi, Yamal, Pedri, Gavi, Dani Alves, etc.).
- Mention any known nicknames (ฉายา) and expectations at FC Barcelona.`;

  const prompt = `Please analyze and generate complete structured profile data for the following FC Barcelona / La Masia player:
"${query}"

Ensure all dates are formatted as DD/MM/YYYY. If exact jersey number or debut date is unknown, provide null.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    let lastError: any = null;

    for (const modelName of candidateModels) {
      // Try each model with up to 2 attempts (handles temporary 503 high demand spikes)
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: playerResponseSchema,
              temperature: 0.2, // low temperature for maximum factual accuracy
            },
          });

          if (response.text) {
            const parsed = JSON.parse(response.text) as AIPlayerResult;
            return {
              success: true,
              data: parsed,
            };
          }
        } catch (err: any) {
          const isTemporary = err?.message?.includes("503") || err?.message?.includes("high demand") || err?.message?.includes("429");
          console.warn(`Attempt ${attempt} with model ${modelName} failed:`, err?.message || err);
          lastError = err;

          // If temporary spike and first attempt, wait 1.2 seconds and retry
          if (isTemporary && attempt === 1) {
            await new Promise((r) => setTimeout(r, 1200));
            continue;
          }
          break; // Move to next candidate model
        }
      }
    }

    throw lastError || new Error("No response received from Gemini API");
  } catch (error: any) {
    console.error("AI Autofill Error:", error);
    return {
      success: false,
      error: `เกิดข้อผิดพลาดในการดึงข้อมูลจาก AI: ${error?.message || "กรุณาลองใหม่อีกครั้ง"}`,
    };
  }
}
