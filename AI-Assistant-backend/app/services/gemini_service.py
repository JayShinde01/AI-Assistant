import google.generativeai as genai
from app.config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("model/gemini-1.5-flash")


def generate_ai_response(messages):

    try:

        prompt_parts = []

        for msg in messages:
            prompt_parts.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [msg.message]
            })

        response = model.generate_content(prompt_parts)

        return response.text

    except Exception as e:
        return "Sorry, AI service is temporarily unavailable."