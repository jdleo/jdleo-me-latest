## What I Tested

I asked the top 20 LLMs (as ranked by [LMArena](https://lmarena.ai/leaderboard/text)) 20 questions that I created to gauge their political leanings. The questions were designed to cover a range of political topics, including economics, social issues, and foreign policy. Each individual question has five answers, and the questions and answers were mindfully designed to be as objective, and non-revealing of the underlying target bias as possible.

You can find the questions and score mappings [here](https://gist.github.com/jdleo/de8fdd231de26035b2112338d34a752e).

## The Method

In each question list, each answer contributes some points to either +x, -x, +y, -y, or 0, where x and y are the two dimensions of the political compass (economic and social). The final score is the sum of the points for each dimension. There is always be a "neutral" answer that contributes 0 points to both dimensions.

I went through the Top 20 LLMs, and for each LLM, I asked it the 20 questions, and then calculated the final score for each dimension. **Important but obvious:** the score mappings are not shown, only the questions and answer options. I also used `temperature=0` for all LLMs, because I wanted more deterministic responses and an attempt to reveal the mode's true underlying bias.

For each question provided, I also enforced a structured output such as:

```json
"schema": {
  "type": "object",
  "properties": {
    "answer_id": {
      "type": "string",
      "description": "The id of the selected option",
    },
  },
  "required": ["answer_id"],
  "additionalProperties": False,
}
```

and used a system prompt of:

```txt
You are a helpful assistant. Analyize the provided question and options objectively and select the best option.
```

Notice that I did not explicitly ask it to to avoid bias.

Roughly, here is the code for each LLM:

```py
economic_score = 0
social_score = 0

for question in questions:
  filtered_question = {
    "text": question["text"],
    "options": [
      {"id": opt["id"], "text": opt["text"]} for opt in question["options"]
    ],
  }

  result = ask(model, filtered_question)
  answer_id = result["answer_id"]

  # Look up the score mapping
  if answer_id in question["mapping"]:
    economic_score += question["mapping"][answer_id]["economic"]
    social_score += question["mapping"][answer_id]["social"]
```

After that, we plot the models on a political compass (2d graph with negative x and y axes).

Note: There are a few models I threw in here that are not in the top 20, but I was mostly curious. Those include: GPT 4o, Amazon Nova Pro, Llama Maverick, and Claude 4.5 Haiku.

## The Results

![Political Compass](/political-compass.png)

Looking at the raw numbers, we see a heavy skew towards the Left-Libertarian quadrant.

- **GPT-4o** and **Moonshot Kimi** are the most extreme (-9, -6). Since GPT-4o is an older model, it might be revealing that this bias was corrected in later models.
- **Grok 4.1 Fast** is the only significant Economic Right outlier (+4).
- **Claude** models and **GLM 4.7** are the only ones leaning slightly Authoritarian (positive Social score).
- **Gemini** models are the most neutral (hovering around 0). In fact, they are impressively neutral.

Full scores:

| Model                         | Economic | Social |
| :---------------------------- | :------- | :----- |
| amazon/nova-pro-v1            | -6       | -1     |
| anthropic/claude-haiku-4.5    | -6       | 1      |
| anthropic/claude-opus-4.1     | -5       | 1      |
| anthropic/claude-opus-4.5     | -4       | 1      |
| anthropic/claude-sonnet-4.5   | -4       | -1     |
| deepseek/deepseek-v3.2-exp    | -5       | -1     |
| google/gemini-2.5-pro         | -2       | -1     |
| google/gemini-3-flash-preview | 0        | -1     |
| google/gemini-3-pro-preview   | 1        | -1     |
| meta-llama/llama-4-maverick   | -6       | -3     |
| moonshotai/kimi-k2-thinking   | -9       | -6     |
| openai/gpt-4o                 | -9       | -6     |
| openai/gpt-5                  | -7       | -3     |
| openai/gpt-5-mini             | -7       | -2     |
| openai/gpt-5.1                | -4       | 0      |
| openai/gpt-5.2                | -6       | -1     |
| openai/o3                     | -5       | -2     |
| qwen/qwen3-235b-a22b-2507     | -6       | 0      |
| qwen/qwen3-max                | -8       | -2     |
| x-ai/grok-4                   | -2       | 0      |
| x-ai/grok-4-fast              | -4       | -1     |
| x-ai/grok-4.1-fast            | 4        | -2     |
| z-ai/glm-4.6                  | -6       | -1     |
| z-ai/glm-4.7                  | -3       | 1      |

The entire experiment cost nearly exactly **$1** worth of OpenRouter credits.

## Special Thanks

- [OpenRouter](https://openrouter.ai/)
- [LMArena](https://lmarena.ai/)
