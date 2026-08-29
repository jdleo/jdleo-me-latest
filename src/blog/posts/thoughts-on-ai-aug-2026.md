## Introduction

So, this post is going to be very similar to my last post; however, that was made 5 months ago. These days in tech, 5 months is like 3 years, pre-AI. Everything is moving really fast. I know, we're sick of hearing about AI this AI that, but it's kind of the center of everything right now, so I think it's worth writing about.

Also, I'm done using AI to write. I even used AI to help me write some of my blog posts in the past, here. Every once in a while I'll come across a good, crisp article on Hacker News with obvious human grammatical issues and I've found it's really refreshing to read.

I'll cover:

- AI acceleration and the 10x productivity boost that every CEO wants
- Where models are going and where they need to go
- Future of Software Engineering, and what's different now vs. back then
- My current AI coding stack and way of working

## Achieving 10x with AI

I think coding velocity is the easy part, and we're basically already there. Phase 1 is getting really good with agents. Parallel coding tasks, worktrees, good specs, good testing gauntlets. A lot of people try to make that sound harder than it is, but it's really not. You can even have AI set it up for you. I think with a barebones agent with no fancy skills or parallelism gets you to 3-5x velocity alone. That was the biggest unlock. Phase 2 is having tasks come to you, and having your AI learn from your team/org's past mistakes/motivations and roll them into docs and governance. This is a bit more ambiguous because every organization is different.

However, being intentionally handwavy, this is what I believe a 10x coding system looks like:

1. Ingestion

- Short-horizon tasks (stories/tasks/bugs) - intake from Slack, Jira/Linear, GDoc/Notion, Meeting notes
- Long-horizon tasks (epics, large week+ tasks) - intake from *explicitly marked meetings + Jira/Linear
    - I say _explicitly_ marked because I wouldn't want every meeting to spawn a longer-horizon planning item. I think of these as 2-4 hour alignment sessions where you say, this is going to be an epic, we're aligning in this meeting. Consider all viewpoints in this meeting. I'll cover it later.

2. Execution - Agents with parallel verification mechanisms. Multi-agent depending on task complexity
3. Human in the loop - Critical decision points, have humans make the high quality decisions/approvals

- For reviewing your peer's work. I want humans to focus on _WHAT_ is changing. Is this the right change for our company? For our org? For our team? Will this potentially cause issues later that aren't evident from context & code? I think this "taste" factor is what makes a really good engineer. Agents are great at reviewing but lack that critical gut check on philosophy/direction. Let the humans be good at that.

4. Ops - Rollout + monitoring, trivially automatable with agents

So, once you build a system like this, I think you get your 10x+ coding velocity you always dreamed of. Okay, now once you built it, you're going to notice you don't have 10x the deliveries. Maybe 1.5 or 2x if you're lucky.

But why? Didn't you literally just say 10x? Well, because of something like [Amdahl's Law](https://en.wikipedia.org/wiki/Amdahl's_law). You can speed up one subcomponent (code) of a parallelizable system (work), but you will be limited by the bottleneck in that parallel system. That bottleneck is alignment and decision making.

I'm not an executive and I don't have experience in high-level management, so I won't claim to be an expert here. Actually, even if I try to offer suggestions here, it may reek of being naive or even not understanding how organizations work. However, I'll try.

Does this sound familiar, though? You make a doc, you get team approval. You start building something, your manager has ideas, you make some changes. Someone says "you should involve _", you bring that doc for their approval, they want changes. It bubbles up to a higher-up, they want changes, work is stalled. Runaway scope. If you just had every decision-maker in that meeting up front, could you have just achieved the same 10x with our coding system above instead of having months of runaround? I think it's ultra-naive to assume we can get EVERYONE's time for OUR project like it matters the most, but I do believe that would solve this issue forever.

I do believe people will start focusing on this human element a little more. _I AM NOT SAYING I WANT AI TO BE OUR DECISION MAKERS!_ But, I am saying AI can help organize the decisions. I don't know what it looks like, but we should have an organized, hierarchical system which uses some type of knowledge graph to decide who should be involved in a potential project/task's decision making, depending on the complexity, surface area, impact, and security/legal risk. A simple bug might only have 2 engineers allocated for the decision making (1 author, 1 approver) whereas a larger epic might need 6-7 key people involved. Maybe it schedules the meeting and allows for a 24-48 hour async follow-up/veto mechanism, and only kicks off agentic task planning after alignment is secured.

I have no idea how to solve it, I'm just saying we won't see the 10x until we do. Also ideas are a bottleneck, but humans are pretty good at ideas :)

## Where Models Are Going

Obviously, AI models are significantly better in 2026 than they were in 2025. For the first time, we can send coding agents off to go work, largely unsupervised. This was not fully possible in 2025 and they still needed handholding. This is a big leap; but this is very narrowly focused on software engineering and knowledge-work in general. For AGI, we want **general intelligence**. General Intelligence requires data. Data comes from the internet. [Right now, ~10% of the internet is written by AI](https://www.pewresearch.org/data-labs/2026/08/20/how-much-of-the-internet-is-written-with-ai/). It's also increasing quite sharply. We will continue to train on data written by AI. I do believe we will hit a ceiling. There is also a risk of poison fountains in training data.

I am not an expert in the making of models, but we need to dive deeper into crazier hybrid architectures like Transformer + Neuro-Symbolic + Cognitive architectures. Transformers are great for showing the text in the exact way a human would want to see it, but the reasoning (engine) behind that text needs to be more like a human brain. I'm not saying human brains are perfect, but I think they're worth modeling after. The way they link unrelated pieces of information, and those "shower thoughts" you get, are something we just can't get in AI today, and I'd love to see that. I know there's like 100s of startups trying to do this though and it looks like frontier labs are already way ahead of me. I'm just saying we have to think beyond next-token prediction at some point.

I will say I'm not one of those anti-AI doomers who says "it's just word prediction", I know it's more than that, even today. I'm just saying we will have to climb over this wall of our entire internet's training data corpus being generated by the thing we're supposed to improve upon.

For coding tasks, legal work, and planning, I don't think it matters _that much_ though. I think AI today can build almost any system you want. As long as it's not a novel system (and 99.999% of the time it isn't). For more experimental systems (medical/pathology systems, quant research, physics, game engines, 3d/4d work, etc), this is where it would be helpful. It would be especially helpful for scientific/math/medical discoveries as well.

## Future of Software Engineering

Maybe our titles start to change, but I don't think it matters. Jeff Bezos once said [he commits himself to three high-quality decisions a day](https://fortune.com/2026/06/08/jeff-bezos-daily-routine-decision-making-warren-buffett-inspiration/). He believes _that_ is what CEOs are paid to do. I think there will always be value in having good taste. I'm not so entitled to think I should be paid $500,000/yr to make three good decisions a day, but I'm saying I can certainly have that value if I'm making $2m+ worth of high quality decisions a year and I am significantly more right than I am wrong. Also human collaboration matters, if I can enable others and help others make high quality decisions. If I can work with them and we can make high-quality decisions together. This is what matters, and I think it will become increasingly more evident as our role shifts to becoming "agent managers" (lol).

There is definitely a new grad reading this right now and thinking, thanks a lot bro, how does this help me as someone who still has to grind Leetcode and apply to 800 roles when I know I'm just going to use AI when I land? Well, I've told you the future. I also discussed how I think the work is becoming commoditized. I also told you that human decisions and taste become more important than ever. Now is your time to build. Go build 100 things this summer. Go make a blog, go put content out there. You have to really love this job to be good at it. If you're not building 20 websites in a summer, do you really love it? I did this before I started working as a Software Engineer and I still do it even though I'm a busy one. I know it's "just a paycheck" to some people, but this field is awesome because people love doing it. AI made it so much easier now. You should **at least** have a personal site, and use some [SEO hacks](https://vercel.com/blog/nextjs-seo-playbook) to boost its visibility. If you don't have a personal website, then I don't know what to tell you, because it can take you 1 hour. Here's how:

1. Vercel
2. .me domain ($1.98 first year), link it to Vercel domains
3. Codex ($20/mo) or if you're **very** patient, Nvidia NIM (free)
4. Find a website you like the design of [here](https://onepagelove.com) or [here](https://www.ycombinator.com/companies)
5. Tell your coding agent "Make me a personal website, use this SEO guide, implement everything on that checklist, copy the exact design of {} website. When you're done, deploy it with vercel cli"
6. Add whatever content you want

There's not an excuse because it is _THAT_ easy. It will drive inbounds to your resume by at least 5x from whatever it was before. Just do it! If you're reading this and haven't yet, go go! :)

## My AI Coding Stack

I'll keep this one short because nobody cares, tbh. I just wanted to put it because it changes a lot.

Work:

- Opencode
- Cmux
- GPT 5.6 Sol xhigh (primary), Kimi K3 max (secondary)
- Worktrees
- Custom task prioritization engine which aggregates from slack, jira, google docs, gmail, and zoom meeting summaries
- Local voice transcription model (Nvidia Parakeet)

Personal:

- Opencode
- Cmux
- GLM 5.3 Flash - I'm just trying to be cheap, and it's pretty good. I just don't want to spend $5000/mo, which I would if I used the best models.
- Aqua Voice

## Conclusion

Have a good weekend! :D
