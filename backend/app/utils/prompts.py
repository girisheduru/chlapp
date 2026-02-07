"""
Prompt templates for LLM interactions.
"""


def get_identity_generation_prompt(habit_context: dict) -> str:
    """
    Generate prompt for identity generation based on habit context.
    
    Args:
        habit_context: Dictionary containing habit preferences and context
        
    Returns:
        Formatted prompt string
    """
    starting_idea = habit_context.get("starting_idea", "")
    
    prompt = f"""Based on the following habit context, generate 3-5 identity statements that would help someone adopt this habit.

Starting Idea: {starting_idea}

Generate identity statements that:
1. Are specific and actionable
2. Align with the habit goal
3. Use first-person language (e.g., "I am a person who...")
4. Are empowering and positive

Return only the identity statements, one per line, without numbering or bullets."""

    return prompt


def get_short_habit_options_prompt(habit_context: dict) -> str:
    """
    Generate prompt for short habit options (starter habits).
    
    Args:
        habit_context: Dictionary containing habit preferences and context
        
    Returns:
        Formatted prompt string
    """
    starting_idea = habit_context.get("starting_idea", "")
    identity = habit_context.get("identity", "")
    
    prompt = f"""Based on the following habit context, generate 3-5 simple "showing up" habit options that are easy to start.

Starting Idea: {starting_idea}
Identity: {identity}

Generate starter habit options that:
1. Are extremely simple (2 minutes or less)
2. Focus on "showing up" rather than completing the full habit
3. Are specific and actionable
4. Build momentum toward the larger goal

Return only the habit options, one per line, without numbering or bullets."""

    return prompt


def get_full_habit_options_prompt(habit_context: dict) -> str:
    """
    Generate prompt for full habit options.
    
    Args:
        habit_context: Dictionary containing habit preferences and context
        
    Returns:
        Formatted prompt string
    """
    starting_idea = habit_context.get("starting_idea", "")
    identity = habit_context.get("identity", "")
    starter_habit = habit_context.get("starter_habit", "")
    
    prompt = f"""Based on the following habit context, generate 3-5 Supernova habit options (how the habit shows up when the user has more energy).

Starting Idea: {starting_idea}
Identity: {identity}
Nucleus Habit: {starter_habit}

Generate Supernova habit options that:
1. Represent the complete habit expression
2. Are specific and measurable
3. Build upon the starter habit
4. Align with the user's identity and goals

Return only the habit options, one per line, without numbering or bullets."""

    return prompt


def get_obvious_cues_prompt(habit_context: dict) -> str:
    """
    Generate prompt for obvious cues (environmental triggers).
    
    Args:
        habit_context: Dictionary containing habit preferences and context
        
    Returns:
        Formatted prompt string
    """
    starting_idea = habit_context.get("starting_idea", "")
    full_habit = habit_context.get("full_habit", "")
    habit_stack = habit_context.get("habit_stack", "")
    
    prompt = f"""Based on the following habit context, generate 3-5 obvious cues or environmental triggers that would make this habit more obvious and easier to start.

Starting Idea: {starting_idea}
Full Habit: {full_habit}
Habit Stack: {habit_stack}

Generate obvious cues that:
1. Are environmental or contextual triggers
2. Make the habit more visible and obvious
3. Can be easily implemented
4. Align with the habit stack if provided

Return only the cues, one per line, without numbering or bullets."""

    return prompt


# Human-readable labels for preference keys (for LLM prompt)
PREFERENCE_KEY_LABELS = {
    "identity": "Identity statement (who you're becoming)",
    "starter_habit": "Nucleus habit (minimal showing-up action)",
    "full_habit": "Supernova habit",
    "habit_stack": "Cue or anchor (when/after what)",
    "enjoyment": "Enjoyment or fun elements",
    "habit_environment": "Environment support / setup",
}


def get_preference_edit_options_prompt(
    habit_context: dict,
    preference_key: str,
    current_value: str,
    reflection_context: dict | None = None,
) -> str:
    """
    Generate prompt for 3 alternative phrasings of a single habit preference.
    Used in Reflection flow when user taps pencil to edit a preference.
    If reflection_context is provided (Screen 1 answers), options take those into account.
    """
    label = PREFERENCE_KEY_LABELS.get(
        preference_key,
        preference_key.replace("_", " ").title(),
    )
    context_lines = []
    for k, v in habit_context.items():
        if v:
            context_lines.append(f"- {k}: {v}")
    context_block = "\n".join(context_lines) if context_lines else "(No context yet)"

    reflection_block = ""
    if reflection_context:
        parts = []
        if reflection_context.get("reflectionQ1"):
            parts.append(f"What helped them show up: \"{reflection_context['reflectionQ1']}\"")
        if reflection_context.get("reflectionQ2"):
            parts.append(f"What made starting harder on skip days: \"{reflection_context['reflectionQ2']}\"")
        if reflection_context.get("identityReflection"):
            parts.append(f"Other reflection (I'm noticing that...): \"{reflection_context['identityReflection']}\"")
        if reflection_context.get("identityAlignmentValue") is not None:
            val = reflection_context["identityAlignmentValue"]
            if val <= 33:
                alignment_note = "they didn't feel very aligned with their identity this week"
            elif val <= 66:
                alignment_note = "they felt somewhat aligned with their identity this week"
            else:
                alignment_note = "they felt well aligned with their identity this week"
            parts.append(f"Identity alignment: {alignment_note} (slider {val}/100)")
        if parts:
            reflection_block = "\n\nREFLECTION FROM THIS WEEK (use this to tailor suggestions):\n" + "\n".join(f"- {p}" for p in parts)

    prompt = f"""You are a supportive habit coach. The user is editing one part of their habit plan.
{reflection_block}

HABIT CONTEXT:
{context_block}

They are editing: {label}
Current value: "{current_value or '(empty)'}"

Generate exactly 3 alternative phrasings for this preference. Each alternative should:
1. Stay true to their overall habit goal and identity
2. Be specific and actionable
3. Be a reasonable variation (different wording, slightly different angle, or a small improvement)"""

    if reflection_block:
        prompt += """
4. When reflection from this week is provided above, let it inform your suggestions (e.g. address obstacles, build on what helped, or reflect what they noticed)."""

    prompt += """

Return only the 3 alternatives, one per line, without numbering or bullets. No other text."""

    return prompt


def get_reflection_items_prompt(habit_context: dict, streak_data: dict) -> str:
    """
    Generate prompt for reflection flow items (Screen 1 & 2) from habit plan + streak.
    LLM should return valid JSON matching ReflectionItemsResponse shape.
    """
    identity = habit_context.get("identity", "")
    starting_idea = habit_context.get("starting_idea", "")
    starter_habit = habit_context.get("starter_habit", "")
    full_habit = habit_context.get("full_habit", "")
    habit_stack = habit_context.get("habit_stack", "")
    habit_environment = habit_context.get("habit_environment", "")
    enjoyment = habit_context.get("enjoyment", "")

    current_streak = streak_data.get("currentStreak", 0)
    longest_streak = streak_data.get("longestStreak", 0)
    total_stones = streak_data.get("totalStones", 0)
    last_check_in = streak_data.get("lastCheckInDate")

    prompt = f"""You are a supportive habit coach. Based on this user's habit plan and streak data, generate reflection items for a weekly reflection flow.

HABIT PLAN:
- Identity: "{identity}"
- Starting idea: {starting_idea}
- Nucleus habit: {starter_habit}
- Supernova habit: {full_habit}
- Anchor/cue: {habit_stack or "Not set"}
- Environment setup: {habit_environment or "Not set"}
- Enjoyment/fun elements: {enjoyment or "Not set"}

STREAK DATA:
- Current streak: {current_streak} days
- Longest streak: {longest_streak} days
- Total stones (check-ins): {total_stones}
- Last check-in: {last_check_in or "None yet"}

Generate a JSON object with exactly this structure (no markdown, no code block wrapper):

{{
  "insights": [
    {{ "emoji": "💪", "text": "One short observation about their week or resilience.", "highlight": "Optional one-sentence takeaway." }}
  ],
  "reflectionQuestions": {{
    "question1": "What helped you show up — even a little? (optional)",
    "question2": "On days it didn't happen, what made starting feel harder? (optional)"
  }},
  "experimentSuggestions": [
    {{
      "type": "anchor",
      "title": "Strengthen your anchor",
      "currentValue": "Brief summary of their current anchor/cue.",
      "suggestedText": "One specific, actionable experiment (e.g. a time or trigger they could try).",
      "why": "One sentence on why this might help."
    }},
    {{
      "type": "environment",
      "title": "Prep your environment",
      "currentValue": "Brief summary of their current environment setup.",
      "suggestedText": "One specific experiment (e.g. what to prep and where).",
      "why": "One sentence on why this might help."
    }},
    {{
      "type": "enjoyment",
      "title": "Make it more enjoyable",
      "currentValue": "Brief summary of what they enjoy.",
      "suggestedText": "One specific experiment (e.g. pair habit with something they love).",
      "why": "One sentence on why this might help."
    }}
  ]
}}

RULES:
- insights: 0 to 2 items. Only add insights that are relevant (e.g. if they have a streak, mention showing up; if totalStones is low, encourage without being preachy). Use short, warm, second-person text.
- reflectionQuestions: Keep question1 and question2 as prompts that invite short optional answers. You may rephrase slightly for this habit.
- experimentSuggestions: Exactly 3 items, one for type "anchor", one "environment", one "enjoyment". Use their actual current values for currentValue. suggestedText must be one concrete, small experiment (1–2 sentences). why is one short sentence.
- Return only the JSON object, no other text."""

    return prompt


def get_reflection_agent_system_prompt() -> str:
    """System prompt for the reflection ReAct agent (with Tavily search)."""
    return """You are a supportive habit coach who helps users reflect on their habits using evidence-based ideas from James Clear (Atomic Habits) and similar sources.

You have access to a web search tool. Use it to:
1. Find relevant James Clear quotes, Atomic Habits principles, or habit-building advice when it would improve the user's reflection.
2. Look for short, inspiring quotes or tips about identity-based habits, cues, environment design, or small habits.

When generating reflection items, you may weave in a brief quote or insight from your search (e.g. in an insight's highlight, or in an experiment's why) when it fits. Do not overuse search; one or two targeted searches are enough.

Your final answer must be a single valid JSON object (no markdown, no code fence) with exactly this structure:
{
  "insights": [ { "emoji": "...", "text": "...", "highlight": "..." } ],
  "reflectionQuestions": { "question1": "...", "question2": "..." },
  "experimentSuggestions": [
    { "type": "anchor", "title": "...", "currentValue": "...", "suggestedText": "...", "why": "..." },
    { "type": "environment", "title": "...", "currentValue": "...", "suggestedText": "...", "why": "..." },
    { "type": "enjoyment", "title": "...", "currentValue": "...", "suggestedText": "...", "why": "..." }
  ]
}
- insights: 0–2 items. Short, warm, second-person. highlight can include a James Clear–style takeaway if you found one.
- reflectionQuestions: question1 and question2 as prompts for optional user reflection.
- experimentSuggestions: exactly 3 items (anchor, environment, enjoyment). Use the user's actual current values; suggestedText is one small experiment; why is one sentence (optionally citing an idea from your search).
After any tool use, end by outputting only this JSON as your final response."""


def get_reflection_agent_user_prompt(habit_context: dict, streak_data: dict) -> str:
    """User prompt for the reflection ReAct agent (habit + streak context)."""
    identity = habit_context.get("identity", "")
    starting_idea = habit_context.get("starting_idea", "")
    starter_habit = habit_context.get("starter_habit", "")
    full_habit = habit_context.get("full_habit", "")
    habit_stack = habit_context.get("habit_stack", "")
    habit_environment = habit_context.get("habit_environment", "")
    enjoyment = habit_context.get("enjoyment", "")

    current_streak = streak_data.get("currentStreak", 0)
    longest_streak = streak_data.get("longestStreak", 0)
    total_stones = streak_data.get("totalStones", 0)
    last_check_in = streak_data.get("lastCheckInDate")

    return f"""Generate reflection items for this user's weekly reflection.

HABIT PLAN:
- Identity: "{identity}"
- Starting idea: {starting_idea}
- Nucleus habit: {starter_habit}
- Supernova habit: {full_habit}
- Anchor/cue: {habit_stack or "Not set"}
- Environment setup: {habit_environment or "Not set"}
- Enjoyment/fun elements: {enjoyment or "Not set"}

STREAK DATA:
- Current streak: {current_streak} days
- Longest streak: {longest_streak} days
- Total stones (check-ins): {total_stones}
- Last check-in: {last_check_in or "None yet"}

Optional: use the search tool to find James Clear or Atomic Habits quotes/tips that could enrich the insights or experiment suggestions. Then output the required JSON object as your final answer."""


def get_reflection_suggestion_prompt(
    habit_context: dict,
    reflection_q1: str,
    reflection_q2: str,
    identity_reflection: str,
    identity_alignment_value: int | None,
) -> str:
    """
    Generate prompt for one LLM suggestion based on user's Screen 1 reflection.
    Kept short to minimize tokens and speed up the API response.
    """
    context_lines = [f"{k}: {str(v)[:100]}" for k, v in (habit_context or {}).items() if v]
    context_block = "\n".join(context_lines) if context_lines else "No habit context"

    reflection_parts = []
    if (reflection_q1 or "").strip():
        reflection_parts.append("What helped: " + (reflection_q1.strip()[:150]))
    if (reflection_q2 or "").strip():
        reflection_parts.append("What made it harder: " + (reflection_q2.strip()[:150]))
    if (identity_reflection or "").strip():
        reflection_parts.append("Noting: " + (identity_reflection.strip()[:100]))
    if identity_alignment_value is not None:
        reflection_parts.append("Alignment: " + ("low" if identity_alignment_value <= 33 else "mid" if identity_alignment_value <= 66 else "high"))
    reflection_block = "\n".join(reflection_parts) if reflection_parts else "No reflection"

    return f"""You are a habit coach who only suggests changes grounded in James Clear's Atomic Habits (his book and publicly available content). Do not suggest random or generic advice. Every suggestion must align with his framework.

Atomic Habits concepts to use:
- identity: Identity-based habits ("I am someone who..."). Change must reflect his idea that habits are votes for the type of person you wish to become.
- starter_habit (Nucleus habit): The 2-minute rule or "make it easy" — scale the habit down so it can be started in about 2 minutes. Match his "gateway habit" / "ritual" language where relevant. Use the product term "Nucleus habit" in titles when suggesting this type.
- full_habit (Supernova habit): "When energy allows" expansion — still within his idea of progressive improvement, not a leap. Use the product term "Supernova habit" in titles when suggesting this type.
- habit_stack: Habit stacking or implementation intention — "After [existing habit], I will [new habit]." Or a clear cue (time, place, preceding action) as he recommends.
- enjoyment: "Make it attractive" — temptation bundling, pairing with something you enjoy, or his "ritual + reward" idea. No generic "have fun."
- habit_environment: Environment design — "make it obvious." Change the context (visibility, friction, cues in the space) as he describes in the book.

Habit:
{context_block}

Reflection:
{reflection_block}

Suggest ONE change that (1) fits their reflection and (2) is clearly from Atomic Habits. Reply with only this JSON (no markdown):
{{"type": "identity|starter_habit|full_habit|habit_stack|enjoyment|habit_environment", "title": "Short title", "suggestedText": "Exact new text for that preference", "why": "One sentence why, referencing Atomic Habits (e.g. 2-minute rule, habit stacking, identity, environment design)"}}"""
