# The Semantic Diversity Benchmark: A New Way to Test AI Language Models

I created a simple but powerful benchmark for testing AI language models that I'm calling "semantic diversity." The concept is straightforward: ask models to generate words that are maximally semantically unrelated to each other, then measure how well they actually did.

**Why does this matter?** This benchmark tests something fundamental about language models - their ability to understand and navigate semantic space in a sophisticated way. It's not just about generating diverse words; it's about understanding the deep relationships between concepts and deliberately avoiding them.

## The Experiment

The setup was dead simple. I asked 33 different AI models to:

> Generate exactly 20 English words that are maximally semantically unrelated to each other.

Then I used spaCy's word embeddings to calculate the semantic similarity between every pair of words and averaged the scores. Lower scores mean better performance - the model succeeded in finding truly unrelated words.

Here's the core of my evaluation code:

```python
import spacy
import numpy as np

nlp = spacy.load("en_core_web_md")

def eq(word1, word2):
    return max(nlp(word1).similarity(nlp(word2)), 0)

# For each model's 20 words, calculate all pairwise similarities
scores = []
for i in range(len(words)):
    for j in range(i + 1, len(words)):
        scores.append(eq(words[i], words[j]))

average_score = sum(scores) / len(scores)
```

The entire experiment cost less than 20 cents using [OpenRouter](https://openrouter.ai/).

## The Results

The results were fascinating and revealed some surprising patterns:

### The Full Leaderboard (Lower = Better)

| Rank | Model                              | Avg Score |
| ---- | ---------------------------------- | --------- |
| 1    | openai/gpt-oss-120b                | 0.097     |
| 2    | x-ai/grok-3                        | 0.103     |
| 3    | qwen/qwen3-235b-a22b-thinking-2507 | 0.107     |
| 4    | mistralai/mistral-large-2411       | 0.110     |
| 5    | meta-llama/llama-4-maverick        | 0.110     |
| 6    | openai/gpt-5-nano                  | 0.110     |
| 7    | openai/o4-mini                     | 0.111     |
| 8    | openai/gpt-4.1                     | 0.112     |
| 9    | anthropic/claude-3.5-haiku         | 0.114     |
| 10   | z-ai/glm-4.5                       | 0.118     |
| 11   | moonshotai/kimi-k2                 | 0.119     |
| 12   | openai/gpt-oss-20b                 | 0.120     |
| 13   | x-ai/grok-4                        | 0.120     |
| 14   | deepseek/deepseek-r1-0528          | 0.121     |
| 15   | google/gemini-2.5-pro              | 0.123     |
| 16   | anthropic/claude-opus-4.1          | 0.129     |
| 17   | openai/gpt-5-chat                  | 0.130     |
| 18   | openai/chatgpt-4o-latest           | 0.131     |
| 19   | anthropic/claude-3.7-sonnet        | 0.133     |
| 20   | anthropic/claude-sonnet-4          | 0.138     |
| 21   | openai/gpt-4.1-mini                | 0.146     |
| 22   | amazon/nova-lite-v1                | 0.149     |
| 23   | amazon/nova-micro-v1               | 0.150     |
| 24   | qwen/qwen3-30b-a3b                 | 0.155     |
| 25   | x-ai/grok-3-mini                   | 0.161     |
| 26   | amazon/nova-pro-v1                 | 0.168     |
| 27   | qwen/qwen3-235b-a22b-2507          | 0.169     |
| 28   | google/gemini-2.5-flash            | 0.170     |
| 29   | meta-llama/llama-4-scout           | 0.635     |
| 30   | deepseek/deepseek-chat-v3-0324     | 0.636     |
| 31   | openai/gpt-4o-2024-11-20           | 0.658     |
| 32   | openai/gpt-3.5-turbo               | 0.709     |

### Notable Observations

**The clear winners** were models that seemed to understand the task required systematic thinking about semantic space. The top models generated words from completely different domains - abstract concepts, concrete objects, emotions, actions, technical terms.

**The surprising failures** included some big names. `anthropic/claude-sonnet-4` ranked 20th with a score of 0.138, and `openai/gpt-4o-2024-11-20` was way down at 31st with 0.658. Even more shocking - `openai/gpt-3.5-turbo` scored 0.709, making it one of the worst performers.

**The catastrophic failures** were models that seemed to completely misunderstand the task. The bottom three models (`meta-llama/llama-4-scout`, `deepseek/deepseek-chat-v3-0324`, and `openai/gpt-4o-2024-11-20`) had scores above 0.6, suggesting they were generating semantically related words instead of diverse ones.

**One model disqualified**: `mistralai/mistral-nemo` generated 21 words instead of 20, failing to follow the simple instruction. Such a basic requirement to get wrong.

## What This Reveals About AI Models

### 1. **Task Understanding vs Execution**

Some models clearly understood they needed to be strategic about semantic diversity, while others seemed to generate random words without considering relationships. The successful models appeared to think systematically about different conceptual domains.

### 2. **Size Isn't Everything**

Some smaller or less well-known models outperformed flagship models from major companies. This suggests that performance on this task isn't simply correlated with model size or training budget.

### 3. **The Reasoning Gap**

The models that performed well likely have better internal representations of semantic relationships and can reason about them more effectively. This aligns with my previous thoughts on [transformer limitations](/blog/transformers-are-limited) - models that can actually reason about the task perform better than those that just pattern match.

### 4. **Consistency Matters**

Looking at the min/max scores, the best models had more consistent performance across all word pairs. They didn't just get lucky with a few very diverse words - they maintained semantic diversity throughout their entire list.

## Why This Benchmark Matters

Traditional benchmarks often test knowledge retrieval, reasoning, or specific skills. But semantic diversity tests something more fundamental: **does the model truly understand the structure of meaning itself?**

This has practical implications:

-   **Creative writing**: Models that understand semantic diversity can generate more varied and interesting content
-   **Search and retrieval**: Better semantic understanding leads to better search results
-   **Reasoning tasks**: Models that can navigate semantic space effectively are likely better at complex reasoning

## The Methodology's Limitations

I should acknowledge this benchmark's limitations:

1. **SpaCy embeddings**: I'm using spaCy's pre-trained embeddings as ground truth, but these aren't perfect
2. **Single trial**: Each model only got one attempt - no averaging across multiple runs
3. **English-only**: This only tests English semantic understanding
4. **Word-level**: This doesn't test semantic diversity in longer text generation

## Future Research Directions

This benchmark could be expanded in several interesting ways:

-   Test with different embedding models (OpenAI, Sentence-BERT, etc.) to validate results
-   Try different prompt variations to see if performance rankings remain consistent
-   Extend to semantic diversity in paragraph-length text generation
-   Develop more comprehensive scoring systems that account for different types of semantic relationships
-   Create multilingual versions to test cross-language semantic understanding
-   Investigate whether performance correlates with other reasoning benchmarks

## The Broader Point

This experiment reinforces something I've been thinking about a lot: **we need better ways to evaluate what AI models actually understand**.

Traditional benchmarks often measure performance on human-designed tasks, but they don't always reveal the underlying capabilities or limitations of the models. Simple experiments like this semantic diversity test can reveal surprising insights about how different models process and understand language.

The fact that a 20-cent experiment could reveal such clear performance differences across 33 models suggests we're still in the early days of understanding what these systems can and can't do.
