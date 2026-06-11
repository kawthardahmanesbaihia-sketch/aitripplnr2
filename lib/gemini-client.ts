/**
 * Google Gemini API Client
 * Used for image analysis and AI-generated content
 */

import { InMemoryCache, generateCacheKey } from "@/lib/cache"

// Initialize cache for Gemini responses (4 hour TTL)
const geminiCache = new InMemoryCache<any>(14400)

/**
 * Fetch from Gemini API with fallback model support
 * Tries gemini-2.0-flash first, falls back to gemini-pro if needed
 */
async function callGeminiAPI(prompt: string, apiKey: string): Promise<string | null> {
  const models = ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-pro"];
  
  for (const model of models) {
    try {
      console.log(`[Gemini] Attempting with model: ${model}`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text()
        let errMsg = `HTTP ${response.status}`
        try { errMsg = JSON.parse(errText)?.error?.message ?? errMsg } catch {}
        console.warn(`[Gemini] Model ${model} failed:`, errMsg)
        // 429 rate limit — no point trying other models immediately
        if (response.status === 429) break
        continue; // Try next model
      }

      const responseText = await response.text()
      let data: any
      try {
        data = JSON.parse(responseText)
      } catch {
        console.warn(`[Gemini] Non-JSON response from model ${model}:`, responseText.slice(0, 100))
        continue
      }
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (content) {
        console.log(`[Gemini] Success with model: ${model}`);
        return content;
      }
    } catch (error) {
      console.warn(`[Gemini] Model ${model} error:`, error);
      continue; // Try next model
    }
  }
  
  console.error("[Gemini] All models failed");
  return null;
}

export interface ImageAnalysisResult {
  preferences: {
    adventure: number
    nature: number
    beach: number
    city: number
    food: number
    culture: number
  }
  mood: string
  mainThemes: string[]
}

export interface AIDestinationSummary {
  whyMatch: string
  pros: string[]
  cons: string[]
  bestFor: string
  recommendations: string[]
}

export async function analyzeImages(
  imageUrls: string[]
): Promise<ImageAnalysisResult | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("[Gemini] API key not configured");
      return null;
    }

    if (imageUrls.length === 0) {
      return null;
    }

    console.log("[Gemini] Analyzing images:", imageUrls.length);

    const prompt = `Analyze these travel images and identify the user's preferences. Return a JSON object with:
{
  "preferences": {
    "adventure": 0-100,
    "nature": 0-100,
    "beach": 0-100,
    "city": 0-100,
    "food": 0-100,
    "culture": 0-100
  },
  "mood": "calm/adventurous/cultural/luxury",
  "mainThemes": ["theme1", "theme2", "theme3"]
}`;

    const imageParts = imageUrls.map((url) => ({
      inlineData: {
        mimeType: "image/jpeg",
        data: url, // Assuming URLs are already converted to base64
      },
    }));

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                ...imageParts,
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("[Gemini] API error:", response.status, await response.text().catch(() => ""))
      return null
    }

    const respText = await response.text()
    let data: any
    try {
      data = JSON.parse(respText)
    } catch {
      console.error("[Gemini] Non-JSON response from analyzeImages")
      return null
    }
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error("[Gemini] No content in response");
      return null;
    }

    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log("[Gemini] Analysis complete");
        return result;
      }
    } catch (parseError) {
      console.error("[Gemini] Error parsing response:", parseError);
      return null;
    }

    return null;
  } catch (error) {
    console.error("[Gemini] Error:", error);
    return null;
  }
}

function buildStaticSummary(
  destinationName: string,
  userPreferences: string[],
  climate: string,
  activities: string[]
): AIDestinationSummary {
  const prefStr = userPreferences.slice(0, 3).join(", ") || "travel"
  const actStr  = activities.slice(0, 3).join(", ") || "exploration"
  const climateDesc = climate || "varied"
  return {
    whyMatch: `${destinationName} is a compelling destination for travelers drawn to ${prefStr}. It offers a rich blend of culture, scenery, and authentic experiences that align with your travel style.`,
    pros: [
      `Well-suited for travelers interested in ${prefStr}`,
      `Rich local culture with unique, memorable experiences`,
      `${actStr ? `Activities like ${actStr} are well-established` : "Wide range of activities available"}`,
      `Distinct destination character that rewards exploration`,
    ],
    cons: [
      "Peak seasons can bring crowds — plan visits at shoulder times for a quieter experience",
      "Local prices and availability vary by season; advance booking is recommended",
    ],
    bestFor: `Travelers seeking authentic experiences with a passion for ${prefStr}.`,
    recommendations: [
      "Research local customs and etiquette before your trip",
      `Pack for the ${climateDesc} climate and plan activities accordingly`,
      "Book popular attractions and accommodations well in advance",
    ],
  }
}

export async function generateDestinationSummary(
  destinationName: string,
  userPreferences: string[],
  climate: string,
  activities: string[]
): Promise<AIDestinationSummary | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("[Gemini] API key not configured — using static summary");
      return buildStaticSummary(destinationName, userPreferences, climate, activities);
    }

    // Check cache first
    const cacheKey = generateCacheKey("summary", destinationName, userPreferences.join(","))
    const cached = geminiCache.get(cacheKey)
    if (cached) {
      console.log("[Gemini] Using cached summary for:", destinationName);
      return cached
    }

    console.log("[Gemini] Generating summary for:", destinationName);

    const prompt = `Create a detailed travel recommendation for ${destinationName}.
User preferences: ${userPreferences.join(", ")}.
Climate: ${climate}.
Available activities: ${activities.join(", ")}.

Generate REALISTIC and SPECIFIC pros and cons based on these preferences. Make them tailored and relevant.

Return ONLY a JSON object with this exact structure (no other text):
{
  "whyMatch": "2-3 sentences explaining why this destination specifically matches their stated preferences",
  "pros": ["specific pro 1 related to their preferences", "specific pro 2", "specific pro 3", "specific pro 4"],
  "cons": ["realistic concern 1", "realistic concern 2"],
  "bestFor": "One sentence describing the ideal traveler profile for this destination",
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"]
}`;

    const content = await callGeminiAPI(prompt, apiKey);

    if (!content) {
      console.warn("[Gemini] No content returned — using static summary");
      return buildStaticSummary(destinationName, userPreferences, climate, activities);
    }

    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log("[Gemini] Summary generated");
        // Cache the result
        geminiCache.set(cacheKey, result)
        return result;
      }
    } catch (parseError) {
      console.warn("[Gemini] JSON parse failed — using static summary:", parseError);
      return buildStaticSummary(destinationName, userPreferences, climate, activities);
    }

    console.warn("[Gemini] No JSON match in response — using static summary");
    return buildStaticSummary(destinationName, userPreferences, climate, activities);
  } catch (error) {
    console.warn("[Gemini] Error — using static summary:", error);
    return buildStaticSummary(destinationName, userPreferences, climate, activities);
  }
}

export async function generateActivities(
  destinationName: string,
  preferences: string[],
  climate: string
): Promise<Array<{ title: string; description: string; duration: string }> | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("[Gemini] API key not configured");
      return null;
    }

    console.log("[Gemini] Generating activities for:", destinationName);

    const prompt = `Generate 5 travel activities for ${destinationName} based on user preferences: ${preferences.join(", ")}, in a ${climate} climate.

Return ONLY a JSON array with this exact structure (no other text):
[
  {
    "title": "Activity Name",
    "description": "1-2 sentence description",
    "duration": "2-3 hours" or "Full day" or "Half day"
  }
]`;

    const content = await callGeminiAPI(prompt, apiKey);
    
    if (!content) {
      console.error("[Gemini] Failed to get response");
      return null;
    }

    try {
      // Extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log("[Gemini] Activities generated:", result.length);
        return result;
      }
    } catch (parseError) {
      console.error("[Gemini] Error parsing response:", parseError);
      return null;
    }

    return null;
  } catch (error) {
    console.error("[Gemini] Error:", error);
    return null;
  }
}
