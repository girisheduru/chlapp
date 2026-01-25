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


def get_reflection_inputs_prompt(habits_data: list, streaks_data: list) -> str:
    """
    Generate prompt for reflection inputs based on habits and streaks.
    
    Args:
        habits_data: List of habit documents
        streaks_data: List of streak documents
        
    Returns:
        Formatted prompt string
    """
    habits_summary = "\n".join([
        f"Habit {i+1}: {habit.get('preferences', {}).get('full_habit', 'N/A')} "
        f"(Streak: {next((s.get('currentStreak', 0) for s in streaks_data if s.get('habitId') == habit.get('habitId')), 0)})"
        for i, habit in enumerate(habits_data)
    ])
    
    prompt = f"""Based on the following user's habits and streak data, generate 5-7 thoughtful reflection questions that would help the user reflect on their habit journey.

Habits and Streaks:
{habits_summary}

Generate reflection questions that:
1. Help users understand their progress
2. Identify obstacles and challenges
3. Discover what's working and what's not
4. Encourage self-awareness and growth
5. Are open-ended and thought-provoking

Return only the reflection questions, one per line, without numbering or bullets."""

    return prompt
