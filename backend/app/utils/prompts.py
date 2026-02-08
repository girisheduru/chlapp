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
    
    prompt = f"""Generate 1-3 identity statements based on the provided habit context {starting_idea}, following James Clear’s recommendations in his book "Atomic Habits" for creating effective identity-based habits.

An identity statement, as described by James Clear, should:
- Focus on "being" rather than "having" or simply "doing" (e.g., "I am..." vs. "I want..." or "I will...").
- Reinforce the type of person you intend to become, not just the outcome or action.
- Be specific, actionable, and grounded in the desired habit.
- Use first-person, positive, and empowering language that feels authentic.
- Act as evidence of your desired identity: reflect the small wins that reinforce your self-image.

Ensure each identity statement:
- Is specific and focused on consistent behavior or character.
- Aligns clearly with the habit’s underlying goal.
- Utilizes a positive, present-tense framing.
- Reflects self-identity (e.g., "I am the kind of person who...").

Return only the identity statements, each on a separate line, with no numbering or bullets.

# Output Format

Output only the finalized identity statements, each on a separate line, with no prefixes, numbering, bullets, or explanations.

# Examples

**Example 1**
- Habit context: "running regularly"
- Output:
I am a runner who prioritizes my health every day.
I am the kind of person who never misses a morning run.
I am someone who values consistency over intensity in my running.

**Example 2**
- Habit context: "reading every night"
- Output:
I am a reader who ends each day with a book.
I am a lifelong learner who values quiet reflection through reading.
I am someone who makes time to read every night.

(Examples above show proper use of James Clear’s identity-based habit approach. Real outputs should use the specific habit context provided in the input.)

# Notes

- Anchor identity statements in present-tense, positive self-perceptions that can be reinforced by small daily actions.
- Do not include explanation, formatting, or output labels—just the identity statements, line by line.

Remember: Ground each identity statement in James Clear’s guidance that lasting change comes from reinforcing the identity behind the habit, not just the outcomes."""

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
    
    prompt = f"""Generate 1–3 "streak-saving" habit options based on the following habit context, specifically for days when someone has low time or energy. Each option should be an especially simple, minimal version of the main habit that can be done in 2–5 minutes, so users can maintain their streak. Follow James Clear's guidance from Atomic Habits and his published advice: focus on making the habit as easy, actionable, and simple as possible—prioritizing "showing up" over high achievement, and using specificity to reduce friction.

Habit Context:
- Starting Idea: {starting_idea}
- Identity: {identity}

Guidelines:
- Each habit option should take only 2–5 minutes to complete.
- Options are for people short on time or energy—make them extremely easy.
- Reflect James Clear’s “Atomic Habits” approach: reduce friction, focus on the smallest viable action, and ensure the option builds momentum toward the larger habit.
- Each option should focus on simply showing up to preserve the streak, not completing the full habit.
- Each habit option must be specific and actionable.

# Steps
1. Identify the core action from the habit context.
2. Break this down to the most minimal actionable version possible (following Atomic Habits principles).
3. Generate 1–3 options (each 2-5 minutes max) suitable for maintaining a streak on low-motivation days.
4. Make sure each is clear, specific, and "streak-saving."

# Output Format

Output only the 1–3 habit options, one per line, without numbering or bullets.

# Examples

Example Input:
- Starting Idea: Meditate for 20 minutes every morning
- Identity: I am a calm, mindful person

Example Output:
Sit on your meditation cushion and take five slow breaths
Play a 2-minute guided meditation
Set a timer and quietly sit for 2 minutes

(Real examples should be similarly simple, actionable, and <5 minutes. Use placeholders for user-provided context.)

# Notes

- Prioritize options that are minimal and especially easy to do on difficult days.
- Do NOT return instructions, explanations, or numbering—just the 1-3 options, each on a new line.
- Base your guidance closely on James Clear’s “Atomic Habits” framework for making habits tiny and sustainable.
"""

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
    
    prompt = f"""Generate 1-3 concise, actionable habit options that people can implement to build their habit according to James Clear's Atomic Habits framework. Favor brief, clear suggestions suitable for display on a phone app—each option should be short and content-light, but still realistic, actionable, and motivating for days when motivation, time, and energy are high. Each habit option must:

- Be directly inspired by James Clear’s framework, language, and publicly available content (e.g., identity-based habits, habit stacking, environment design, attractive/satisfying habits).
- Align tightly with the user’s context:
    - Starting Idea: {starting_idea}
    - Identity: {identity}
    - Nucleus Habit: {starter_habit}
- Build meaningfully and ambitiously on the starter habit for high-energy days.
- Be specific, measurable, realistic, actionable, and very concise, with minimal words.
- Directly support the user’s stated identity and habit goals.
- Avoid generic suggestions.

# Steps

1. Quickly analyze the starting idea, identity, and starter habit for context.
2. Consider the relevant Atomic Habits principles and James Clear’s language and examples.
3. Draft 1-3 very concise, actionable options that escalate the starter habit for high-energy days.
4. Ensure each option is practical, specific, and especially brief—optimal for phone app presentation.

# Output Format

- Return only the 1-3 habit options.
- Each option should appear on its own line, with no numbering or bullets.
- Do not include any introductory or summary text.
- Each option must be clear, actionable, and concise (ideal maximum: 1 short sentence each).

# Examples

Example Input:
Starting Idea: Read more books
Identity: Lifelong learner
Nucleus Habit: Read 1 page of a non-fiction book each night before bed

Example Output:
Read a full chapter and jot one insight.
Summarize today’s reading in two sentences.
Read for 20 minutes, then tell someone what you learned.

(Real outputs should be tailored, even more concise if possible, but always actionable and clear.)

# Notes

- Do NOT repeat these instructions in your output.
- Only generate options aligned with James Clear’s published principles and language.
- Tailor all options closely to the specific user context.
- Make habit options as brief as possible—ideal for quick reading and action on a mobile device.
- Provide options with actionable language; avoid any fluff or wordiness.

Remember: Prioritize brevity, clarity, and strong relevance to the user’s identity and goals. Generate 1-3 concise, high-energy habit options, each on its own line, with no introductory text."""

    return prompt


def get_obvious_cues_prompt(habit_context: dict) -> str:
    """
    Generate prompt for obvious cues (environmental triggers).
    Uses all preferences collected up to and including the cue step in onboarding.
    """
    starting_idea = habit_context.get("starting_idea", "")
    identity = habit_context.get("identity", "")
    enjoyment = habit_context.get("enjoyment", "")
    starter_habit = habit_context.get("starter_habit", "")
    full_habit = habit_context.get("full_habit", "")
    habit_stack = habit_context.get("habit_stack", "")
    habit_environment = habit_context.get("habit_environment", "")

    prompt = f"""Generate 1-3 practical options for obvious cues or environmental triggers, specifically designed using principles and suggestions from James Clear's Atomic Habits framework, that will help make the target habit more obvious, easier to start, and promote consistent habit maintenance. Explicitly leverage ALL elements of the provided habit context: starting idea, identity, enjoyment/fun elements, starter (nucleus) habit, full (supernova) habit, cue/habit stack, and environment setup (if any). Every suggestion must be tailored using this context.

- Options must be firmly grounded in Atomic Habits' core principles: make it obvious, attractive, easy, and satisfying. Focus especially on "make it obvious" through cues and triggers, but draw upon the other three laws (attractive, easy, satisfying) where this increases practicality or fit for the user's situation.
- Each option must be practical—simple to implement, realistic for everyday users, and directly supportive of habit maintenance.
- All generated cues and triggers must demonstrate a specific and thoughtful use of the supplied context variables: starting idea, identity, enjoyment/fun elements, nucleus/starter habit, supernova/full habit, cue/habit stack, and current/potential environment setup.
- Do not return more than three options. Prefer the best and most actionable.
- Do not number, bullet, or otherwise format the options—return each cue as a separate line, no extra text or commentary.

HABIT CONTEXT:
- Starting Idea: {starting_idea}
    - Identity: {identity}
    - Nucleus Habit: {starter_habit}
    - Supernova Habit: {full_habit}
    - Environment setup: {habit_environment}
    - Enjoyment / fun elements: {enjoyment}

# Steps

1. Carefully examine all supplied HABIT CONTEXT variables:
   - Starting idea
   - Identity
   - Enjoyment / fun elements
   - Nucleus (starter) habit
   - Supernova (full) habit
   - Cue / habit stack
   - Environment setup
2. Integrate as many relevant details as possible from each variable into the proposed cues/triggers, adapting each suggestion to fit the user's current routines and physical or social environment.
3. Ensure every option is firmly grounded in Atomic Habits methodology, with a focus on "make it obvious" and practical, environmental cues.
4. Select and output only those cues that are feasible, actionable, and tightly connected to the user’s specific context.

# Output Format

Output 1-3 options, each as a single, unnumbered line. Do not include any additional commentary, labeling, or formatting—just the options themselves. Ensure each cue clearly demonstrates use of the provided context.

# Examples

**Example input (with context):**
- Starting Idea: Drink more water
- Identity: I am someone who values health and hydration
- Enjoyment / fun elements: Enjoy sipping cold water
- Nucleus habit: Take one sip of water on waking
- Supernova habit: Drink a full glass right after getting up
- Cue / habit stack: After I get out of bed, I will drink a glass of water
- Environment setup: Water bottle and clean glass on nightstand

**Example output:**
Place a cold water-filled bottle and a clean glass on your nightstand each night so you see and reach them immediately upon waking  
Set a sticky note with your identity statement ("I am someone who values health and hydration") on your alarm clock as a first visual cue  
Put a fun sticker on your glass to make the first sip more enjoyable, reinforcing the habit every time you wake up  

(For more involved habits or unique contexts, options should be tailored using all provided context—real responses should explicitly weave in as many habit context details as possible.)

# Notes

- ALWAYS leverage all habit context variables in your reasoning and suggestions. Each cue should feel clearly personalized.
- Anchor cues to specific places, times, or routine moments for effectiveness.
- Ensure suggestions align with Atomic Habits, especially "make it obvious."
- Focus on practical, real-world environmental cues that promote automaticity.
- Adapt cues to fit habit stacks, environment, fun/enjoyment, and identity as provided.
- **Never return more than 3 options, and never use numbers, bullets, or formatting.**

**Remember: Generate ONLY 1-3 practical, context-rich, actionable cues using Atomic Habits guidance, each as its own unmarked line, no explanations or formatting.**"""

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

    prompt = f"""You are a supportive habit coach helping a user edit one part of their habit plan. Your task is to generate exactly 3 alternative phrasings for their current preference for the specified habit element. 

Incorporate the following requirements:

- Each alternative must be clearly different from the user's current value (not just reworded but presenting a genuinely different approach, angle, or improvement).
- Each alternative must stay true to the user's overall habit goal and identity.
- Each alternative must be specific and actionable.
- Alternatives should draw on James Clear’s "Atomic Habits" framework: each suggestion should embody at least one of the Four Laws of Behavior Change ("Make it Obvious," "Make it Attractive," "Make it Easy," or "Make it Satisfying"). State briefly (in brackets at the end of each alternative) which law(s) the alternative exemplifies.
- When the user provides reflection from this week, use it to inform your options (e.g., address obstacles mentioned, build on what helped, or reflect what they noticed).

HABIT CONTEXT:
{context_block}

Label being edited: {label}
Current value: "{current_value or '(empty)'}"
User Reflection (if provided): 
{reflection_block}

# Steps
1. Analyze the current habit value, the user's context, and any reflections provided.
2. Generate three alternative phrasings that are meaningfully different from the current value, guided by Atomic Habits' Four Laws.
3. Clearly show which law(s) each suggestion uses, in brackets at the end.
4. Each alternative should be a one-sentence actionable statement.

# Output Format

- Return only the 3 alternatives, one per line, without numbering or bullets.
- Each alternative is a single, specific, actionable sentence, ending with [Law name(s)] in brackets.
- No additional text.

# Notes

- Alternatives must not duplicate wording or approach from the current value.
- Options may vary in scale, timing, environment, or reward to embody a law of Atomic Habits.
- Consider both positive reflection (build on strengths) and obstacles (offer solutions).

(Reminder: Generate 3 actionable alternatives for the user’s habit preference, making sure each option is different from the current value, explicitly inspired by Atomic Habits, and includes the relevant law(s) in brackets.)"""

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

    prompt = f"""Reflect on the user's habit plan and streak data using James Clear's Atomic Habits framework. Generate a supportive weekly reflection with personalized insights, questions, and habit experiments rooted in Atomic Habits principles (identity, cues, habit stacking, the four laws: make it obvious, attractive, easy, and satisfying).

Draw on the following input:

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

Follow these instructions:

- Use the Atomic Habits framework for all reasoning and suggestions. Concepts include identity-based habits, the habit loop (cue-craving-response-reward), habit stacking, environment design, and the Four Laws (make it obvious, attractive, easy, satisfying).
- For each insight and suggestion, briefly show how it connects to a specific Atomic Habits principle (implicitly or explicitly).
- Use warm, personalized, second-person language for all observations and questions.
- Keep all reasoning and supportive language concise and relevant to the provided habit and streak data.

# Steps

1. Analyze the habit plan and streak data using concepts from the Atomic Habits framework.
2. Identify up to 2 personalized insights grounded in their recent behaviors and Atomic Habits principles (e.g., mention the power of consistent cues or the impact of environment).
3. Rephrase or personalize the two given reflection questions for this habit, referencing habit design and what drives or blocks action per the framework.
4. Suggest exactly 3 actionable, concrete habit "experiments":
    - One focused on enhancing their anchor/cue (habit stacking or making the cue more obvious).
    - One focused on optimizing their environment (removing friction or preparing tools).
    - One focused on adding fun/reward (increasing enjoyment, making it satisfying).
   Each experiment should briefly apply or reference a corresponding Atomic Habits law or technique.
5. Keep responses supportive and encourage small, sustainable improvements.

# Output Format

Return a single JSON object with exactly this structure and field names (do not add markdown or any extra text):

{
  "insights": [
    { "emoji": "💪", "text": "[Short, warm observation about their week or resilience rooted in Atomic Habits ideas]", "highlight": "[Optional one-sentence Atomic Habits takeaway, such as 'Your streak shows how identity-driven habits stick.']" }
  ],
  "reflectionQuestions": {
    "question1": "[Rephrased: What subtle cues or routines helped you show up this week? (or similar, tied to cues/identity)]",
    "question2": "[Rephrased: When it was tough to start, what got in the way? How might you tweak your environment or routine? (tie to habit friction or cue)]"
  },
  "experimentSuggestions": [
    {
      "type": "anchor",
      "title": "Strengthen your anchor",
      "currentValue": "[Short summary of their current anchor/cue]",
      "suggestedText": "[Concrete, specific experiment based on cue stacking or making the trigger more obvious]",
      "why": "[One sentence on why this helps, referencing Atomic Habits concepts or laws]"
    },
    {
      "type": "environment",
      "title": "Prep your environment",
      "currentValue": "[Short summary of their current environment setup]",
      "suggestedText": "[Concrete, specific experiment to make the environment more supportive]",
      "why": "[One sentence: why this works, referencing reducing friction or making habits easier]"
    },
    {
      "type": "enjoyment",
      "title": "Make it more enjoyable",
      "currentValue": "[Short summary of their enjoyment or reward aspect]",
      "suggestedText": "[Concrete, specific experiment adding a reward or pairing with something enjoyable]",
      "why": "[One sentence: why this builds positive associations, referencing making habits satisfying]"
    }
  ]
}

# Examples

Example input (shortened):

Identity: "Early riser"
Starting idea: "Get up at 6am"
Starter habit: "Drink a glass of water on waking"
Full habit: "Morning jog at 6:15am"
Anchor/cue: "Alarm at 6am"
Environment setup: "Glass and running shoes by the bed"
Enjoyment: "Listening to favorite music"
Current streak: 4 days
Longest streak: 5 days
Total stones: 7
Last check-in: "Yesterday"

Example output:

{
  "insights": [
    {
      "emoji": "💪",
      "text": "You kept your new habit alive four days in a row. Starting your morning with a simple action shows strong identity-based consistency.",
      "highlight": "Small actions stacked on a reliable cue build lasting routines."
    }
  ],
  "reflectionQuestions": {
    "question1": "What made it easier to notice your 6am cue this week?",
    "question2": "When you skipped your habit, did anything in your morning routine throw you off? How could you tweak your setup?"
  },
  "experimentSuggestions": [
    {
      "type": "anchor",
      "title": "Strengthen your anchor",
      "currentValue": "Alarm at 6am",
      "suggestedText": "Try placing your alarm on the other side of the room to ensure you get out of bed right away.",
      "why": "Moving the cue into your physical environment makes the habit more obvious and harder to ignore."
    },
    {
      "type": "environment",
      "title": "Prep your environment",
      "currentValue": "Glass and running shoes by the bed",
      "suggestedText": "Lay out your workout clothes on top of your shoes the night before.",
      "why": "Minimizing friction in your environment makes it easier to start your habit immediately."
    },
    {
      "type": "enjoyment",
      "title": "Make it more enjoyable",
      "currentValue": "Listening to favorite music",
      "suggestedText": "Create a special morning playlist you only play during your jog.",
      "why": "Pairing your habit with a reward makes it more satisfying and enjoyable."
    }
  ]
}

# Notes

- Strictly follow the exact JSON field names and structure—no additional fields or commentary.
- Every insight and suggestion should directly reflect or leverage at least one Atomic Habits principle.
- Use placeholders for long user content if examples are abbreviated.
- Remain warm and supportive while prioritizing habit science over general advice.
- Ensure suggestions are actionable, small, and clearly connected to the relevant aspect of habit formation.
- Always return ONLY the JSON object, no surrounding markdown! 

Remember: Use the Atomic Habits framework for all analysis and suggestions, focus on the science of habit formation, and only output the required structured JSON."""

    return prompt


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

    return f"""Suggest ONE habit change, tailored to the user's unique context and reflection, using only James Clear's Atomic Habits framework. Make sure your suggestion is specific to their situation, not general or random. Reason step-by-step about how the user's reflection and context inform your choice of change and framework element. Your final suggestion must be strictly aligned with one of the Atomic Habits concepts listed below.

Atomic Habits concepts to use:
- identity: Identity-based habits ("I am someone who..."). Change must reflect the idea that habits are votes for the type of person you wish to become.
- starter_habit (Nucleus habit): The 2-minute rule or "make it easy" — scale the habit down so it can be started in about 2 minutes. Use the product term "Nucleus habit" in titles when suggesting this type.
- full_habit (Supernova habit): "When energy allows" expansion — still within progressive improvement, not a leap. Use "Supernova habit" in titles when suggesting this type.
- habit_stack: Habit stacking or implementation intention — "After [existing habit], I will [new habit]." Or a clear cue (time, place, preceding action).
- enjoyment: "Make it attractive" — temptation bundling, pairing with something enjoyable, or "ritual + reward". No generic advice.
- habit_environment: Environment design — "make it obvious." Change the context (visibility, friction, cues in the space).

Details provided:
Habit Context:
{context_block}

User Reflection:
{reflection_block}

# Steps
1. Analyze the user's context and reflection to identify a relevant habit barrier or motivation.
2. Select the most fitting Atomic Habits concept for this situation. Briefly explain your reasoning.
3. Suggest a single, actionable change, rooted in the chosen framework concept and clearly linked to the user's personal context.
4. Present only the required JSON object as your final answer.

# Output Format

Return only the following JSON object (no markdown, no commentary):

{{
  "type": "identity|starter_habit|full_habit|habit_stack|enjoyment|habit_environment",
  "title": "Short title (use product term if appropriate)",
  "suggestedText": "Exact new text for this user's situation",
  "why": "One concise sentence referencing the exact Atomic Habits principle and the user's context"
}}

# Example

Example (for context_block: "Wants to read more books at night, but often too tired"; reflection_block: "I wish I could at least get started, but I lose motivation after a long day."):

Reasoning: The user struggles to start reading because they are tired at night. A "Nucleus habit" fits best, as it focuses on making the habit so easy they can't say no. Scaling the action to a two-minute starter lowers the barrier.

{{
  "type": "starter_habit",
  "title": "Nucleus habit: Open the book before bed",
  "suggestedText": "After I get into bed, I will open a book and read one page.",
  "why": "This uses the 2-minute rule from Atomic Habits to create an easy gateway for reading, tailored to the user's end-of-day fatigue."
}}

# Notes

- Always use explicit reasoning to select both the framework element and the advice.
- Tailor your change to the specific context and reflection provided.
- Only include the reasoning step before your JSON output (not within it).
- No additional commentary or explanation outside of the reasoning and JSON.

Remember: Your objective is to produce one highly tailored, evidence-backed suggestion in Atomic Habits style, with a reasoning step preceding your structured output."""
