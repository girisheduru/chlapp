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
  
   prompt = f"""Generate 3 identity statements based on the provided habit context {starting_idea}, following James Clear’s recommendations in his book "Atomic Habits" for creating effective identity-based habits.


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
- Avoids absolutes ("never," "always," "every") and specific numbers or metrics. Frame identity as a direction, not a rigid standard.


Return only the identity statements, each on a separate line, with no numbering or bullets.


# Output Format


Output only the finalized identity statements, each on a separate line, with no prefixes, numbering, bullets, or explanations.


# Examples


**Example 1**
- Habit context: "running regularly"
- Output:
I am a runner who shows up for myself consistently.
I am someone who prioritizes movement as part of who I am.
I am the kind of person who values building a running habit.


**Example 2**
- Habit context: "reading every night"
- Output:
I am a reader who winds down with a book.
I am a lifelong learner who makes space for reading.
I am someone who feeds my curiosity through books.


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
  
   prompt = f"""Generate 3 "Nucleus Habit" options based on the following context. A Nucleus Habit is the smallest daily action that still reinforces a person's chosen identity — the version of the habit they can do on their worst day and still say "I showed up."


Follow James Clear's two-minute rule from Atomic Habits: scale the habit down to something that takes roughly 2 minutes. The key insight is "a habit must be established before it can be improved." The Nucleus Habit is about mastering the art of showing up, not achieving a result.


Habit Context:
- Starting Idea: {starting_idea}
- Identity: {identity}


Guidelines:
- Each option must be a repeatable daily action — something that makes sense to do on day 1 AND day 100 without feeling stale or "done."
- Each option should take roughly 2 minutes (no more than 5).
- Focus on the core behavior, not a one-time reflection or planning task.
- The action should directly reinforce the identity — doing it should feel like casting a vote for "I am this kind of person."
- Be specific and concrete: describe what the person actually does, not a vague intention.
- Avoid one-time tasks disguised as habits (e.g., "write down your goals" or "research X").
- Avoid absolutes ("never," "always," "every") and specific numbers or metrics.
- Frame each option as a scaled-down version of the starting idea, not a separate or tangentially related activity.


# Steps
1. Identify the core repeatable behavior embedded in the starting idea.
2. Scale it down to the smallest version that still counts as doing the behavior (not thinking about it, planning it, or researching it).
3. Generate 3 options, each a different minimal version of that core behavior.
4. Verify each option passes the "day 100 test" — would this still be meaningful and non-redundant on the 100th day?




# Output Format


Output only the 3 habit options, one per line, without numbering or bullets.


# Examples


**Example 1**
- Starting Idea: Meditate regularly
- Identity: I am someone who cultivates a calm and focused mind
- Output:
Sit quietly and take five slow, intentional breaths
Close your eyes for two minutes and focus on your breathing
Pause what you're doing and do a one-minute body scan


**Example 2**
- Starting Idea: Read more books
- Identity: I am someone who feeds my curiosity through reading
- Output:
Read one page of a book you're working through
Open your current book and read for two minutes
Pick up your book and read until you finish one passage


**Example 3**
- Starting Idea: Get into better shape
- Identity: I am someone who takes care of my body through movement
- Output:
Do one set of push-ups or bodyweight squats
Put on your workout shoes and move your body for two minutes
Step outside and walk around the block once


**Example 4**
- Starting Idea: Advance in my career
- Identity: I am someone who invests in my professional growth
- Output:
Read one page or article related to your field
Spend two minutes practicing a skill you're developing
Write one sentence capturing something you learned at work today


# Notes


- The Nucleus Habit is NOT a planning or goal-setting exercise — it is the actual behavior, scaled down.
Every option should be something the user actively does (reads, writes, moves, practices, reflects) — not a one-time planning or brainstorming task.
- Prioritize options that are the smallest recognizable version of the full habit — like James Clear's example of "read one page" instead of "read 30 books a year."
- Each option should feel like a vote for the user's chosen identity when completed.
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
  
   prompt = f"""Generate 3 "Supernova Habit" options based on the following context. A Supernova Habit is the expanded version of the user's Nucleus Habit — what the same core behavior looks like when they have more time and energy. It is NOT a separate activity or project. It's the Nucleus Habit with the volume turned up.


Follow James Clear's principle from Atomic Habits: "reduce the scope but stick to the schedule." The Nucleus Habit is the reduced scope. The Supernova Habit is the full scope — the version the user does on a good day when they have more time and energy.


Each habit option must:
- Align tightly with the user's context:
   - Starting Idea: {starting_idea}
   - Identity: {identity}
   - Nucleus Habit: {starter_habit}
- Be a scaled-up version of the Nucleus Habit — the same core behavior, with more depth, duration, or intensity.
- Be specific, realistic, actionable, and concise.
- Directly support the user's stated identity and habit goals.
- Avoid generic suggestions, one-time tasks, or project-type activities (e.g., "create a vision board," "research a new career path").
- Each option must be repeatable — something that makes sense to do on any high-energy day, not just once.
- Avoid adding dependencies on other people (e.g., "tell someone what you learned," "network with a new person").
- Avoid absolutes ("never," "always," "every") and specific numbers or metrics.
- Each option should make it clear what "done" looks like — the user should know exactly what action to take and when they've finished it.


# Steps
1. Quickly analyze the starting idea, identity, and starter habit for context.
2. Identify the core behavior in the Nucleus Habit.
3. Scale that core behavior up — more time, more depth, or more intensity — while keeping it the same type of action.
4. Verify each option is repeatable (passes the "day 100 test") and is clearly a bigger version of the Nucleus Habit, not a separate activity.


# Output Format
- Return only the 3 habit options.
- Each option should appear on its own line, with no numbering or bullets.
- Do not include any introductory or summary text.
- Each option must be clear, actionable, and concise (ideal maximum: 1 short sentence each).


# Examples


**Example 1**
- Starting Idea: Read more books
- Identity: I am someone who feeds my curiosity through reading
- Nucleus Habit: Read one page of a book you're working through
- Output:
Read a full chapter of your current book.
Read and highlight passages that stand out.
Read a chapter and write one sentence about what stuck with you.


**Example 2**
- Starting Idea: Meditate regularly
- Identity: I am someone who cultivates a calm and focused mind
- Nucleus Habit: Sit quietly and take five slow, intentional breaths
- Output:
Do a full guided meditation session.
Meditate with a body scan from head to toe.
Sit and meditate until you feel settled and focused.


**Example 3**
- Starting Idea: Get into better shape
- Identity: I am someone who takes care of my body through movement
- Nucleus Habit: Do one set of push-ups or bodyweight squats
- Output:
Complete a full bodyweight workout.
Go for a run or brisk walk.
Do a full strength circuit with a few exercises.


**Example 4**
- Starting Idea: Advance in my career
- Identity: I am someone who invests in my professional growth
- Nucleus Habit: Read one page or article related to your field
- Output:
Read a full article or book chapter related to your field.
Work through a lesson or module in a skill you're building.
Read an in-depth article and write a short summary of your takeaways.


# Notes
- Do NOT repeat these instructions in your output.
- The Supernova Habit must be recognizably the same behavior as the Nucleus Habit, just with more time or depth. If the Nucleus Habit is "read one page," the Supernova should be "read a full chapter" — not "create a reading list" or "join a book club."
- Every option should be something the user can do independently, without relying on other people or external circumstances.
- Each option should feel like a natural expansion — the user should think "that's just more of what I already do on easy days."
- Make habit options as brief as possible—ideal for quick reading and action on a mobile device."""


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


   prompt = f"""Generate 3 practical environment design tips that will make the user's habit the path of least resistance.

This combines two of James Clear's laws of behavior change from Atomic Habits:
- "Make it obvious" — prime your environment so the good habit is the easiest, most visible thing to do.
- "Make it attractive" — set up the space so it feels enjoyable, not like a chore.

As Clear says: "Walk into the rooms where you spend most of your time and ask yourself, what is this space designed to encourage?"

Habit Context:
- Starting Idea: {starting_idea}
- Identity: {identity}
- Nucleus Habit: {starter_habit}
- Supernova Habit: {full_habit}
- Habit Stack (cue): {habit_stack}
- What makes it fun: {enjoyment}

Guidelines:
- Follow this pattern for the 3 tips:
  1. Make it obvious — put the thing the user needs in sight, right where the habit happens.
  2. Make it obvious — create a space dedicated to the habit, framed positively around what the space is for (not what to remove or hide).
  3. Make it attractive — weave in the user's enjoyment factor using a bracket at the end. The tip should work on its own as a practical environment change, and the bracket adds a specific enjoyment enhancement. Format: "Practical tip (enjoyment enhancement)." Only include the bracket if the enjoyment factor genuinely connects to the habit — if it doesn't, keep the tip purely practical.
- Each tip should be a simple, physical change the user can make to their space right now.
- When a tip reduces friction or distractions, frame it positively — describe what the space becomes for the habit, not what the user should remove or hide. Connect it back to why it helps the habit.
- Keep each tip to one short sentence — these display on a mobile screen.
- Avoid absolutes ("never," "always," "every") and specific numbers or metrics.
- Tips should be specific to the user's habit, not generic productivity advice.
- Do not suggest alarms, reminders, apps, or notifications — this is about physical space only.
- Do not suggest anything involving other people.
- Do not repeat or restate the habit stack cue — that's already been chosen.
- Each tip should make sense as something the user sets up once and benefits from daily.

# Steps
1. Look at the nucleus and supernova habits — what physical items, tools, or spaces does the user need to do them?
2. Think about where the habit happens and how to make that spot dedicated to the habit — frame it positively around what the space is for.
3. Check the enjoyment factor — can it be turned into a specific, concrete enhancement to one of the tips? If yes, add it in brackets. If it doesn't naturally connect, skip the bracket.
4. Suggest simple physical changes that put items in sight, create a dedicated space, and make it an enjoyable place to do the habit.

# Output Format
- Return exactly 3 tips, one per line, no numbering or bullets.
- Each tip should be one short, concrete sentence.
- At most one tip should include a bracketed enjoyment enhancement.
- No introductory text, commentary, or explanations.

# Examples

**Example 1**
- Starting Idea: Read more books
- Nucleus Habit: Read one page of a book you're working through
- Supernova Habit: Read a full chapter of your current book
- Habit Stack: After my evening tea
- What makes it fun: My cozy setup
- Output:
Leave your book on the chair where you drink your evening tea so it's waiting for you.
Make your tea chair a screen-free zone so your book gets your full attention.
Set up your reading corner to feel inviting (a soft blanket, good lighting, whatever makes you want to stay).

**Example 2**
- Starting Idea: Meditate regularly
- Nucleus Habit: Sit quietly and take five slow, intentional breaths
- Supernova Habit: Do a full guided meditation session
- Habit Stack: Right after waking up
- What makes it fun: A look or vibe I like
- Output:
Set a cushion or pillow in a quiet corner where you'll see it when you get out of bed.
Keep headphones next to your cushion if you use guided sessions.
Make your meditation spot feel like yours (a candle, a plant, whatever vibe draws you in).

**Example 3**
- Starting Idea: Get into better shape
- Nucleus Habit: Do one set of push-ups or bodyweight squats
- Supernova Habit: Complete a full bodyweight workout
- Habit Stack: After my morning coffee
- What makes it fun: Music I love
- Output:
Lay out your workout clothes the night before so you can change and go right after your morning coffee.
Dedicate a spot in your home for movement so there's room to go without any setup.
Leave your headphones or speaker somewhere visible in the kitchen (with your playlist queued up so you grab them with your coffee).

**Example 4**
- Starting Idea: Advance in my career
- Nucleus Habit: Read one page or article related to your field
- Supernova Habit: Read a full article or book chapter related to your field
- Habit Stack: After eating lunch
- What makes it fun: A bit of challenge
- Output:
Pin your go-to learning site as the first tab in your browser so it's open after lunch.
Save articles in one dedicated spot so you have something ready to read when you sit down.
Keep a notes doc open alongside your reading (challenge yourself to pull out one usable idea each time).

# Notes
- This is about physical environment design — not cues, not reminders, not apps, not social accountability.
- Think like an interior designer for habits: where do things go so the right behavior is the obvious one?
- Tip 1 is about visibility — put the habit in the user's path. Tip 2 is about creating a dedicated space — framed positively. Tip 3 is about making it attractive — weaving in the enjoyment factor where it fits.
- The bracket pattern lets you acknowledge the user's enjoyment factor without forcing it. The tip must stand alone as a practical environment change — the bracket is a bonus, not the main point.
- If the enjoyment factor doesn't naturally connect to the physical environment, skip the bracket entirely. A practical tip is better than a contrived fun tip.
- Tips should feel practical and doable — not aspirational or requiring a major life change."""


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


{{
 "insights": [
   {{ "emoji": "💪", "text": "[Short, warm observation about their week or resilience rooted in Atomic Habits ideas]", "highlight": "[Optional one-sentence Atomic Habits takeaway, such as 'Your streak shows how identity-driven habits stick.']" }}
 ],
 "reflectionQuestions": {{
   "question1": "[Rephrased: What subtle cues or routines helped you show up this week? (or similar, tied to cues/identity)]",
   "question2": "[Rephrased: When it was tough to start, what got in the way? How might you tweak your environment or routine? (tie to habit friction or cue)]"
 }},
 "experimentSuggestions": [
   {{
     "type": "anchor",
     "title": "Strengthen your anchor",
     "currentValue": "[Short summary of their current anchor/cue]",
     "suggestedText": "[Concrete, specific experiment based on cue stacking or making the trigger more obvious]",
     "why": "[One sentence on why this helps, referencing Atomic Habits concepts or laws]"
   }},
   {{
     "type": "environment",
     "title": "Prep your environment",
     "currentValue": "[Short summary of their current environment setup]",
     "suggestedText": "[Concrete, specific experiment to make the environment more supportive]",
     "why": "[One sentence: why this works, referencing reducing friction or making habits easier]"
   }},
   {{
     "type": "enjoyment",
     "title": "Make it more enjoyable",
     "currentValue": "[Short summary of their enjoyment or reward aspect]",
     "suggestedText": "[Concrete, specific experiment adding a reward or pairing with something enjoyable]",
     "why": "[One sentence: why this builds positive associations, referencing making habits satisfying]"
   }}
 ]
}}


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


{{
 "insights": [
   {{
     "emoji": "💪",
     "text": "You kept your new habit alive four days in a row. Starting your morning with a simple action shows strong identity-based consistency.",
     "highlight": "Small actions stacked on a reliable cue build lasting routines."
   }}
 ],
 "reflectionQuestions": {{
   "question1": "What made it easier to notice your 6am cue this week?",
   "question2": "When you skipped your habit, did anything in your morning routine throw you off? How could you tweak your setup?"
 }},
 "experimentSuggestions": [
   {{
     "type": "anchor",
     "title": "Strengthen your anchor",
     "currentValue": "Alarm at 6am",
     "suggestedText": "Try placing your alarm on the other side of the room to ensure you get out of bed right away.",
     "why": "Moving the cue into your physical environment makes the habit more obvious and harder to ignore."
   }},
   {{
     "type": "environment",
     "title": "Prep your environment",
     "currentValue": "Glass and running shoes by the bed",
     "suggestedText": "Lay out your workout clothes on top of your shoes the night before.",
     "why": "Minimizing friction in your environment makes it easier to start your habit immediately."
   }},
   {{
     "type": "enjoyment",
     "title": "Make it more enjoyable",
     "currentValue": "Listening to favorite music",
     "suggestedText": "Create a special morning playlist you only play during your jog.",
     "why": "Pairing your habit with a reward makes it more satisfying and enjoyable."
   }}
 ]
}}


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
