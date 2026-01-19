from typing import Dict, List, Optional
from openai import AsyncOpenAI
from config import settings
import json
import asyncio


class AIService:
    """AI service for intelligent content analysis"""
    
    def __init__(self):
        self.groq_client = None
        self.deepseek_client = None
        
        # Initialize Groq (uses OpenAI-compatible API)
        if hasattr(settings, 'GROQ_API_KEY') and settings.GROQ_API_KEY:
            self.groq_client = AsyncOpenAI(
                api_key=settings.GROQ_API_KEY,
                base_url="https://api.groq.com/openai/v1"
            )
        
        # Initialize DeepSeek (uses OpenAI-compatible API)
        if hasattr(settings, 'DEEPSEEK_API_KEY') and settings.DEEPSEEK_API_KEY:
            self.deepseek_client = AsyncOpenAI(
                api_key=settings.DEEPSEEK_API_KEY,
                base_url="https://api.deepseek.com"
            )
    
    async def analyze_with_groq(self, prompt: str, system_prompt: str = None) -> str:
        """Analyze content using Groq (fast, free tier available)"""
        if not self.groq_client:
            raise ValueError("Groq API key not configured")
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = await self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Fast and capable model
                messages=messages,
                temperature=0.7,
                max_tokens=6000  # Groq's safe limit (max ~8000)
            )
            return response.choices[0].message.content
        except Exception as e:
            error_msg = str(e)
            print(f"Groq API error: {error_msg}")
            raise
    
    async def analyze_with_deepseek(self, prompt: str, system_prompt: str = None) -> str:
        """Analyze content using DeepSeek (good for complex analysis)"""
        if not self.deepseek_client:
            raise ValueError("DeepSeek API key not configured")
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = await self.deepseek_client.chat.completions.create(
                model="deepseek-chat",  # Main model
                messages=messages,
                temperature=0.7,
                max_tokens=8000  # DeepSeek's max is 8192
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"DeepSeek API error: {str(e)}")
            raise
    
    async def analyze_with_ai(self, prompt: str, system_prompt: str = None, prefer_anthropic: bool = True, use_deepseek: bool = False) -> str:
        """
        Analyze content using Groq only
        """
        if not self.groq_client:
            raise ValueError("Groq API key not configured")
        
        return await self.analyze_with_groq(prompt, system_prompt)
    
    async def extract_json(self, prompt: str, system_prompt: str = None, use_deepseek: bool = False) -> dict:
        """Extract structured JSON data using AI with robust parsing"""
        response = await self.analyze_with_ai(prompt, system_prompt, use_deepseek=use_deepseek)
        
        # Clean the response
        response = response.strip()
        
        # Try multiple parsing strategies
        import re
        
        # Strategy 1: Look for JSON in markdown code blocks
        if "```json" in response:
            json_start = response.find("```json") + 7
            json_end = response.find("```", json_start)
            if json_end > json_start:
                json_str = response[json_start:json_end].strip()
                try:
                    return json.loads(json_str)
                except json.JSONDecodeError as e:
                    print(f"JSON parse error in code block: {str(e)}, trying cleanup...")
        
        # Strategy 2: Look for any code block
        if "```" in response:
            json_start = response.find("```") + 3
            # Skip language identifier if present
            if response[json_start:json_start+10].strip().split('\n')[0].isalpha():
                json_start = response.find("\n", json_start) + 1
            json_end = response.find("```", json_start)
            if json_end > json_start:
                json_str = response[json_start:json_end].strip()
                try:
                    return json.loads(json_str)
                except json.JSONDecodeError as e:
                    print(f"JSON parse error in generic block: {str(e)}, trying cleanup...")
        
        # Strategy 3: Find JSON object with regex
        json_match = re.search(r'\{[\s\S]*\}', response, re.DOTALL)
        if json_match:
            json_str = json_match.group()
            try:
                return json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"JSON parse error in regex match: {str(e)}, trying cleanup...")
                # Try to clean common issues
                json_str = self._clean_json_string(json_str)
                try:
                    return json.loads(json_str)
                except json.JSONDecodeError:
                    pass
        
        # Strategy 4: Try parsing the entire response
        try:
            return json.loads(response)
        except json.JSONDecodeError as e:
            print(f"JSON parse error on full response: {str(e)}, trying cleanup...")
            cleaned = self._clean_json_string(response)
            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                pass
        
        raise ValueError(f"Could not extract valid JSON from AI response. First 500 chars: {response[:500]}")
    
    def _clean_json_string(self, json_str: str) -> str:
        """Clean common JSON formatting issues"""
        import re
        
        # Remove trailing commas before closing braces/brackets
        json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
        
        # Fix unescaped quotes in strings (basic attempt)
        # This is tricky and might not catch all cases
        
        # Remove comments (// and /* */)
        json_str = re.sub(r'//.*?\n', '\n', json_str)
        json_str = re.sub(r'/\*.*?\*/', '', json_str, flags=re.DOTALL)
        
        # Remove any text before first { or [
        first_brace = json_str.find('{')
        first_bracket = json_str.find('[')
        if first_brace >= 0 and (first_bracket < 0 or first_brace < first_bracket):
            json_str = json_str[first_brace:]
        elif first_bracket >= 0:
            json_str = json_str[first_bracket:]
        
        # Remove any text after last } or ]
        last_brace = json_str.rfind('}')
        last_bracket = json_str.rfind(']')
        if last_brace >= 0 and last_brace > last_bracket:
            json_str = json_str[:last_brace + 1]
        elif last_bracket >= 0:
            json_str = json_str[:last_bracket + 1]
        
        return json_str.strip()
    
    async def extract_json_with_thinking(self, prompt: str, system_prompt: str = None) -> dict:
        """
        Extract structured JSON using Groq only
        """
        return await self.extract_json(prompt, system_prompt, use_deepseek=False)



# Singleton instance
ai_service = AIService()
