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
    
    prompt = f"""Based on the following habit context, generate 3-5 full habit expressions that represent the complete habit.

Starting Idea: {starting_idea}
Identity: {identity}
Starter Habit: {starter_habit}

Generate full habit options that:
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
- Baseline/starter habit: {starter_habit}
- Full habit (when energy allows): {full_habit}
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
- Baseline/starter habit: {starter_habit}
- Full habit (when energy allows): {full_habit}
- Anchor/cue: {habit_stack or "Not set"}
- Environment setup: {habit_environment or "Not set"}
- Enjoyment/fun elements: {enjoyment or "Not set"}

STREAK DATA:
- Current streak: {current_streak} days
- Longest streak: {longest_streak} days
- Total stones (check-ins): {total_stones}
- Last check-in: {last_check_in or "None yet"}

Optional: use the search tool to find James Clear or Atomic Habits quotes/tips that could enrich the insights or experiment suggestions. Then output the required JSON object as your final answer."""
