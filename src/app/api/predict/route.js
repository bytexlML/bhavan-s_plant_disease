import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PLANT_CLASSES, EXPLANATIONS } from '../../utils/explanations';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Check for API Key
        if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
            console.warn("GEMINI_API_KEY is missing. Running in simulation mode.");
            // Simulation mode for demo
            return NextResponse.json({
                plant_name: "Apple",
                predicted_disease: "Apple Scab",
                confidence_score: "98.50%",
                category: "Fungal",
                biological_explanation: "Simulation Mode: GEMINI_API_KEY not configured. To enable real AI diagnosis, please add your key to the environment variables.",
                recommended_action: "Add GEMINI_API_KEY to your .env or Vercel settings."
            });
        }

        const bytes = await file.arrayBuffer();
        const base64Image = Buffer.from(bytes).toString('base64');

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are a senior Plant Health Expert from Bhavan's Vivekananda College. 
        Analyze this plant leaf image for diseases or nutrient deficiencies.
        
        Strict Rules:
        1. Select the most likely category from this list: ${PLANT_CLASSES.join(', ')}.
        2. DO NOT mention you are an AI, a machine learning model, or Google.
        3. Speak with authority and professional expertise.
        4. Focus on scientific biological observations.
        
        Provide the output in JSON format:
        {
          "predicted_class": "Exact string from the categorical list",
          "confidence": 0.0 to 1.0,
          "analysis": "Professional scientific reasoning (describe visible biological symptoms)",
          "recommendation": "Expert management strategy and next steps"
        }
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/jpeg"
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Extract JSON from response (handling potential markdown blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const aiData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

        const prediction = aiData.predicted_class || PLANT_CLASSES[3];
        const explanation = EXPLANATIONS[prediction] || EXPLANATIONS[PLANT_CLASSES[3]];

        return NextResponse.json({
            plant_name: prediction.split('___')[0].replace(/_/g, ' '),
            predicted_disease: prediction.split('___')[1].replace(/_/g, ' '),
            confidence_score: `${(aiData.confidence * 100 || 95).toFixed(2)}%`,
            category: explanation.category,
            biological_explanation: aiData.analysis || explanation.scientific_reason,
            recommended_action: aiData.recommendation || explanation.recommended_action
        });

    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({
            error: "Diagnostic system failure",
            details: error.message
        }, { status: 500 });
    }
}
