import google.generativeai as genai
from app.config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-1.5-flash")

def generate_ai_response(messages):
    prompt = ""

    for msg in messages:
        if msg.role == "user":
            prompt += f"User: {msg.message}\n"
        else:
            prompt += f"Assistant: {msg.message}\n"
        
    prompt += "Assistant:"

    response = model.generate_content(prompt)

    return response.text
