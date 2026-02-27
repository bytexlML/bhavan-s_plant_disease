import os
import io
import json
import base64
from openai import OpenAI
from PIL import Image
from dotenv import load_dotenv
from app.explanations.engine import PLANT_CLASSES

# Load environment variables
import sys
if getattr(sys, 'frozen', False):
    # Try internal bundled .env first
    bundle_env = os.path.join(sys._MEIPASS, "backend", ".env")
    if os.path.exists(bundle_env):
        load_dotenv(bundle_env)
    # Also allow external .env to override
    load_dotenv(os.path.join(os.path.dirname(sys.executable), ".env"))
else:
    load_dotenv()

class ModelService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
            print("OpenAI GPT-4o Client initialized.")
        else:
            self.client = None
            print("OPENAI_API_KEY not found. Model service will run in Mock mode.")

    async def predict_with_llm(self, image_bytes):
        """Perform multimodal inference using OpenAI GPT-4o."""
        if not self.api_key or not self.client:
            return {
                "predicted_class": PLANT_CLASSES[30],
                "confidence": 0.99,
                "analysis": "OpenAI API Key missing. Showing demo result."
            }

        prompt = f"""
        You are a senior Plant Health Expert from Bhavan's Vivekananda College. 
        Analyze this plant leaf image for diseases or nutrient deficiencies.
        
        Strict Rules:
        1. Select the most likely category from this list: {PLANT_CLASSES}.
        2. DO NOT mention you are an AI, a machine learning model, or OpenAI.
        3. Speak with authority and professional expertise.
        4. Focus on scientific biological observations.
        
        Provide the output in JSON format:
        {{
          "predicted_class": "Exact string from the categorical list",
          "confidence": 0.0 to 1.0,
          "analysis": "Professional scientific reasoning (describe visible biological symptoms)",
          "recommendation": "Expert management strategy and next steps"
        }}
        """
        
        try:
            # Encode image to base64 for OpenAI
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                response_format={ "type": "json_object" }
            )
            
            # Parse JSON response
            data = json.loads(response.choices[0].message.content)
            return data
        except Exception as e:
            print(f"OpenAI API Error: {e}")
            return {
                "predicted_class": PLANT_CLASSES[30],
                "confidence": 0.95,
                "analysis": f"AI Expert encountered an error: {str(e)}. Falling back to default."
            }

model_service = ModelService()
