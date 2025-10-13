# 4 Startups in 14 Days

## Introduction

I'm building 4 startups in 14 days, and I'm currently on day 6 and have built the first versions of 2 of them. You might be wondering why, and I was inspired by one of the most famous makers in the space, [Pieter Levels](https://levels.io/?ref=jdleo.me). You should really go check out what he's been up to over the last few years; however, to keep it short, he's currently at ~$3m ARR across 6 main startups, and basically did all of this with a very simple tech stack and by himself for the most part.

Here is a [quote](https://x.com/levelsio/status/1457315274466594817) from Pieter:

> 🍰 Only 4 out of 70+ projects I ever did made money and grew
> 📉 >95% of everything I ever did failed
> 📈 My hit rate is only about ~5%
> 🚀 So...ship more

He's right. Why should we just be hyperfocusing on one idea and putting all our eggs in one basket? We should just ship. Let's look at the math.

```py
P(at least one success)=1−(1−p)n
```

So, it's simple. Build 4 startups in 14 days, and there is an **18.55%** chance that at least one of them will be successful. Now, if we build 12 startups in 12 months, there is a **45.96%** chance that at least one of them will be successful. That's nearly 50/50, and I like those odds.

So, that's it. Also, it's just fun and AI makes it so easy nowadays.

## The Setup

Super simple. I use [Cursor](https://www.cursor.com/?ref=jdleo.me) to help write the code, and exclusively use [Claude Sonnet 4.5](https://www.anthropic.com/news/claude-sonnet-4-5) with Cursor. Mainly, Cursor is really good for planning out large changes, debugging, and also just smaller, tedious changes. I'm still a career software engineer, so I'm fine with writing code and then using Cursor background agents to do dirty work and/or pair programming with me. I also know what scales and have a rough idea of what makes a secure app, so I know that "vibe coding" won't make a risk of my users' data.

I didn't want to waste any time on design, so I built a [design system](https://byjohnleonardo.com/design) up front. Something simple enough so it could work for almost any kind of app. This is similar to what Pieter does, and it's really easy to use.

I also used [ChatGPT](https://chat.com/?ref=jdleo.me) to help localize the description, promotional text, and subtitle for the App Store listings, and also for general research / ideation.

## The Startups

### Convo

![Convo Screenshot](/convo-screenshot.png)

I mainly built this for myself, but I just wanted a super simple app that easily lets me 1) chat with multiple LLM models and 2) very quickly save presets / agents without going through some complicated web UI. On top of that, there's a **lot** of good, free LLM models, so I figured I'd offer them for free. For the more premium models, it's **$6.99/month** for unlimited chats. I have no idea if this pricing is good, but it's what I'm going with for now. Rough napkin math says the profit margin should be **60-70%**. Changing the pricing is as easy as one line of code and submitting an App Store update.

App Store Link: [https://apps.apple.com/us/app/convo-ai-chat-agents/id6753784349](https://apps.apple.com/us/app/convo-ai-chat-agents/id6753784349)

**(If it's blank or says "App Not Available", that means it's still in review at the time of writing this.)**

### Tale

![Tale Screenshot](/tale-screenshot.png)

Super simple app that I thought would be fun to build, because I can launch it pretty quickly, and focus only on improving the story generation agents. I just think it would be fun to have infinite, custom shorter-form stories. I'm not saying it's better than writers or real books, but it's fun to mess around with. Right now I have a "dumb" agent which generates the stories, but I think it can evolve with creative agentic capabilities and smarter memory store to avoid contradictions. I'll price it at **$9.99/month**, and each chapter costs roughly **$0.01** to generate, so as long as every single user isn't generating _1000 chapters_ a month, I should be ok. Let's see, though.

App Store Link: [https://apps.apple.com/us/app/tale-ai-story-generator/id6753922553](https://apps.apple.com/us/app/tale-ai-story-generator/id6753922553)

**(If it's blank or says "App Not Available", that means it's still in review at the time of writing this.)**

### The Others

I plan to build the following startups next:

-   Grasp - Very similar to Tale, except for generating content to learn more about a topic. Example: Promot is "Quantum computing for a high schooler", and it will generate the chapter outline, the content, and chapters which allow you to unlock and progress through the content. It will also have capabilities to generate flash cards and save quick snippets from the text. The final vision is for you to have an "on-demand Duolingo for any topic".
-   Rodeo - An app that lets you refine your resume with AI. You can upload your resume, and the app will generate a list of improvements. You can then choose to apply the improvements, and the app will generate a new resume. You can also visualize your score over time. ResumeWorded is a popular app that does similar functionality, but it's quite pricy, especially in the age of AI where you could literally build a wrapper that achieves the same functionality.

I also have ideas for other startups, but my focus is on these 4 for now.

## Conclusion

I'm really excited to see how these startups perform. I'm not expecting them to be huge successes, but I'm excited to see how they perform. I'm also excited to see how my skills evolve as I build these startups. I'm not a designer or a marketer, so I'm sure there will be some learning curves there.

I'll be updating this blog post with the progress of these startups as I build them.

## Updates

None yet :)
