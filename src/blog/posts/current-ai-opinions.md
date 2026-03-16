# My Current AI Opinions

## Introduction

This is a *probably* meaningless blog that reflects my thoughts on the current state of AI, specifically in software engineering, because that's what I know best.

I want to share some of my opinions around the space right now, and ideally some tips. I do have strong conviction in all of these opinions/beliefs so I'll do my best to back them up; although, everything is anecdotal because I'm too lazy to find research.

## Opinions

### Skills > MCP, ALL The Time

I don't think I'm preaching anything new here; but, yes, I've found that skills are always better than MCP. When I say skills, I specifically mean Skills + CLI.

Why do I think it's better? Well, honestly, MCPs really never work well for me, and the moment I add more than 10, for some weird reason, the agent always starts to ignore them, and it always leads to me saying "don't forget to use the Atlassian MCP". That's anecdotal though - the objective answer is that skills are always less tokens for the LLM.

You have a simple `SKILL.md` which has the header at the top:
```md
---
name: jira
description: use this to interact with Jira
---
```

and yes, that's really all you need. Some people write very complicated descriptions but all the good LLMs will always pick this skill for anything to do with Jira. The agent will only load these headers to pick skills, and the entire skill file is only read when needed. Very efficient.

Compare that to the Atlassian MCP which has tons of json definitions, schemas that the LLM just doesn't need. Any modern LLM already knows how to use the `acli` cli, so why? In the skill file you can put your company/team-specific Jira quirks, and let the LLM use the CLI it already knows.

As for auth? Just tell the agent in the skill to check auth status and prompt the user to run the `acli jira auth login` command. Let the CLI handle the auth. 

If a CLI doesn't exist, write your own! Use 1Password or even Keychain to handle the credentials. Then bundle it in the same skill directory, and tell the agent how to run the scripts in the skill file. 

Also, you should write your own skill, [as per research here](https://arxiv.org/abs/2602.12670). It's not hard, and LLM will only bloat your skill with useless tokens anyways.

### Models Are Already Good Enough

I think LLM models are already good enough. When I say models, I really mean Opus 4.6 and GPT 5.4 specifically. I truly believe they can solve any task given to them. It's my prediction that we'll only get marginally better "intelligence" from here, at least with transformer-based models. It's only now just going to be a benchmark game where the labs fight for higher points on "ARC AGI" or "SWE Bench" whatever.

I think now, here are the most exciting problems we can solve:
1. Context - Notice that this is really what determines whether an agent does well at a task or not. How do we surface the right context, always? How can we make sure the context is both token-efficient and high quality. How can we write *pristine* specs that LLMs simply can't mess up.
2. Formal Verification - The art of *mathematically* verifying that an LLM's generated code output meets a spec. This can be a product spec, or security spec. How can we do this statically, mathematically and deterministically? The author of Designing Data Intensive Applications predicts [AI will make formal verification go mainstream](https://martin.kleppmann.com/2025/12/08/ai-formal-verification.html). 
3. Inference Speed - Just raw tok/s. Once we get frontier models reliably into the 1000 tok/s range, we can start doing wonderous things. [Cerebras Systems](https://cerebras.ai) is working on some cool stuff here, and I think Google/Nvidia will always push this forward too.
4. Cost - I think this happens naturally as AI models commoditize. So, no worries.

### No Brand Loyalty in AI

It doesn't matter who is the "cool" AI lab. Or who has the coolest landing page, or coolest model names, or coolest brand, or coolest Super Bowl commericals. Cost + Intelligence + Harnesses are all that matter (speed a little bit too, but people care about that last). I'll admit, there was a time Claude Code really felt like I had an edge over using anything else; however, I recently switched to Codex at $20/mo (vs. the $100/mo I paid for Claude Max), and I am able to do the same things. Codex you might have to fight with a little bit more, but GPT 5.4 really actually makes it close to Opus 4.6, and definitely as good as Sonnet 4.5/4.6 (which I already thought were good, and better than anything we had 6 months ago, surely).

This is a really exciting thing to know for the industry though; because, you could be some no-name lab of just two people that nobody knows, but if you make the best and cheapest coding model in the world, people will switch to you overnight, and subsequently, you will collect $10B ARR almost immediately.

There is zero real moat in a world where all it takes to switch is just changing a model ID or installing a new agent CLI.

### Let Your Task Be the Entry Point and AI Does Everything Else

My thesis is the human only has to do ONE thing very well in the development cycle. Let it be the Jira, or the Linear task, or the spec, or the meeting, whatever. Pick one entry point for the task, and let it be of utmost human quality. If the spec is good enough, AI will rarely fail. If the review, tests, and hopefully Formal Verification in the future is good enough, it will have very little mistakes.

Think like a Product Manager. Polish up on your stakeholder interaction skills, set extremely high quality meetings where people debate, get differing opinions. Explore all alternatives. Feed meeting transcripts into specs in Obsidian, use your agent to organize your thoughts. Turn it into a Jira/Linear. Use your Jira/Linear skill to build out the task.

Let the top funnel be high quality HUMAN decision-making, let the result be built by the agents. It can happen today, and I'm already doing it all the time.

I focus on the Jira/Linear (or it can be a Google Doc) a lot, because you can use these later as artifacts for performance reviews, promotion packets, etc. Not only will they help your agent, but if they're high quality, they will be treated like a holy grail artifact in your work as well.

### Don't Do Any Manual Work

Backlog grooming, status updates, prioritizaiton, PR descriptions. If you understand your work (which is the one real risk), then you really don't need to be doing these other things. Automate it all with skills/commands. Does anyone actually enjoy doing these things anyways? You shouldn't feel sentimental that this side of your job is being automated away. Focus on building/planning and being the orchestrator/architect.

Back in the day, if you were doing something more than once a day, you would write a shell script / alias for it. We all had tons of these to help speed up our job. Worked for us, but too scrappy/ugly to share with the world. Do the same with skills/commands.

### AI Exposure != AI Replacement Risk

People always conflate the two. I see the Karpathy heatmap that everyone is spamming right now. I saw the Anthropic article. I saw the Microsoft article. But honestly I think people are interpreting these completely wrong.

AI exposure does not mean a job is going to disappear. It simply means AI can perform or assist with a meaningful portion of the tasks inside that job. That distinction matters a lot. A job is not a single action. It is a big bundle of responsibilities, judgment, coordination, and decision making.

Take software engineering as the obvious example. Writing code is only one part of the job. There is debugging weird failures, figuring out unclear requirements, coordinating with product, design, and stakeholders, making architecture decisions, reviewing pull requests, deploying systems, and dealing with operational issues. LLMs are already extremely good at a subset of those tasks. Code generation, refactoring, tests, documentation. But the rest of the work is still messy, contextual, and often organizational.

So when a chart says software engineers have high AI exposure, all that really means is that AI can participate in a lot of the work. That is not the same thing as saying the role disappears.

The jobs that will actually vanish all have something different in common. The workflow is usually a simple pipeline that AI can complete end to end. A classic example is data entry. The job is basically reading information, structuring it, and inputting it into a system. Once AI can do those three steps reliably, the role disappears because there is no remaining judgment or coordination needed. The role was always the task itself.

Most professional jobs do not look like that. They are messy bundles of tasks, and AI ends up taking over pieces of the workflow rather than the entire thing.

What AI exposure actually predicts is something else entirely. First, massive productivity gains. One person can simply do more work. This is already obvious in software engineering. Second, the junior work gets eaten first. Boilerplate, drafts, simple analysis, repetitive tasks. Entry level roles shrink because the training wheels work gets automated away, which does create real risk for new grads trying to break into the industry. Third, teams compress. The role still exists, but fewer people are required to do it.

### Final Thoughts

Agents fail because specs are bad. That security issue? Well, technically, you didn't tell it *not* to do that. The spec was bad. The bug? The spec didn't handle that edge case. The spec was bad.

The average model with extremely high quality context will always outperform a frontier model with low quality / no context. You need clean repositories, well structured specs, good documentation, reliable tools (CLIs / commands).

The best engineers will be the orchestrators who are great at commanding tons of agents and load balancing context and being the bridge between humans, requirements, and machine. I think all good engineers will be "technical directors", just directing agents. The amazing engineers will also know when the output/context is bad, too. They will know when a spec is bad.