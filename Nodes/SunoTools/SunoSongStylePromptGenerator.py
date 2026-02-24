import time
import random


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
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    FUNCTION = "generate"
    CATEGORY = "Zhi.AI/Generator"
    DESCRIPTION = "Suno Song Style Prompt Generator: Combines lyrical preferences with musical elements to generate structured Suno prompts. (AI generation functionality removed as platform is defunct). Outputs the constructed prompt for use with other LLMs."

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
