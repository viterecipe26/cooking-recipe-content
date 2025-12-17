
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";

// --- UTILITIES ---
export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper to get API Key (Client-side safe)
const getApiKey = async (): Promise<string> => {
    if (process.env.API_KEY) {
        return process.env.API_KEY;
    }
    try {
        const response = await fetch('/api/get-key');
        if (!response.ok) {
             console.warn(`Failed to fetch API key from /api/get-key. Status: ${response.status}`);
             return '';
        }
        const data = await response.json();
        return data.apiKey || '';
    } catch (e) {
        console.warn("Error attempting to fetch API key:", e);
        return '';
    }
}

// Factory function to get a new AI instance dynamically
const getGenerativeAI = async () => {
  const apiKey = await getApiKey();
  if (!apiKey) {
      throw new Error("An API Key must be set. If running locally, ensure you use 'vercel dev' to serve the API route, or configure your environment variables correctly in Vercel.");
  }
  return new GoogleGenAI({ apiKey });
};

export class BillingRequiredError extends Error {
  isBillingError: boolean = true;
  constructor(message: string) {
    super(message);
    this.name = 'BillingRequiredError';
  }
}

async function retryRequest<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
  let lastError: any | undefined; // Use 'any' for the raw error object to check its structure
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) { // Catch as 'any' for direct error object inspection
      console.error(`API request failed (Attempt ${i + 1}/${retries}):`, error);
      lastError = error;

      // The actual error details from the API are often nested under an 'error' property.
      const apiError = error?.error || error;

      // Check for RESOURCE_EXHAUSTED specifically due to free tier limit: 0
      if (apiError?.status === "RESOURCE_EXHAUSTED" && Array.isArray(apiError.details)) {
        const hasZeroQuotaViolation = apiError.details.some((detail: any) =>
          detail['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure' &&
          Array.isArray(detail.violations) &&
          detail.violations.some((violation: any) =>
            (violation.quotaMetric?.includes('_free_tier_requests') || violation.quotaMetric?.includes('_free_tier_input_token_count')) &&
            (apiError.message.includes('limit: 0') || apiError.message.includes('Quota exceeded for metric')) // Fallback for message
          )
        );
        if (hasZeroQuotaViolation) {
          throw new BillingRequiredError("Your free tier quota for this operation is 0. Please select an API key linked to a billed account.");
        }
      }

      if (i < retries - 1) {
        await delay(delayMs * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
  // If all retries failed, construct a helpful error message.
  const finalApiError = lastError?.error || lastError;
  const errorMessage = finalApiError?.message || JSON.stringify(lastError);
  throw new Error(`Failed to call the Gemini API after ${retries} attempts. Please try again. Last error: ${errorMessage}`);
}

// Helper to verify if a URL is valid/working using a CORS proxy
const verifyUrl = async (url: string): Promise<boolean> => {
    if (!url || !url.startsWith('http')) return false;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
        
        // Using corsproxy.io to bypass CORS issues on client-side
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        
        const response = await fetch(proxyUrl, {
            method: 'GET', 
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        // We consider 200 range as valid. Some sites might return 403 via proxy, 
        // but generally 404s will be accurately reported.
        return response.ok;
    } catch (e) {
        // If fetch fails (timeout or network error), assume link is bad/unreachable
        return false;
    }
};

// --- CONSTANTS ---
const DEFAULT_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Salad'];
const FRENCH_CATEGORIES = [
    'Moins de 3€ / pers', 
    'Repas Familiaux', 
    'Menu Fin de Mois', 
    'Spécial Étudiant', 
    'Entrées & Apéros', 
    'Plats Principaux', 
    'Desserts Éco', 
    'Boulangerie Maison', 
    'Recettes Airfryer', 
    'Batch Cooking', 
    'Prêt en 20 min', 
    'Lunchbox', 
    'Cuisiner les Restes', 
    'Calendrier de Saison', 
    'Fait Maison (DIY)', 
    'Astuces Cuisine'
];

const ENGLISH_HEALTH_SITES = [
    'Healthline: https://www.healthline.com',
    'Medical News Today: https://www.medicalnewstoday.com',
    'Harvard T.H. Chan School of Public Health: https://www.hsph.harvard.edu/nutritionsource/',
    'Mayo Clinic: https://www.mayoclinic.org',
    'WebMD: https://www.webmd.com',
    'EatRight: https://www.eatright.org',
    'NIH: https://www.nih.gov',
    'USDA FoodData Central: https://fdc.nal.usda.gov',
    'Cleveland Clinic: https://health.clevelandclinic.org',
    'Verywell Fit: https://www.verywellfit.com'
];

const FRENCH_HEALTH_SITES = [
    'Manger Bouger (PNNS): https://www.mangerbouger.fr',
    'Ameli (Assurance Maladie): https://www.ameli.fr',
    'Vidal (Reference Medicale): https://www.vidal.fr',
    'Doctissimo (Sante): https://www.doctissimo.fr/sante',
    'PasseportSanté: https://www.passeportsante.net',
    'Inserm: https://www.inserm.fr',
    'ANSES: https://www.anses.fr',
    'Ministère de la Santé: https://sante.gouv.fr',
    'AlloDocteurs: https://www.allodocteurs.fr'
];

// --- TYPES ---
export interface RecipeSections {
  ingredients: string[];
  instructions: string[];
  nutritionFacts: string;
  category: string;
}

export interface ArticleComponents {
    targetKeyword: string;
    relatedKeywords: string;
    internalLinks: string;
    externalLinks: string;
    ingredients: string;
    instructions: string;
    nutrition: string;
    faqs: string;
    competitorAnalysis: string;
    category: string;
}

export interface ImageDetails {
    prompt: string;
    title: string;
    altText: string;
    caption: string;
    description: string;
}

export interface AllImageDetails {
    featuredImage: ImageDetails;
    ingredientsImage: ImageDetails;
    stepImages: ImageDetails[];
}

export interface PinterestPinDetails {
    headline: string;
    description: string;
    altText: string;
    imageGuidance: string;
}

export interface AllPinterestContent {
    pins: PinterestPinDetails[];
}


// --- API FUNCTIONS ---

// Step 1: Deep Analysis
export const generateCompetitorAnalysis = async (keyword: string, region: string, language: string, competitorContent: string): Promise<string> => {
    const ai = await getGenerativeAI(); // Create instance before each call
    const textModel = 'gemini-2.5-flash';
    const prompt = `
        Role: Expert SEO Content Analyst
        Task: Analyze the provided competitor content for the keyword "${keyword}" with a target audience in ${region} who speak ${language}.
        
        Competitor Content (separated by '---'):
        ---
        ${competitorContent}
        ---

        Provide a detailed analysis covering the following points in markdown format:
        - **Common Themes & Topics:** Identify the core topics, sub-topics, and recurring themes across all articles.
        - **Content Structure & Format:** Analyze the typical article structure (e.g., listicle, how-to guide), use of headings, lists, and multimedia.
        - **Key Entities & Concepts:** List the most important people, places, and concepts mentioned.
        - **User Intent:** Determine the primary user intent (informational, commercial, transactional) the content is satisfying.
        - **Sentiment & Tone:** Describe the overall tone and sentiment (e.g., formal, casual, expert, enthusiastic).
        - **Content Gaps:** Identify any obvious topics or questions that are NOT being answered by the competitors.
    `;
    // FIX: Explicitly type the generic for retryRequest to ensure 'response' is correctly typed.
    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({ model: textModel, contents: prompt }));
    return response.text;
};

export const generateOutrankingStrategy = async (analysisResult: string): Promise<string> => {
    const ai = await getGenerativeAI(); // Create instance before each call
    const textModel = 'gemini-2.5-flash';
    const prompt = `
        Role: Master SEO Strategist
        Task: Based on the following competitor analysis, create a comprehensive content strategy to outrank them.
        
        Competitor Analysis:
        ---
        ${analysisResult}
        ---

        Your strategy must be actionable and detailed, presented in markdown. Focus on:
        - **Unique Angle:** Propose a unique angle or hook to make our content stand out.
        - **Content Brief/Outline:** Create a detailed H2/H3 outline for the new article.
        - **E-E-A-T Improvements:** Suggest specific ways to improve Expertise, Experience, Authoritativeness, and Trustworthiness (e.g., expert quotes, original data, author bios).
        - **Multimedia Strategy:** Recommend types of images, videos, or infographics to include.
        - **Content Gap Fulfillment:** Explicitly state how the new content will fill the identified gaps.
    `;
    // FIX: Explicitly type the generic for retryRequest to ensure 'response' is correctly typed.
    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({ model: textModel, contents: prompt }));
    return response.text;
};

export const generateRecipeSections = async (analysisResult: string, region: string = 'United States', language: string = 'English'): Promise<RecipeSections> => {
    const ai = await getGenerativeAI(); // Create instance before each call
    const textModel = 'gemini-2.5-flash';

    // Determine category list based on region/language
    const isFrenchContext = region === 'France' && language === 'French';
    const categoriesList = isFrenchContext ? FRENCH_CATEGORIES : DEFAULT_CATEGORIES;

    const prompt = `
        Based on the provided competitor analysis for a recipe, synthesize the following sections into a structured JSON object:
        1. A combined and comprehensive list of all ingredients mentioned.
        2. A clear, step-by-step set of instructions, synthesized from the common steps.
        3. A typical nutrition facts block based on the ingredients.
        4. The single most appropriate category for this recipe from the allowed list.

        Competitor Analysis:
        ---
        ${analysisResult}
        ---
    `;

    // FIX: Explicitly type the generic for retryRequest to ensure 'response' is correctly typed.
    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                    instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    nutritionFacts: { type: Type.STRING },
                    category: { 
                        type: Type.STRING, 
                        enum: categoriesList 
                    }
                },
                required: ['ingredients', 'instructions', 'nutritionFacts', 'category']
            }
        }
    }));
    
    try {
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Failed to parse recipe sections JSON:", response.text);
        throw new Error("Error generating recipe sections: Invalid JSON format received.");
    }
    
};

// Step 2: Article Components
export const generateRelatedKeywords = async (analysisResult: string): Promise<string> => {
    const ai = await getGenerativeAI(); // Create instance before each call
    const textModel = 'gemini-2.5-flash';
    const prompt = `Based on the competitor analysis provided, generate a list of 15-20 highly relevant related keywords and LSI terms. Output them as a simple, multi-line string. \n\nAnalysis:\n${analysisResult}`;
    // FIX: Explicitly type the generic for retryRequest to ensure 'response' is correctly typed.
    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({ model: textModel, contents: prompt }));
    return response.text;
};

export const generateFAQs = async (analysisResult: string, language: string = 'English'): Promise<string> => {
    const ai = await getGenerativeAI(); // Create instance before each call
    const textModel = 'gemini-2.5-flash';
    const prompt = `Based on the competitor analysis, generate 4 relevant "Frequently Asked Questions" (FAQs) that would be valuable to include in our article. Format them as a multi-line string with each question on a new line. The FAQs must be written in ${language}. \n\nAnalysis:\n${analysisResult}`;
    // FIX: Explicitly type the generic for retryRequest to ensure 'response' is correctly typed.
    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({ model: textModel, contents: prompt }));
    return response.text;
};

export const generateInternalLinks = async (keyword: string): Promise<string> => {
    const ai = await getGenerativeAI(); // Create instance before each call
    const textModel = 'gemini-2.5-flash';
    const prompt = `For a main article about "${keyword}", suggest 5-7 plausible internal link ideas. For each, provide the anchor text and a hypothetical blog post title it could link to. Format as "Anchor Text: Blog Post Title".`;
    // FIX: Explicitly type the generic for retryRequest to ensure 'response' is correctly typed.
    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({ model: textModel, contents: prompt }));
    return response.text;
};

export const generateExternalLinks = async (keyword: string, analysisResult: string, region: string = 'United States', language: string = 'English'): Promise<string> => {
    const ai = await getGenerativeAI();
    const textModel = 'gemini-2.5-flash';
    
    const isFrench = region === 'France' && language === 'French';
    const siteList = isFrench ? FRENCH_HEALTH_SITES.join('\n- ') : ENGLISH_HEALTH_SITES.join('\n- ');
    
    // Prompt asks for MORE links than needed so we can filter out broken ones
    const prompt = `
        Role: Expert SEO Analyst and Nutrition Researcher
        Task: Based on the keyword "${keyword}" and the provided competitor analysis, select 8-10 of the MOST RELEVANT articles from the list below to use as authoritative external links. 
        
        **CRITICAL REQUIREMENT:** 
        - The links MUST focus on **health, nutrition, and medical facts** (e.g., benefits of an ingredient, nutritional values, safety). 
        - Do NOT link to other recipe sites or cooking blogs.
        - Target Audience: ${region} (${language}).
        - Anchor text must be in ${language}.

        Competitor Analysis (for context):
        ---
        ${analysisResult}
        ---

        List of Authoritative Websites to choose from:
        - ${siteList}

        Instructions:
        1.  Identify key nutritional topics, health claims, or specific ingredients from the analysis that would benefit from an authoritative external citation.
        2.  For each topic, suggest a plausible, specific link from ONE of the websites listed above. It should be a realistic path (e.g., ${isFrench ? 'https://www.mangerbouger.fr/manger-mieux' : 'https://www.healthline.com/nutrition/benefits-of-olive-oil'}).
        3.  Provide a natural anchor text for each link in ${language}.
        4.  Format the output as a multi-line string, with each suggestion on a new line: "Anchor Text: Full URL"
    `;
    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({ model: textModel, contents: prompt }));
    
    // Process and verify the links
    const text = response.text || '';
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const verifiedLinks: string[] = [];
    
    for (const line of lines) {
        // Stop if we have enough valid links (target 4)
        if (verifiedLinks.length >= 4) break;

        // Extract URL using simple regex
        const urlMatch = line.match(/(https?:\/\/[^\s)]+)/);
        if (urlMatch) {
            const url = urlMatch[0];
            // Check if link is alive
            const isValid = await verifyUrl(url);
            if (isValid) {
                verifiedLinks.push(line);
            }
        }
    }

    // If we couldn't verify enough, return what we have (better than nothing, or fallback to original text if empty)
    return verifiedLinks.length > 0 ? verifiedLinks.join('\n') : text;
};


// Step 3: Article Generation
export const generateFullArticle = async (components: ArticleComponents): Promise<string> => {
    const ai = await getGenerativeAI(); // Create instance before each call
    const textModel = 'gemini-2.5-flash';
    const prompt = `
        Role: World-class SEO Content Writer and Chef, with a proven track record of creating articles that rank #1 on Google.
        Task: Write a complete, high-quality, and engaging recipe article using ALL of the provided components. The primary goal is to create content that is superior to all known competitors, ensuring it will rank at the very top of search results. The article must be well-structured, easy to read, and optimized for the target keyword. The final article must be professional, highly engaging, and concise, **strictly not exceeding 2000 words**.
        
        **IMPORTANT INSTRUCTIONS:**
        1.  The final output MUST be a single block of text.
        2.  Enclose the main article content between \`[ARTICLE_START]\` and \`[ARTICLE_END]\`. The very first line of the article content should be the main title, starting with '#'.
        3.  Enclose 3-5 SEO title tag suggestions between \`[TITLE_TAGS_START]\` and \`[TITLE_TAGS_END]\`. Each title must be between 40-57 characters, ideally under 50.
        4.  Enclose 3-5 meta description suggestions between \`[META_DESCRIPTIONS_START]\` and \`[META_DESCRIPTIONS_END]\`. Each meta description must be 140-150 characters, include the primary keyword, have a clear call to action, and be engaging without keyword stuffing.
        5.  Enclose a detailed recipe recap for a recipe card between \`[RECIPE_RECAP_START]\` and \`[RECIPE_RECAP_END]\`. As a culinary content creator, your task is to craft a detailed and visually appealing recap that follows a professional and user-friendly structure. It must include the following key elements: a short description of the recipe (30 words), Recipe Details (Prep Time, Cook Time, Total Time, Servings, Calories), and Categorization of the recipe (Course, Cuisine, Diet, Method, Keyword, Skill Level).
        6.  Use the provided blog category: "${components.category || 'Dinner'}". Enclose it between \`[CATEGORY_START]\` and \`[CATEGORY_END]\`.
        7.  Enclose a valid JSON object formatted for a recipe card plugin (like WPRM) between \`[RECIPE_JSON_START]\` and \`[RECIPE_JSON_END]\`. This JSON MUST strictly follow the Schema.org/Recipe standard. It must include: name (the article H1 title), description (a short summary), keywords (a comma-separated string from the related keywords), recipeYield, prepTime (in ISO 8601 duration format, e.g., 'PT15M'), cookTime (ISO 8601), totalTime (ISO 8601), recipeIngredient (as an array of strings from the components), recipeInstructions (as an array of objects, each with '@type': 'HowToStep' and 'text', from the components), nutrition (as an object with '@type': 'NutritionInformation' and a 'calories' property e.g. "250 calories"), recipeCategory (e.g., '${components.category}'), and recipeCuisine (e.g., 'Italian'). The data for this JSON should be derived from the article components and the recipe recap you generate.
        8.  **Consistency Mandate**: The lists of ingredients and instructions you generate MUST be used identically in the main article body, the recipe recap, and the recipe JSON. There should be absolutely no variation between these sections.
        9.  **Nutrition Placement**: Do NOT include a separate '## Nutrition' section or list within the main article body text (between \`[ARTICLE_START]\` and \`[ARTICLE_END]\`). The nutrition information should ONLY be presented professionally within the \`[RECIPE_RECAP]\` block and the \`[RECIPE_JSON]\` object.

        --- ARTICLE COMPONENTS ---
        - Target Keyword: ${components.targetKeyword}
        - Related Keywords to include naturally: ${components.relatedKeywords}
        - Internal Link Opportunities: You MUST naturally weave the following internal links into the article's text using markdown format (\`[Anchor Text](URL)\`). If specific URLs are not provided, use \`#\` or a placeholder path based on the title. Do NOT simply list the links at the end. **IMPORTANT: Do NOT place links in the Introduction (first 2-3 paragraphs). Distribute them naturally throughout the MIDDLE sections of the article body.** The internal links to integrate are:\n${components.internalLinks}
        - External Link Opportunities: You MUST naturally weave the following external links into the article's text using markdown format (\`[anchor text](URL)\`). Use the provided anchor text for the hyperlink. Do NOT simply list the links. For example, if an entry is "health benefits of olive oil: https://example.com", you should create a sentence like "...numerous studies have highlighted the [health benefits of olive oil](https://example.com) for heart health." **IMPORTANT: Do NOT place links in the Introduction. Distribute them naturally throughout the MIDDLE sections of the article body.** The links to integrate are:\n${components.externalLinks}
        - FAQs to answer in the article: ${components.faqs}
        
        --- RECIPE DETAILS ---
        - Ingredients:\n${components.ingredients}
        - Instructions:\n${components.instructions}
        - Nutrition Info:\n${components.nutrition}

        Now, write the complete article and associated assets following all instructions.
    `;
    // FIX: Explicitly type the generic for retryRequest to ensure 'response' is correctly typed.
    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({ 
        model: textModel, 
        contents: prompt, 
        config: { 
            temperature: 0.7,
            maxOutputTokens: 8192,
        } 
    }));
    return response.text;
};

export const regenerateArticle = async (components: ArticleComponents, originalArticle: string, feedback: string): Promise<string> => {
    const ai = await getGenerativeAI(); // Create instance before each call
    const textModel = 'gemini-2.5-flash';
    const prompt = `
        Role: World-Class SEO Content Editor and Strategist
        Task: Your goal is to create a superior, revised version of the 'Original Article' that is **guaranteed to outperform all competitors and achieve the highest possible ranking on Google**. You MUST incorporate all the 'Improvement Feedback' provided. This feedback is a critical analysis of the original article's strengths and weaknesses compared to competitors. Your revision must correct all weaknesses, amplify the strengths, and implement all suggested improvements to ensure the new version is definitively better and will outrank competitors.

        Use the full original 'Article Components' and 'Recipe Details' for context, but prioritize the 'Improvement Feedback' for your changes. The revised article must be professional, highly engaging, concise, **strictly not exceeding 2000 words**, and maintain the required output format.

        **CRITICAL INSTRUCTIONS (MAINTAIN THIS FORMAT):**
        1.  The final output MUST be a single block of text.
        2.  Enclose the revised article content between \`[ARTICLE_START]\` and \`[ARTICLE_END]\`. The title (#) must be the first line.
        3.  Enclose 3-5 revised SEO title tag suggestions between \`[TITLE_TAGS_START]\` and \`[TITLE_TAGS_END]\`. Each title must be between 40-57 characters, ideally under 50.
        4.  Enclose 3-5 revised meta description suggestions between \`[META_DESCRIPTIONS_START]\` and \`[META_DESCRIPTIONS_END]\`. Each meta description must be 140-150 characters, include the primary keyword, have a clear call to action, and be engaging without keyword stuffing.
        5.  Enclose a detailed, revised recipe recap between \`[RECIPE_RECAP_START]\` and \`[RECIPE_RECAP_END]\`. As a culinary content creator, your task is to craft a detailed and visually appealing recap that follows a professional and user-friendly structure. It must include the following key elements: a short description of the recipe (30 words), Recipe Details (Prep Time, Cook Time, Total Time, Servings, Calories), and Categorization of the recipe (Course, Cuisine, Diet, Method, Keyword, Skill Level).
        6.  Use the provided blog category: "${components.category || 'Dinner'}". Enclose it between \`[CATEGORY_START]\` and \`[CATEGORY_END]\`.
        7.  Enclose a valid, revised JSON object formatted for a recipe card plugin between \`[RECIPE_JSON_START]\` and \`[RECIPE_JSON_END]\`, following the same Schema.org/Recipe structure and requirements as the initial generation.
        8.  **Consistency Mandate**: The lists of ingredients and instructions you generate for the revised article MUST be used identically in the main article body, the recipe recap, and the recipe JSON. There should be absolutely no variation between these sections.
        9.  **Nutrition Placement**: Do NOT include a separate '## Nutrition' section or list within the main article body text. The nutrition information should ONLY be presented professionally within the \`[RECIPE_RECAP]\` block and the \`[RECIPE_JSON]\` object.

        --- IMPROVEMENT FEEDBACK (Incorporate these changes) ---
        ${feedback}

        --- ORIGINAL ARTICLE (To be revised) ---
        ${originalArticle}

        --- ARTICLE COMPONENTS (for context) ---
        - Target Keyword: ${components.targetKeyword}
        - Related Keywords to include naturally: ${components.relatedKeywords}
        - Internal Link Opportunities: You MUST naturally weave the following internal links into the article's text using markdown format (\`[Anchor Text](URL)\`). If specific URLs are not provided, use \`#\` or a placeholder path based on the title. Do NOT simply list the links at the end. **IMPORTANT: Do NOT place links in the Introduction. Distribute them naturally throughout the MIDDLE sections of the article body.** The internal links to integrate are:\n${components.internalLinks}
        - External Link Opportunities: You MUST naturally weave the following external links into the article's text using markdown format (\`[anchor text](URL)\`). Use the provided anchor text for the hyperlink. Do NOT simply list the links. For example, if an entry is "health benefits of olive oil: https://example.com", you should create a sentence like "...numerous studies have highlighted the [health benefits of olive oil](https://example.com) for heart health." **IMPORTANT: Do NOT place links in the Introduction. Distribute them naturally throughout the MIDDLE sections of the article body.** The links to integrate are:\n${components.externalLinks}
        - FAQs to answer in the article: ${components.faqs}
        
        --- RECIPE Details (for context) ---
        - Ingredients:\n${components.ingredients}
        - Instructions:\n${components.instructions}
        - Nutrition Info:\n${components.nutrition}
        
        Now, produce the complete, rewritten, and superior article and its assets, strictly following all instructions and incorporating all feedback.
    `;
    // FIX: Explicitly type the generic for retryRequest to ensure 'response' is correctly typed.
    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({ 
        model: textModel, 
        contents: prompt, 
        config: { 
            temperature: 0.8,
            maxOutputTokens: 8192,
        } 
    }));
    return response.text;
};

// Step 4: Post-Generation Analysis & Assets
export const compareArticleWithCompetitors = async (generatedArticle: string, competitorAnalysis: string): Promise<string> => {
    const ai = await getGenerativeAI(); // Create instance before each call
    const textModel = 'gemini-2.5-flash';
    const prompt = `
        Role: Critical SEO Analyst
        Task: Compare the 'Generated Article' against the 'Competitor Analysis'. Provide a concise, critical review in markdown format. 
        
        Identify:
        - **Strengths:** Where does our article excel compared to the competition? (e.g., better instructions, more comprehensive, better E-E-A-T).
        - **Weaknesses:** Where does our article fall short? (e.g., missed topics, less engaging tone).
        - **Actionable Improvements:** Suggest 3-5 specific, actionable changes to make our article definitively the best.

        --- GENERATED ARTICLE ---
        ${generatedArticle}

        --- COMPETITOR ANALYSIS ---
        ${competitorAnalysis}
    `;
    // FIX: Explicitly type the generic for retryRequest to ensure 'response' is correctly typed.
    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({ model: textModel, contents: prompt }));
    return response.text;
};

export const generateYouTubeScript = async (articleTitle: string, articleContent: string): Promise<string> => {
    const ai = await getGenerativeAI();
    const textModel = 'gemini-2.5-flash';
    const prompt = `
        Role: Expert Video Director and Scriptwriter for culinary content.
        Task: Create a professionally detailed 5-scene video script based on the provided recipe article.

        Article Title: "${articleTitle}"
        --- ARTICLE CONTENT ---
        ${articleContent}
        --- END ARTICLE CONTENT ---

        **CRITICAL INSTRUCTIONS:**
        1.  **Structure:** The script must consist of **EXACTLY 5 SCENES**.
        2.  **Recipe Logic:** Map the recipe's creation process logically into these 5 scenes (e.g., Intro, Prep, Cook, Plate, Outro).
        3.  **Visual Detail:** The "Video Guide" for each scene must be **professionally detailed**. Include specific camera angles (e.g., Top-down, 45-degree, Extreme Close-up), lighting notes, and precise descriptions of the action (e.g., "Slow-motion drizzle of glaze," "Crisp sound of chopping").
        4.  **Formatting:** Use the following format for each scene:
            ### Scene X: [Descriptive Title]
            **Visual Guide:** [Detailed camera instructions and action description]
            **Audio/Narration:** [The script to be spoken]
            **Duration:** [Approximate duration]
        5.  **Tone:** Enthusiastic, clear, and appetizing.

        Now, write the complete 5-scene script.
    `;
    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            temperature: 0.7,
            maxOutputTokens: 4096,
        }
    }));
    return response.text;
};

export const generateReelsScript = async (articleTitle: string, ingredients: string, instructions: string): Promise<string> => {
    const ai = await getGenerativeAI();
    const textModel = 'gemini-2.5-flash';
    const prompt = `
        Role: Expert Social Media Content Creator specializing in food.
        Task: Create a viral, high-energy 90-second (1.5 minute) vertical video script (for Instagram Reels, TikTok, YouTube Shorts) for the recipe: "${articleTitle}".

        Recipe Context:
        Ingredients: ${ingredients}
        Instructions: ${instructions}

        **Script Requirements:**
        1. **Format:** Vertical Video (9:16).
        2. **Total Duration:** Strictly 90 seconds (1:30).
        3. **Pacing:** Fast, rhythmic, and visually stimulating (ASMR style elements).
        4. **Structure:**
           - **0:00-0:05 Hook:** A "thumb-stopping" visual of the finished dish + a hook line.
           - **0:05-0:15 Intro:** Quick ingredients overview.
           - **0:15-1:15 The Process:** The step-by-step cooking process condensed into visual highlights. Focus on action verbs (Sizzle, Pour, Chop, Mix).
           - **1:15-1:30 Plating & Taste:** Final garnish, the "money shot" (cheese pull, steam, bite), and a call to action.
        5. **Output Format:**
           Please use the following Markdown format:
           
           ### Title: [Catchy Social Title]
           
           | Time | Visual Scene | Audio / Text Overlay |
           | :--- | :--- | :--- |
           | 0:00 | [Description] | [Audio/Text] |
           ...
    `;
    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            temperature: 0.8,
            maxOutputTokens: 4096,
        }
    }));
    return response.text;
};

export const generateImagePromptsAndMetadata = async (targetKeyword: string, ingredients: string, instructions: string): Promise<AllImageDetails> => {
    const ai = await getGenerativeAI(); // Create instance before each call
    const textModel = 'gemini-2.5-flash';
    const prompt = `
        Role: Master Art Director & SEO Specialist for a professional food blog.
        Task: For a recipe about "${targetKeyword}", create all necessary image prompts and SEO metadata. Generate highly professional, precise, distinctive, and descriptive prompts designed to produce realistic, high-quality, and appealing images that would attract visitors. The style should be bright, appetizing, and professionally styled for a modern food blog.

        Provide a JSON object with the following structure:
        - featuredImage: An object for the main hero image (16:9 aspect ratio, high-resolution).
        - ingredientsImage: An object for a flat-lay or thoughtfully arranged shot of the ingredients (3:4 aspect ratio, clean, inviting).
        - stepImages: An array of objects, one for each key step in the recipe instructions (3:4 aspect ratio, clear, action-oriented visuals).
        
        Each object must contain:
        - prompt: A highly detailed, descriptive prompt for an image generation AI. Include specific details on lighting (e.g., natural daylight), composition (e.g., rule of thirds, leading lines), camera angle (e.g., overhead, close-up), depth of field (e.g., shallow), and overall aesthetic/style (e.g., rustic, minimalist, vibrant). Emphasize realism and appetizing presentation.
        - title: A descriptive, SEO-friendly title for the image file (e.g., "Perfectly Baked Chocolate Chip Cookies Featured Image").
        - altText: A concise, descriptive alt text for accessibility and SEO, describing the visual content accurately (e.g., "Close-up of golden brown chocolate chip cookies on a cooling rack").
        - caption: An engaging caption for the blog post that complements the image (e.g., "The ultimate homemade chocolate chip cookies, fresh from the oven!").
        - description: A longer, keyword-rich description for Pinterest or image sharing sites, highlighting key features and appeal.
        
        --- RECIPE CONTEXT ---
        Main Recipe: ${targetKeyword}
        Ingredients: ${ingredients}
        Key Instructions to Visualize (focus on distinct actions or appealing outcomes for each step): ${instructions}
    `;

    // FIX: Explicitly type the generic for retryRequest to ensure 'response' is correctly typed.
    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    featuredImage: {
                        type: Type.OBJECT,
                        properties: {
                            prompt: { type: Type.STRING },
                            title: { type: Type.STRING },
                            altText: { type: Type.STRING },
                            caption: { type: Type.STRING },
                            description: { type: Type.STRING },
                        },
                        required: ["prompt", "title", "altText", "caption", "description"]
                    },
                    ingredientsImage: {
                        type: Type.OBJECT,
                        properties: {
                            prompt: { type: Type.STRING },
                            title: { type: Type.STRING },
                            altText: { type: Type.STRING },
                            caption: { type: Type.STRING },
                            description: { type: Type.STRING },
                        },
                        required: ["prompt", "title", "altText", "caption", "description"]
                    },
                    stepImages: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                prompt: { type: Type.STRING },
                                title: { type: Type.STRING },
                                altText: { type: Type.STRING },
                                caption: { type: Type.STRING },
                                description: { type: Type.STRING },
                            },
                            required: ["prompt", "title", "altText", "caption", "description"]
                        }
                    }
                },
                required: ["featuredImage", "ingredientsImage", "stepImages"]
            }
        }
    }));
    
    try {
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Failed to parse image details JSON:", response.text);
        throw new Error("Error generating image details: Invalid JSON format received.");
    }
};

export const generatePinterestContent = async (targetKeyword: string, relatedKeywords: string, articleTitle: string): Promise<AllPinterestContent> => {
    const ai = await getGenerativeAI();
    const textModel = 'gemini-2.5-flash';
    const prompt = `
        Role: World-class SEO strategist and Pinterest marketing expert, specializing in food and recipe content.
        Task: Based on the provided recipe details, generate a complete set of assets for 10 unique Pinterest pins designed to maximize reach, clicks, and saves.

        Recipe Context:
        - Main Keyword: ${targetKeyword}
        - Related Keywords: ${relatedKeywords}
        - Article Title: ${articleTitle}

        CRITICAL INSTRUCTIONS:
        1.  Generate assets for exactly 10 unique pins.
        2.  For EACH of the 10 pins, provide:
            - headline: A compelling, SEO-friendly headline (under 100 characters). It must be intriguing and use keywords naturally.
            - description: A keyword-rich description (around 300 characters). Optimize it for Pinterest search, include 3-5 relevant and trending hashtags, and end with a clear call to action.
            - altText: A descriptive and engaging alt text for accessibility and SEO.
            - imageGuidance: Unique and specific guidance for creating a realistic and professional Pinterest image for this specific pin. The image MUST be a vertical collage of two enlarged images of the recipe from different poses and angles. In the center of the main image, there MUST be a professional-looking card in a clear, distinctive color, with the recipe's main keyword in a large, attractive font, and a three-word description of the recipe below it in a small, attractive font. The guidance for each pin should suggest different photo compositions, angles, colors, and text to make each pin unique.

        Provide the output as a single JSON object containing a "pins" array.
    `;

    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    pins: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                headline: { type: Type.STRING },
                                description: { type: Type.STRING },
                                altText: { type: Type.STRING },
                                imageGuidance: { type: Type.STRING },
                            },
                            required: ["headline", "description", "altText", "imageGuidance"]
                        }
                    },
                },
                required: ["pins"]
            }
        }
    }));
    
    try {
        const parsedJson = JSON.parse(response.text);
        // Basic validation
        if (!parsedJson.pins || !Array.isArray(parsedJson.pins)) {
             throw new Error("Invalid JSON structure received from API.");
        }
        return parsedJson;
    } catch (e) {
        console.error("Failed to parse Pinterest content JSON:", response.text);
        throw new Error("Error generating Pinterest content: Invalid JSON format received.");
    }
};

export const generatePinterestKeywords = async (mainKeyword: string, keywordStyle: string): Promise<string[]> => {
    const ai = await getGenerativeAI();
    const textModel = 'gemini-2.5-flash';
    const prompt = `
        Role: Expert SEO and Pinterest Trends Analyst
        Task: Analyze the main keyword "${mainKeyword}" and generate 10 related keywords for Pinterest titles, tailored to the "${keywordStyle}" style.

        Keyword Style Guide:
        - General & Related: A mix of broad and specific terms.
        - Long-tail Questions: Phrase keywords as user search queries (e.g., "how to make...").
        - Trending & Viral: Focus on current popular keywords and angles related to the main keyword.
        - Niche-Specific: Highly targeted for sub-audiences.

        Based on the main keyword and the selected style, provide exactly 10 keywords.
        Output a JSON object with a single key "keywords" which is an array of 10 strings.
    `;
    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    keywords: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ["keywords"]
            }
        }
    }));
    try {
        const parsed = JSON.parse(response.text);
        if (parsed.keywords && Array.isArray(parsed.keywords)) {
            return parsed.keywords;
        }
        throw new Error("Invalid JSON structure from API.");
    } catch (e) {
        console.error("Failed to parse Pinterest keywords JSON:", response.text);
        throw new Error("Error generating Pinterest keywords: Invalid JSON format received.");
    }
};

export const generatePinterestPins = async (mainKeyword: string, relatedKeywords: string, inspirationImage?: { base64: string, mimeType: string }): Promise<AllPinterestContent> => {
    const ai = await getGenerativeAI();
    const visionModel = 'gemini-2.5-flash';

    const prompt = `
        Role: World-class SEO strategist and Pinterest marketing expert, specializing in food and recipe content.
        Task: Based on the provided recipe details, generate a complete set of assets for 10 unique Pinterest pins designed to maximize reach, clicks, and saves.

        Recipe Context:
        - Main Keyword: ${mainKeyword}
        - Related Keywords to use for headlines and descriptions: ${relatedKeywords}
        ${inspirationImage ? "- An inspiration image has been provided for visual style guidance." : ""}

        CRITICAL INSTRUCTIONS:
        1.  Generate assets for exactly 10 unique pins.
        2.  For EACH of the 10 pins, provide:
            a.  **imageGuidance**: A highly detailed, professional, and descriptive prompt for an AI image generator to create a realistic and compelling Pinterest pin. The prompt must be optimized for generating a photorealistic, high-quality image. The image MUST be a vertical collage of two enlarged images of the recipe from different poses and angles. In the center of the main image, there must be a professional-looking card in a clear, distinctive color that complements the food. This card must display the recipe's main keyword ("${mainKeyword}") in a large, attractive font (e.g., modern serif, elegant script), and a three-word description of the recipe below it in a smaller, clean font (e.g., sans-serif). For each of the 10 pins, you must provide unique and specific guidance, varying the following elements:
                - **Photography Style**: e.g., bright and airy, dark and moody, rustic, minimalist.
                - **Lighting**: e.g., soft natural daylight from a side window, warm golden hour light, dramatic backlighting.
                - **Composition**: e.g., rule of thirds, overhead flat lay, 45-degree angle shot, extreme close-up showing texture.
                - **Props & Styling**: e.g., include fresh ingredients, linen napkins, vintage cutlery, wooden boards, etc.
                - **Card Details**: e.g., card color, font styles, and the three-word description.
                - **Technical Details**: e.g., photorealistic, DSLR photo, f/1.8 aperture, high detail.
            b.  **headline**: A compelling, SEO-friendly headline (under 100 characters). It must be intriguing, easy to click, motivate action, and naturally use the provided keywords.
            c.  **description**: A keyword-rich description (approximately 300 characters). Optimize it for Pinterest search, include 3-5 relevant and trending hashtags, and end with a clear call to action.
            d.  **altText**: A descriptive and engaging alt text for accessibility and SEO, describing the visual content of the pin.

        Provide the output as a single JSON object containing a "pins" array, where each element is an object with "imageGuidance", "headline", "description", and "altText".
    `;
    
    // FIX: Explicitly type the `parts` array to allow both text and inlineData objects, resolving a TypeScript error.
    const parts: ({ text: string } | { inlineData: { mimeType: string; data: string; } })[] = [{ text: prompt }];
    
    if (inspirationImage) {
        parts.push({
            inlineData: {
                mimeType: inspirationImage.mimeType,
                data: inspirationImage.base64,
            }
        });
    }

    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
        model: visionModel,
        contents: { parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    pins: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                headline: { type: Type.STRING },
                                description: { type: Type.STRING },
                                altText: { type: Type.STRING },
                                imageGuidance: { type: Type.STRING },
                            },
                            required: ["headline", "description", "altText", "imageGuidance"]
                        }
                    },
                },
                required: ["pins"]
            }
        }
    }));

    try {
        const parsedJson = JSON.parse(response.text);
        if (!parsedJson.pins || !Array.isArray(parsedJson.pins) || parsedJson.pins.length === 0) {
             throw new Error("Invalid JSON structure or empty pins array received from API.");
        }
        return parsedJson;
    } catch (e) {
        console.error("Failed to parse Pinterest pins JSON:", response.text);
        throw new Error("Error generating Pinterest pins: Invalid JSON format received.");
    
    }
};

export const generateImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'): Promise<string> => {
    const ai = await getGenerativeAI(); // Create instance before each call
    const imageModel = 'imagen-4.0-generate-001';
    
    // The response type for generateImages is not explicitly exported from the SDK, so we use `any`
    // and ensure robust error handling and type checking
    try {
        const response: any = await retryRequest(() => ai.models.generateImages({
            model: imageModel,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: aspectRatio,
                outputMimeType: 'image/jpeg',
            },
        }));

        const imageBytes = response?.generatedImages?.[0]?.image?.imageBytes;
        if (imageBytes) {
            return `data:image/jpeg;base64,${imageBytes}`;
        }
        throw new Error('No image data returned from API');
    } catch (e: any) {
        console.error("Image generation failed:", e);
        if (e instanceof BillingRequiredError) throw e;
        throw new Error(`Image generation failed: ${e.message}`);
    }
};
