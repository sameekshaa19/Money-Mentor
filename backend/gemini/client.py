"""
Shared Gemini AI client
"""
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Initialize client only if API key is available
api_key = os.getenv("GEMINI_API_KEY")
client = None
if api_key and api_key != "your_gemini_api_key_here":
    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Warning: Failed to initialize Gemini client: {e}")
        client = None

async def ask_gemini(prompt: str) -> str:
    if not client:
        return "AI analysis unavailable - Gemini API key not configured. Please set GEMINI_API_KEY in .env file."
    
    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"AI analysis unavailable - Gemini API error: {str(e)}"