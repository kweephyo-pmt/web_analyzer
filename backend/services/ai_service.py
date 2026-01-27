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
    
    async def analyze_with_deepseek(self, prompt: str, system_prompt: str = None, max_tokens: int = 16000) -> str:
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
                max_tokens=max_tokens  # Increased to 16000 for longer responses
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"DeepSeek API error: {str(e)}")
            raise
    
    async def analyze_with_ai(self, prompt: str, system_prompt: str = None, prefer_anthropic: bool = True, use_deepseek: bool = False) -> str:
        """
        Analyze content using either Groq or DeepSeek based on use_deepseek parameter
        """
        if use_deepseek:
            if not self.deepseek_client:
                raise ValueError("DeepSeek API key not configured")
            return await self.analyze_with_deepseek(prompt, system_prompt)
        else:
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
            else:
                # No closing ```, might be truncated
                json_str = response[json_start:].strip()
            
            try:
                return self._parse_json_with_repair(json_str)
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
            else:
                json_str = response[json_start:].strip()
            
            try:
                return self._parse_json_with_repair(json_str)
            except json.JSONDecodeError as e:
                print(f"JSON parse error in generic block: {str(e)}, trying cleanup...")
        
        # Strategy 3: Find JSON array with regex (for article lists)
        array_match = re.search(r'\[\s*\{[\s\S]*\}\s*\]', response, re.DOTALL)
        if array_match:
            json_str = array_match.group()
            try:
                return self._parse_json_with_repair(json_str)
            except json.JSONDecodeError as e:
                print(f"JSON parse error in array match: {str(e)}, trying repair...")
        
        # Strategy 4: Find JSON object with regex
        json_match = re.search(r'\{[\s\S]*\}', response, re.DOTALL)
        if json_match:
            json_str = json_match.group()
            try:
                return self._parse_json_with_repair(json_str)
            except json.JSONDecodeError as e:
                print(f"JSON parse error in regex match: {str(e)}, trying cleanup...")
        
        # Strategy 5: Try parsing the entire response
        try:
            return self._parse_json_with_repair(response)
        except json.JSONDecodeError as e:
            print(f"JSON parse error on full response: {str(e)}")
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
    
    def _parse_json_with_repair(self, json_str: str) -> dict:
        """Parse JSON with automatic repair for common issues"""
        import re
        
        # First try direct parsing
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass
        
        # Clean and try again
        cleaned = self._clean_json_string(json_str)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            # Try to repair truncated JSON
            repaired = self._repair_truncated_json(cleaned)
            try:
                return json.loads(repaired)
            except json.JSONDecodeError:
                # Last resort: try to extract partial valid JSON
                print(f"Attempting to extract partial valid JSON...")
                partial = self._extract_partial_json(cleaned)
                return json.loads(partial)
    
    def _repair_truncated_json(self, json_str: str) -> str:
        """Repair truncated JSON by closing unclosed structures"""
        import re
        
        # First, try to find and remove incomplete trailing content
        # Look for the last complete key-value pair
        
        # Pattern 1: Truncated in the middle of a string value (most common)
        # Find the last properly closed string value or structure
        last_valid_positions = [
            json_str.rfind('",'),      # Last complete string value in object
            json_str.rfind('",\n'),    # Last complete string value with newline
            json_str.rfind('},'),      # Last complete nested object
            json_str.rfind('],'),      # Last complete nested array
            json_str.rfind(': "'),     # Last key with string value start
        ]
        
        # Find the last occurrence of a complete item
        last_complete = max([pos for pos in last_valid_positions if pos > 0], default=-1)
        
        # If we found a complete item and there's content after it that looks incomplete
        if last_complete > 0:
            remaining = json_str[last_complete + 2:].strip()
            # Check if remaining content looks incomplete (unclosed quotes, etc.)
            if remaining and (remaining.count('"') % 2 != 0 or 
                            remaining.count('{') != remaining.count('}') or
                            remaining.count('[') != remaining.count(']')):
                # Truncate to last complete item
                json_str = json_str[:last_complete + 1]
        
        # Count opening and closing braces/brackets after cleanup
        open_braces = json_str.count('{')
        close_braces = json_str.count('}')
        open_brackets = json_str.count('[')
        close_brackets = json_str.count(']')
        
        # Remove trailing comma if present
        json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
        
        # Close unclosed structures
        if open_brackets > close_brackets:
            json_str += ']' * (open_brackets - close_brackets)
        if open_braces > close_braces:
            json_str += '}' * (open_braces - close_braces)
        
        return json_str
    
    def _extract_partial_json(self, json_str: str) -> str:
        """Extract the largest valid JSON structure from partial data"""
        import re
        
        # Try to find complete objects/arrays
        # Look for the last complete item in an array
        if json_str.strip().startswith('['):
            # Find all complete objects in the array
            complete_items = []
            depth = 0
            current_item = ""
            in_string = False
            escape_next = False
            
            for i, char in enumerate(json_str):
                if escape_next:
                    current_item += char
                    escape_next = False
                    continue
                
                if char == '\\':
                    escape_next = True
                    current_item += char
                    continue
                
                if char == '"' and not escape_next:
                    in_string = not in_string
                
                if not in_string:
                    if char == '{':
                        if depth == 0:
                            current_item = ""
                        depth += 1
                    elif char == '}':
                        depth -= 1
                        if depth == 0 and current_item:
                            complete_items.append(current_item + '}')
                            current_item = ""
                            continue
                
                if depth > 0:
                    current_item += char
            
            if complete_items:
                return '[' + ','.join(complete_items) + ']'
        
        # If it's an object, try to close it properly
        return self._repair_truncated_json(json_str)
    
    async def extract_json_with_thinking(self, prompt: str, system_prompt: str = None) -> dict:
        """
        Extract structured JSON using DeepSeek (legacy method for compatibility)
        """
        return await self.extract_json(prompt, system_prompt, use_deepseek=True)



# Singleton instance
ai_service = AIService()
