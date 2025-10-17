import time
import random
import requests
import urllib.parse


class SunoLyricsGenerator:

    theme_options = [
        "Random",
        "Love",
        "Heartbreak",
        "Friendship",
        "Social issues",
        "Nature",
        "Adventure",
        "Personal growth",
        "Loss",
        "Celebration",
        "Fantasy",
        "Historical events",
    ]

    language_options = [
        "English",
        "简体中文 (Simplified Chinese)",
        "繁體中文 (Traditional Chinese)",
        "日本語 (Japanese)",
        "한국어 (Korean)",
        "Español (Spanish)",
        "Français (French)",
        "Deutsch (German)",
        "Random",
    ]

    vocal_arrangement_options = [
        "Random",
        "Solo (Single vocalist)",
        "Duet (Two vocalists)",
        "Choir/Chorus (Large group)",
        "A Cappella (Voices only)",
        "Call and Response",
        "Harmony Singing",
        "Unison (Multiple voices same melody)",
        "Lead and Backing Vocals",
        "Group Singing (Small ensemble)",
        "Verse Trading (Alternating vocalists)",
        "Round/Canon Style",
    ]

    lyrics_style_options = [
        "Random",
        "Narrative",
        "Abstract",
        "Direct and personal",
        "Philosophical",
        "Humorous",
        "Political",
        "Poetic imagery",
    ]

    mood_options = [
        "Random",
        "Joyful",
        "Melancholic",
        "Reflective",
        "Angry",
        "Serene",
        "Mysterious",
        "Romantic",
        "Energetic",
        "Whimsical",
        "Suspenseful",
        "Inspirational",
    ]

    genre_options = [
        "Random",
        "Rock",
        "Pop",
        "Hip-hop",
        "Electronic (EDM, house, techno)",
        "Jazz",
        "Blues",
        "Classical",
        "Folk",
        "Country",
        "Reggae",
        "World music",
        "Experimental",
    ]

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "preference": ("STRING", {
                    "multiline": True,
                    "default": "",
                    "placeholder": "Tell Something About Your Lyrics Idea:\nFor example: a song about the Pure Love Goddess.",
                    "tooltip": "Basic content or concept for the lyrics"
                }),
                "Theme": (cls.theme_options, {"default": "Random"}),
                "Lyrics Language": (cls.language_options, {"default": "简体中文 (Simplified Chinese)"}),
                "Vocal Arrangement": (cls.vocal_arrangement_options, {"default": "Random"}),
                "Lyrics Style": (cls.lyrics_style_options, {"default": "Random"}),
                "Mood": (cls.mood_options, {"default": "Random"}),
                "Style/Genre": (cls.genre_options, {"default": "Random"}),
                "Output_original_text": ("BOOLEAN", {"default": False}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("lyrics",)
    FUNCTION = "generate"
    CATEGORY = "zhihui/Generator"
    DESCRIPTION = "Suno AI Lyrics Generator: Online LLM-powered generator producing structured, singable lyrics with detailed meta-tags and sections ([Intro][Soft Guitar], [Verse 1][Piano], [Chorus][Soaring Vocals], etc.) guided by theme, language, vocal arrangement, style, mood, and genre."

    def _random_choice(self, value, options):
        if value == "Random":
            filtered_options = [opt for opt in options if opt != "Random"]
            return random.choice(filtered_options) if filtered_options else value
        return value

    def _language_instruction(self, lang):
        mapping = {
            "English": "Write the lyrics in English.",
            "简体中文 (Simplified Chinese)": "请使用简体中文创作歌词。",
            "繁體中文 (Traditional Chinese)": "請使用繁體中文創作歌詞。",
            "日本語 (Japanese)": "日本語で歌詞を書いてください。",
            "한국어 (Korean)": "한국어로 가사를 작성하세요.",
            "Español (Spanish)": "Escribe la letra en español.",
            "Français (French)": "Écris les paroles en français.",
            "Deutsch (German)": "Schreibe die Liedtexte auf Deutsch.",
        }
        return mapping.get(lang, "Write the lyrics in English.")

    def _build_instruction(self, base, theme, language, vocal, lstyle, mood, genre):
        lang_tip = self._language_instruction(language)
        system_prompt = f"""你是一位专业词作人。请基于"用户对歌曲的描述"与"音乐特性选项"的组合，创作符合用户描述、富有创造力且可演唱的专业歌词。

写作目标：
- 用现代歌曲的表达写出自然、可演唱的句子，节奏清晰、韵脚自然。
- 场景具体、意象鲜明，叙事推进与情绪层次分明。
- 副歌具备强记忆点与可重复的钩子（hook），可在后文重复或变奏。

必须遵循：
- {lang_tip}
- 主题：{theme}
- 风格/流派：{genre}
- 情绪：{mood}
- 歌词风格：{lstyle}
- 演唱编制：{vocal}
- 核心创作依据（用户描述）：{base}

**重要格式要求：必须使用结构化元标签格式输出歌词**

格式规范：
1. 每个段落必须以结构标签开头，格式为：[段落类型][音乐描述]
2. 可选的演唱指导注释用圆括号包围，如：(Humming a gentle melody)
3. 段落类型包括：[Intro]、[Verse 1]、[Verse 2]、[Pre-Chorus]、[Chorus]、[Bridge]、[Outro]等
4. 音乐描述包括：[Soft Acoustic Guitar]、[Melancholy Piano]、[Building Strings]、[Soaring Vocals]、[Heartbreak Anthem]、[Emotional Guitar Solo]、[Fading Acoustic Guitar]等

输出格式示例：
[Intro][Soft Acoustic Guitar]
(Humming a gentle melody)

[Verse 1][Melancholy Piano]
歌词内容...

[Pre-Chorus][Building Strings]
歌词内容...

[Chorus][Soaring Vocals][Heartbreak Anthem]
歌词内容...

[Bridge][Emotional Guitar Solo]
歌词内容...

[Outro][Fading Acoustic Guitar]
歌词内容...
(Humming fades away)

写作建议：
- 采用完整的歌曲结构：Intro -> Verse 1 -> Pre-Chorus -> Chorus -> Verse 2 -> Pre-Chorus -> Chorus -> Bridge -> Chorus -> Outro
- 总行数建议 20–35 行（不包括标签行）
- 音乐描述标签要与歌曲的情绪和风格相匹配

限制：
- 必须严格按照上述格式输出，包含所有结构化标签
- 不要在歌词之外输出额外的解释内容
- 允许适度重复以加强记忆点，但避免机械重复

现在直接输出完整的结构化歌词。
"""
        return system_prompt

    def _call_llm_api(self, prompt_text):
        encoded_prompt = urllib.parse.quote(prompt_text)
        api_url = f"https://text.pollinations.ai/openai-reasoning/{encoded_prompt}"
        try:
            response = requests.get(api_url, timeout=30)
            response.raise_for_status()
            result = response.text.strip()
            if not result or len(result) < 5:
                return prompt_text
            return result
        except requests.exceptions.Timeout:
            print("API request timeout for openai-reasoning model. Using original text.")
            return prompt_text
        except requests.exceptions.RequestException as e:
            error_message = f"API request failed for openai-reasoning model: {e}"
            if 'response' in locals() and response is not None:
                error_message += f" | Status code: {response.status_code} | Server response: {response.text[:200]}..."
            print(error_message)
            return prompt_text

    def generate(self, preference, Theme, **kwargs):
        output_original = kwargs.get("Output_original_text", False)

        theme = self._random_choice(Theme, self.theme_options)
        language = self._random_choice(kwargs.get("Lyrics Language"), self.language_options)
        vocal = self._random_choice(kwargs.get("Vocal Arrangement"), self.vocal_arrangement_options)
        lstyle = self._random_choice(kwargs.get("Lyrics Style"), self.lyrics_style_options)
        mood = self._random_choice(kwargs.get("Mood"), self.mood_options)
        genre = self._random_choice(kwargs.get("Style/Genre"), self.genre_options)

        preference = (preference or "").strip()
        base_text = preference if preference else ""

        instruction = self._build_instruction(
            base_text, theme, language, vocal, lstyle, mood, genre
        )

        if output_original:
            return (instruction,)

        lyrics = self._call_llm_api(instruction)
        return (lyrics,)

    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return str(time.time())