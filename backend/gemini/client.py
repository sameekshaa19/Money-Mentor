"""
Shared Gemini AI client (replaced with Groq/LLaMA 3) — every route imports ask_gemini() from here.
"""

import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

async def ask_gemini(prompt: str) -> str:
    """Drop-in replacement — same name, no other files need changing."""
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
        )
        return response.choices[0].message.content
    except Exception as e:
        raise RuntimeError(f"Groq API error: {e}")
