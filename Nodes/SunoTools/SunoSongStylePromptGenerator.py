import time
import random
import requests
import urllib.parse

class SunoSongStylePromptGenerator:

    theme_options = [
        "Love",
        "Friendship",
        "Family",
        "Nature",
        "City Life",
        "Ideals and Pursuits",
        "Memories",
        "Hope",
        "Social Issues",
        "Random",
    ]

    melody_options = [
        "Simple and Understandable",
        "Complex and Versatile",
        "Catchy",
        "Beautiful and Melodious",
        "Energetic",
        "Soft and Gentle",
        "High-pitched and Passionate",
        "Random",
    ]

    harmony_options = [
        "Major Chords",
        "Minor Chords",
        "Jazz Harmony",
        "Pop Harmony",
        "Classical Harmony",
        "Modern Harmony",
        "Random",
    ]

    rhythm_options = [
        "Steady Rhythm",
        "Light and Bouncy",
        "Heavy and Powerful",
        "Free Rhythm",
        "Swing Rhythm",
        "Latin Rhythm",
        "Electronic Rhythm",
        "Random",
    ]

    structure_options = [
        "Verse-Chorus-Verse-Chorus-Bridge-Chorus",
        "AABA",
        "ABA",
        "Free Form",
        "Narrative Structure",
        "Random",
    ]

    instrumentation_options = [
        "Electric Guitar",
        "Acoustic Guitar",
        "Piano",
        "Violin",
        "Drums",
        "Bass",
        "Electronic Synthesizer",
        "Orchestra",
        "Folk Instruments",
        "Random",
    ]

    style_options = [
        "Pop",
        "Rock",
        "Jazz",
        "Classical",
        "Hip-Hop/Rap",
        "Folk",
        "Electronic",
        "R&B",
        "Country",
        "Metal",
        "Random",
    ]

    mood_options = [
        "Angry",
        "Happy",
        "Sad",
        "Nostalgic",
        "Excited",
        "Calm",
        "Romantic",
        "Hopeful",
        "Anxious",
        "Random",
    ]

    dynamics_options = [
        "Crescendo",
        "Decrescendo",
        "Strong Contrast",
        "Steady",
        "Sudden Change",
        "Random",
    ]

    production_options = [
        "Low Fidelity",
        "High Fidelity",
        "Retro",
        "Modern",
        "Experimental",
        "Random",
    ]

    originality_options = [
        "Highly Original",
        "Traditional Classic",
        "Fusion Innovation",
        "Experimental",
        "Random",
    ]

    vocal_options = [
        "Clean and Clear",
        "Hoarse and Powerful",
        "Lyrical and Beautiful",
        "Rap",
        "Rich Harmony",
        "Ethnic Characteristics",
        "Random",
    ]

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "preference": ("STRING", {
                    "multiline": True,
                    "default": "",
                    "placeholder": "Tell Something About You Preference:\nDescribe your idea, e.g., a song about a rainy day in Tokyo.",
                    "tooltip": "Tell Something About You Preference"
                }),
                "Theme": (cls.theme_options, {"default": "Random"}),
                "Melody": (cls.melody_options, {"default": "Random"}),
                "Harmony": (cls.harmony_options, {"default": "Random"}),
                "Rhythm": (cls.rhythm_options, {"default": "Random"}),
                "Structure or Form": (cls.structure_options, {"default": "Random"}),
                "Instrumentation": (cls.instrumentation_options, {"default": "Random"}),
                "Style/Genre": (cls.style_options, {"default": "Random"}),
                "Emotion": (cls.mood_options, {"default": "Random"}),
                "Dynamics": (cls.dynamics_options, {"default": "Random"}),
                "Production": (cls.production_options, {"default": "Random"}),
                "Originality and Creativity": (cls.originality_options, {"default": "Random"}),
                "Vocal Style and Performance": (cls.vocal_options, {"default": "Random"}),
                "Output_original_text": ("BOOLEAN", {"default": False}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    FUNCTION = "generate"
    CATEGORY = "Zhi.AI/Generator"
    DESCRIPTION = "Suno AI Song Style Generator: Combines lyrical preferences with musical elements to generate structured Suno prompts for quickly building stylistically consistent songs in Suno."

    def _call_llm_api(self, text):
        system_prompt = """You are a professional music producer and songwriter. Based on the user's preferences and musical elements, generate a structured song concept with the following format:

title: [Creative song title]
song style: [Concise description of the song style, including genre, key instruments, mood, tempo, and production quality]

Examples:
title: Our Little World
song style: A vibrant pop track with an upbeat tempo and simple catchy melody driven by acoustic guitar. Minor chord harmonies add a touch of romantic melancholy to the energetic rhythm and clear hi-fi production, creating a heartwarming atmosphere.

title: Lavender Haze
song style: A dreamy synth-pop track with a pulsing bassline and ethereal vocal harmonies. It features shimmering keyboard melodies and a driving electronic beat, creating a sense of romantic introspection.

title: Fierce & True
song style: An upbeat indie-pop anthem with powerful female vocals and a catchy guitar riff. The song is characterized by its strong drum beat and uplifting synth stabs, perfect for confident dancing.

Please generate ONE concise song concept based on the provided preferences and musical elements. Keep the song style description under 60 words."""
        
        full_prompt = f"{system_prompt}\n\nUser preferences and musical elements:\n{text}"
        encoded_prompt = urllib.parse.quote(full_prompt)
    
        api_url = f"https://text.pollinations.ai/openai-reasoning/{encoded_prompt}"
        
        try:
            response = requests.get(api_url, timeout=30)
            response.raise_for_status()
            result = response.text.strip()

            if not result or len(result) < 5:
                return text
            return result
        except requests.exceptions.Timeout:
            print(f"API request timeout for openai-reasoning model. Using original text.")
            return text
        except requests.exceptions.RequestException as e:
            error_message = f"API request failed for openai-reasoning model: {e}"
            if 'response' in locals() and response is not None:
                error_message += f" | Status code: {response.status_code} | Server response: {response.text[:200]}..."
            print(error_message)
            return text

    def _random_choice(self, value, options):
        if value == "Random":
            filtered_options = [opt for opt in options if opt != "Random"]
            return random.choice(filtered_options) if filtered_options else value
        return value

    def generate(
        self,
        preference,
        Theme,
        Melody,
        Harmony,
        Rhythm,
        **kwargs
    ):
        output_original = kwargs.get("Output_original_text", False)

        theme = self._random_choice(Theme, self.theme_options)
        melody = self._random_choice(Melody, self.melody_options)
        harmony = self._random_choice(Harmony, self.harmony_options)
        rhythm = self._random_choice(Rhythm, self.rhythm_options)
        structure = self._random_choice(kwargs.get("Structure or Form"), self.structure_options)
        instrumentation = self._random_choice(kwargs.get("Instrumentation"), self.instrumentation_options)
        style = self._random_choice(kwargs.get("Style/Genre"), self.style_options)
        mood = self._random_choice(kwargs.get("Emotion"), self.mood_options)
        dynamics = self._random_choice(kwargs.get("Dynamics"), self.dynamics_options)
        production = self._random_choice(kwargs.get("Production"), self.production_options)
        originality = self._random_choice(kwargs.get("Originality and Creativity"), self.originality_options)
        vocal = self._random_choice(kwargs.get("Vocal Style and Performance"), self.vocal_options)

        if output_original:
            parts = []
            
            preference = (preference or "").strip()
            if preference:
                parts.append(f"Lyrics/Story: {preference}")
            
            if theme:
                parts.append(f"Theme: {theme}")
            if melody:
                parts.append(f"Melody: {melody}")
            if harmony:
                parts.append(f"Harmony: {harmony}")
            if rhythm:
                parts.append(f"Rhythm: {rhythm}")
            if structure:
                parts.append(f"Structure or Form: {structure}")
            if instrumentation:
                parts.append(f"Instrumentation: {instrumentation}")
            if style:
                parts.append(f"Style/Genre: {style}")
            if mood:
                parts.append(f"Emotion: {mood}")
            if dynamics:
                parts.append(f"Dynamics: {dynamics}")
            if production:
                parts.append(f"Production: {production}")
            if originality:
                parts.append(f"Originality and Creativity: {originality}")
            if vocal:
                parts.append(f"Vocal Style and Performance: {vocal}")

            prompt = "\n".join(parts)
            return (prompt,)
        
        input_parts = []
        if preference.strip():
            input_parts.append(f"User Preference: {preference}")
        
        musical_elements = []
        if theme:
            musical_elements.append(f"Theme: {theme}")
        if melody:
            musical_elements.append(f"Melody: {melody}")
        if harmony:
            musical_elements.append(f"Harmony: {harmony}")
        if rhythm:
            musical_elements.append(f"Rhythm: {rhythm}")
        if structure:
            musical_elements.append(f"Structure: {structure}")
        if instrumentation:
            musical_elements.append(f"Instrumentation: {instrumentation}")
        if style:
            musical_elements.append(f"Style: {style}")
        if mood:
            musical_elements.append(f"Emotion: {mood}")
        if dynamics:
            musical_elements.append(f"Dynamics: {dynamics}")
        if production:
            musical_elements.append(f"Production: {production}")
        if originality:
            musical_elements.append(f"Originality: {originality}")
        if vocal:
            musical_elements.append(f"Vocal: {vocal}")
        
        if musical_elements:
            input_parts.append("Musical Elements: " + ", ".join(musical_elements))
        
        input_text = "\n".join(input_parts)
        
        optimized_result = self._call_llm_api(input_text)
        return (optimized_result,)

    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return str(time.time())