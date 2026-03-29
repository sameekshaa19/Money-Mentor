"""
Shared Gemini AI client
"""
import os
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# Initialize client only if API key is available
api_key = os.getenv("GEMINI_API_KEY")
client = None
if api_key and api_key != "your_gemini_api_key_here":
    try:
        genai.configure(api_key=api_key)
        client = genai.GenerativeModel('gemini-1.5-flash')
    except Exception as e:
        print(f"Warning: Failed to initialize Gemini client: {e}")
        client = None

async def ask_gemini(prompt: str) -> str:
    if not client:
        return "AI analysis unavailable - Gemini API key not configured. Please set GEMINI_API_KEY in .env file."
    
    try:
        # Add timeout to prevent infinite loading
        response = await asyncio.wait_for(
            asyncio.to_thread(
                lambda: client.generate_content(prompt)
            ),
            timeout=30.0  # 30 second timeout
        )
        return response.text
    except asyncio.TimeoutError:
        return "AI analysis unavailable - Request timed out after 30 seconds"
    except Exception as e:
        return f"AI analysis unavailable - Gemini API error: {str(e)}"

def generate_text(prompt: str, model: str = "gemini-1.5-flash") -> str:
    """Synchronous version for compatibility"""
    if not client:
        return "AI analysis unavailable - Gemini API key not configured."
    
    try:
        response = client.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"AI analysis unavailable - Gemini API error: {str(e)}"