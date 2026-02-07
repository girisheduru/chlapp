"""
Register prompt templates with Comet Opik project for versioning and observability.

Uses Opik Prompt Management: https://www.comet.com/docs/opik/prompt_engineering/prompt_management
When OPIK_ENABLED is true, prompts are registered at app startup and appear in the
Comet project's prompt library. Templates use Mustache-style {{variable}} placeholders.
"""

import logging
from typing import Any, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

# Registry of Opik Prompt objects (name -> Prompt). Populated when Opik is enabled.
REGISTERED_PROMPTS: dict[str, Any] = {}


def _template_identity_generation() -> str:
    return """Based on the following habit context, generate 3-5 identity statements that would help someone adopt this habit.

Starting Idea: {{starting_idea}}

Generate identity statements that:
1. Are specific and actionable
2. Align with the habit goal
3. Use first-person language (e.g., "I am a person who...")
4. Are empowering and positive

Return only the identity statements, one per line, without numbering or bullets."""


def _template_short_habit_options() -> str:
    return """Based on the following habit context, generate 3-5 simple "showing up" habit options that are easy to start.

Starting Idea: {{starting_idea}}
Identity: {{identity}}

Generate starter habit options that:
1. Are extremely simple (2 minutes or less)
2. Focus on "showing up" rather than completing the full habit
3. Are specific and actionable
4. Build momentum toward the larger goal

Return only the habit options, one per line, without numbering or bullets."""


def _template_full_habit_options() -> str:
    return """Based on the following habit context, generate 3-5 Supernova habit options (how the habit shows up when the user has more energy).

Starting Idea: {{starting_idea}}
Identity: {{identity}}
Nucleus Habit: {{starter_habit}}

Generate Supernova habit options that:
1. Represent the complete habit expression
2. Are specific and measurable
3. Build upon the starter habit
4. Align with the user's identity and goals

Return only the habit options, one per line, without numbering or bullets."""


def _template_obvious_cues() -> str:
    return """Based on the following habit context, generate 3-5 obvious cues or environmental triggers that would make this habit more obvious and easier to start.

Starting Idea: {{starting_idea}}
Full Habit: {{full_habit}}
Habit Stack: {{habit_stack}}

Generate obvious cues that:
1. Are environmental or contextual triggers
2. Make the habit more visible and obvious
3. Can be easily implemented
4. Align with the habit stack if provided

Return only the cues, one per line, without numbering or bullets."""


def _template_preference_edit_options() -> str:
    return """You are a supportive habit coach. The user is editing one part of their habit plan.
{{reflection_block}}

HABIT CONTEXT:
{{context_block}}

They are editing: {{label}}
Current value: "{{current_value}}"

Generate exactly 3 alternative phrasings for this preference. Each alternative should:
1. Stay true to their overall habit goal and identity
2. Be specific and actionable
3. Be a reasonable variation (different wording, slightly different angle, or a small improvement)
{{reflection_rule}}

Return only the 3 alternatives, one per line, without numbering or bullets. No other text."""


def _template_reflection_items() -> str:
    return """You are a supportive habit coach. Based on this user's habit plan and streak data, generate reflection items for a weekly reflection flow.

HABIT PLAN:
- Identity: "{{identity}}"
- Starting idea: {{starting_idea}}
- Nucleus habit: {{starter_habit}}
- Supernova habit: {{full_habit}}
- Anchor/cue: {{habit_stack}}
- Environment setup: {{habit_environment}}
- Enjoyment/fun elements: {{enjoyment}}

STREAK DATA:
- Current streak: {{current_streak}} days
- Longest streak: {{longest_streak}} days
- Total stones (check-ins): {{total_stones}}
- Last check-in: {{last_check_in}}

Generate a JSON object with exactly this structure (no markdown, no code block wrapper):

{
  "insights": [
    { "emoji": "💪", "text": "One short observation about their week or resilience.", "highlight": "Optional one-sentence takeaway." }
  ],
  "reflectionQuestions": {
    "question1": "What helped you show up — even a little? (optional)",
    "question2": "On days it didn't happen, what made starting feel harder? (optional)"
  },
  "experimentSuggestions": [
    {
      "type": "anchor",
      "title": "Strengthen your anchor",
      "currentValue": "Brief summary of their current anchor/cue.",
      "suggestedText": "One specific, actionable experiment (e.g. a time or trigger they could try).",
      "why": "One sentence on why this might help."
    },
    {
      "type": "environment",
      "title": "Prep your environment",
      "currentValue": "Brief summary of their current environment setup.",
      "suggestedText": "One specific experiment (e.g. what to prep and where).",
      "why": "One sentence on why this might help."
    },
    {
      "type": "enjoyment",
      "title": "Make it more enjoyable",
      "currentValue": "Brief summary of what they enjoy.",
      "suggestedText": "One specific experiment (e.g. pair habit with something they love).",
      "why": "One sentence on why this might help."
    }
  ]
}

RULES:
- insights: 0 to 2 items. Only add insights that are relevant (e.g. if they have a streak, mention showing up; if totalStones is low, encourage without being preachy). Use short, warm, second-person text.
- reflectionQuestions: Keep question1 and question2 as prompts that invite short optional answers. You may rephrase slightly for this habit.
- experimentSuggestions: Exactly 3 items, one for type "anchor", one "environment", one "enjoyment". Use their actual current values for currentValue. suggestedText must be one concrete, small experiment (1–2 sentences). why is one short sentence.
- Return only the JSON object, no other text."""


def _template_reflection_agent_system() -> str:
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


def _template_reflection_agent_user() -> str:
    return """Generate reflection items for this user's weekly reflection.

HABIT PLAN:
- Identity: "{{identity}}"
- Starting idea: {{starting_idea}}
- Nucleus habit: {{starter_habit}}
- Supernova habit: {{full_habit}}
- Anchor/cue: {{habit_stack}}
- Environment setup: {{habit_environment}}
- Enjoyment/fun elements: {{enjoyment}}

STREAK DATA:
- Current streak: {{current_streak}} days
- Longest streak: {{longest_streak}} days
- Total stones (check-ins): {{total_stones}}
- Last check-in: {{last_check_in}}

Optional: use the search tool to find James Clear or Atomic Habits quotes/tips that could enrich the insights or experiment suggestions. Then output the required JSON object as your final answer."""


def _template_reflection_suggestion() -> str:
    return """You are a habit coach who only suggests changes grounded in James Clear's Atomic Habits (his book and publicly available content). Do not suggest random or generic advice. Every suggestion must align with his framework.

Atomic Habits concepts to use:
- identity: Identity-based habits ("I am someone who..."). Change must reflect his idea that habits are votes for the type of person you wish to become.
- starter_habit (Nucleus habit): The 2-minute rule or "make it easy" — scale the habit down so it can be started in about 2 minutes. Match his "gateway habit" / "ritual" language where relevant. Use the product term "Nucleus habit" in titles when suggesting this type.
- full_habit (Supernova habit): "When energy allows" expansion — still within his idea of progressive improvement, not a leap. Use the product term "Supernova habit" in titles when suggesting this type.
- habit_stack: Habit stacking or implementation intention — "After [existing habit], I will [new habit]." Or a clear cue (time, place, preceding action) as he recommends.
- enjoyment: "Make it attractive" — temptation bundling, pairing with something you enjoy, or his "ritual + reward" idea. No generic "have fun."
- habit_environment: Environment design — "make it obvious." Change the context (visibility, friction, cues in the space) as he describes in the book.

Habit:
{{context_block}}

Reflection:
{{reflection_block}}

Suggest ONE change that (1) fits their reflection and (2) is clearly from Atomic Habits. Reply with only this JSON (no markdown):
{"type": "identity|starter_habit|full_habit|habit_stack|enjoyment|habit_environment", "title": "Short title", "suggestedText": "Exact new text for that preference", "why": "One sentence why, referencing Atomic Habits (e.g. 2-minute rule, habit stacking, identity, environment design)"}}"""


# Prompt names used in Comet project (must be unique in the workspace)
PROMPT_NAMES = {
    "identity_generation": "chlapp-identity-generation",
    "short_habit_options": "chlapp-short-habit-options",
    "full_habit_options": "chlapp-full-habit-options",
    "obvious_cues": "chlapp-obvious-cues",
    "preference_edit_options": "chlapp-preference-edit-options",
    "reflection_items": "chlapp-reflection-items",
    "reflection_agent_system": "chlapp-reflection-agent-system",
    "reflection_agent_user": "chlapp-reflection-agent-user",
    "reflection_suggestion": "chlapp-reflection-suggestion",
}


def _get_templates() -> list[tuple[str, str]]:
    """Return list of (opik_name, template_text) for all prompts."""
    return [
        (PROMPT_NAMES["identity_generation"], _template_identity_generation()),
        (PROMPT_NAMES["short_habit_options"], _template_short_habit_options()),
        (PROMPT_NAMES["full_habit_options"], _template_full_habit_options()),
        (PROMPT_NAMES["obvious_cues"], _template_obvious_cues()),
        (PROMPT_NAMES["preference_edit_options"], _template_preference_edit_options()),
        (PROMPT_NAMES["reflection_items"], _template_reflection_items()),
        (PROMPT_NAMES["reflection_agent_system"], _template_reflection_agent_system()),
        (PROMPT_NAMES["reflection_agent_user"], _template_reflection_agent_user()),
        (PROMPT_NAMES["reflection_suggestion"], _template_reflection_suggestion()),
    ]


def register_all_prompts() -> None:
    """
    Register all app prompt templates with the Comet Opik project.
    Safe to call multiple times; Opik returns existing prompt if name exists.
    No-op when Opik is disabled or not installed.
    """
    if not settings.opik_enabled:
        logger.debug("Opik disabled; skipping prompt registration")
        return
    try:
        import opik
    except ImportError:
        logger.warning("Opik not installed; skipping prompt registration. Run: pip install opik")
        return

    for opik_name, template in _get_templates():
        try:
            prompt_obj = opik.Prompt(
                name=opik_name,
                prompt=template,
                metadata={"app": "chlapp", "project": settings.opik_project_name},
            )
            REGISTERED_PROMPTS[opik_name] = prompt_obj
            logger.info("Registered prompt with Opik: %s", opik_name)
        except Exception as e:
            logger.warning("Failed to register prompt %s with Opik: %s", opik_name, e)

    if REGISTERED_PROMPTS:
        logger.info(
            "Registered %d prompts with Comet Opik (project: %s)",
            len(REGISTERED_PROMPTS),
            settings.opik_project_name,
        )


def get_registered_prompt(name: str) -> Optional[Any]:
    """
    Return the Opik Prompt object for the given name, if registered.
    name: one of PROMPT_NAMES values (e.g. 'chlapp-identity-generation').
    """
    return REGISTERED_PROMPTS.get(name)
