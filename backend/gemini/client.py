"""
Shared Gemini AI client — every route imports ask_gemini() from here.
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")


async def ask_gemini(prompt: str) -> str:
    """Send a prompt to Gemini and return the text response."""
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise RuntimeError(f"Gemini API error: {e}")
