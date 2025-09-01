# The Semantic Diversity Benchmark: A New Way to Test AI Language Models

I created a simple but powerful benchmark for testing AI language models that I'm calling "semantic diversity." The concept is straightforward: ask models to generate words that are maximally semantically unrelated to each other, then measure how well they actually did.

**Why does this matter?** This benchmark tests something fundamental about language models - their ability to understand and navigate semantic space in a sophisticated way. It's not just about generating diverse words; it's about understanding the deep relationships between concepts and deliberately avoiding them.

## The Experiment

The setup was dead simple. I asked 35 different AI models to:

> Generate exactly 20 English words that are maximally semantically unrelated to each other.

Then I used OpenAI's `text-embedding-3-large` model to calculate the semantic similarity between every pair of words and averaged the scores. To ensure reliability, I ran each model **3 times** and calculated both the mean performance and consistency across runs. Lower scores mean better performance - the model succeeded in finding truly unrelated words.

Here's the core of my evaluation code:

```python
import openai
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def get_embedding(text, model="text-embedding-3-large"):
    """Get embedding for text using OpenAI's text-embedding-3-large model"""
    response = openai.embeddings.create(input=text.lower().strip(), model=model)
    return response.data[0].embedding

def eq(word1, word2):
    """Calculate cosine similarity between two words"""
    embedding1 = get_embedding(word1)
    embedding2 = get_embedding(word2)

    emb1 = np.array(embedding1).reshape(1, -1)
    emb2 = np.array(embedding2).reshape(1, -1)

    similarity = cosine_similarity(emb1, emb2)[0][0]
    return max(similarity, 0)  # Ensure non-negative

# For each model's 20 words, calculate all pairwise similarities
scores = []
for i in range(len(words)):
    for j in range(i + 1, len(words)):
        scores.append(eq(words[i], words[j]))

average_score = sum(scores) / len(scores)
```

The entire experiment cost less than 30 cents using [OpenRouter](https://openrouter.ai/) for model calls and [OpenAI](https://openai.com/api/) for embeddings.

## The Results

The results were fascinating and revealed some surprising patterns:

### The Full Leaderboard (3 runs per model, lower = better)

| Rank | Model                                | Mean±Std     | Best  |
| ---- | ------------------------------------ | ------------ | ----- |
| 1    | `google/gemini-2.5-pro`              | 0.210±0.006  | 0.204 |
| 2    | `moonshotai/kimi-k2`                 | 0.232±0.005  | 0.225 |
| 3    | `qwen/qwen3-235b-a22b-2507`          | 0.236±0.007  | 0.228 |
| 4    | `anthropic/claude-opus-4.1`          | 0.237±0.005  | 0.229 |
| 5    | `openai/o4-mini`                     | 0.237±0.012  | 0.220 |
| 6    | `qwen/qwen3-235b-a22b-thinking-2507` | 0.237±0.007  | 0.228 |
| 7    | `deepseek/deepseek-chat-v3-0324`     | 0.240±0.002  | 0.238 |
| 8    | `anthropic/claude-sonnet-4`          | 0.244±0.007  | 0.235 |
| 9    | `openai/gpt-5-chat`                  | 0.244±0.001  | 0.243 |
| 10   | `deepseek/deepseek-r1-0528`          | 0.245±0.009  | 0.234 |
| 11   | `meta-llama/llama-4-maverick`        | 0.245±0.007  | 0.238 |
| 12   | `openai/chatgpt-4o-latest`           | 0.246±0.002  | 0.244 |
| 13   | `openai/gpt-5-nano`                  | 0.246±0.008  | 0.238 |
| 14   | `anthropic/claude-3.5-haiku`         | 0.246±0.001  | 0.245 |
| 15   | `openai/gpt-4.1`                     | 0.246±0.004  | 0.241 |
| 16   | `openai/gpt-4o`                      | 0.247±0.005  | 0.242 |
| 17   | `x-ai/grok-3`                        | 0.247±0.004  | 0.243 |
| 18   | `openai/gpt-oss-120b`                | 0.252±0.000  | 0.252 |
| 19   | `x-ai/grok-4`                        | 0.252±0.016  | 0.233 |
| 20   | `openai/gpt-oss-20b`                 | 0.253±0.008  | 0.247 |
| 21   | `mistralai/mistral-large-2411`       | 0.254±0.004  | 0.250 |
| 22   | `openai/gpt-4.1-mini`                | 0.256±0.004  | 0.252 |
| 23   | `anthropic/claude-3.7-sonnet`        | 0.257±0.005  | 0.251 |
| 24   | `z-ai/glm-4.5`                       | 0.258±0.012  | 0.242 |
| 25   | `amazon/nova-pro-v1`                 | 0.258±0.019  | 0.232 |
| 26   | `google/gemini-2.5-flash`            | 0.268±0.005  | 0.263 |
| 27   | `x-ai/grok-3-mini`                   | 0.273±0.010  | 0.264 |
| 28   | `qwen/qwen3-30b-a3b`                 | 0.280±0.008  | 0.271 |
| 29   | `openai/gpt-4o-2024-11-20`           | 0.285±0.039  | 0.256 |
| 30   | `amazon/nova-lite-v1`                | 0.290±0.000  | 0.290 |
| 31   | `meta-llama/llama-4-scout`           | 0.336±0.000  | 0.336 |
| 32   | `openai/gpt-3.5-turbo`               | 0.369±0.009  | 0.356 |
| 33   | `mistralai/mistral-nemo`             | DISQUALIFIED | DQ    |
| 34   | `amazon/nova-micro-v1`               | DISQUALIFIED | DQ    |
| 35   | `inception/mercury`                  | DISQUALIFIED | DQ    |

### Notable Observations

**The clear winner** is `google/gemini-2.5-pro`, which dominated the leaderboard with a score of 0.210±0.006 and excellent consistency. Google's latest model demonstrates exceptional semantic understanding. Its best run generated: _kettle, justice, gargle, sonorous, quark, nostalgia, asphalt, meander, ambiguous, integer, spleen, etiquette, jettison, horizon, fungus, yesterday, theory, dwindle, velvet, coupon_

**Strong performers** include several Chinese models: `moonshotai/kimi-k2` (2nd place) and both Qwen variants in the top 6. These models demonstrated sophisticated understanding of semantic diversity, with `deepseek/deepseek-chat-v3-0324` also performing well at 7th place.

**The surprising mid-tier performance** of many flagship models is interesting. `anthropic/claude-sonnet-4` ranked 8th with a score of 0.244, while `openai/gpt-4o` landed at 16th with 0.247.

**The catastrophic failures** include `meta-llama/llama-4-scout` (0.336) and `openai/gpt-3.5-turbo` (0.369), which struggled significantly with the task.

**Three models disqualified**: `mistralai/mistral-nemo`, `amazon/nova-micro-v1`, and `inception/mercury` all failed to generate exactly 20 words across all 3 runs, failing to follow the basic instruction consistently.

## What This Reveals About AI Models

### 1. **Task Understanding vs Execution**

Some models clearly understood they needed to be strategic about semantic diversity, while others seemed to generate random words without considering relationships. The successful models appeared to think systematically about different conceptual domains.

### 2. **Size Isn't Everything**

Some smaller or less well-known models outperformed flagship models from major companies. This suggests that performance on this task isn't simply correlated with model size or training budget.

### 3. **The Reasoning Gap**

The models that performed well likely have better internal representations of semantic relationships and can reason about them more effectively. Models that can actually reason about the task perform better than those that just pattern match.

### 4. **Consistency Matters**

With multiple runs per model, we can now see both performance consistency and reliability. Some models like `openai/gpt-oss-120b` and `meta-llama/llama-4-maverick` showed perfect consistency (±0.000), while others like `x-ai/grok-4` had high variance (±0.021) despite occasionally achieving good scores. The best models maintained semantic diversity not just within their word lists, but across multiple attempts.

## Why This Benchmark Matters

Traditional benchmarks often test knowledge retrieval, reasoning, or specific skills. But semantic diversity tests something more fundamental: **does the model truly understand the structure of meaning itself?**

This has practical implications:

-   **Creative writing**: Models that understand semantic diversity can generate more varied and interesting content
-   **Search and retrieval**: Better semantic understanding leads to better search results
-   **Reasoning tasks**: Models that can navigate semantic space effectively are likely better at complex reasoning

## The Methodology's Limitations

I should acknowledge this benchmark's limitations:

1. **OpenAI embeddings**: I'm using OpenAI's `text-embedding-3-large` as ground truth, which adds both cost and dependency on a specific embedding model
2. **Limited sample size**: While 3 runs per model provides better reliability than single attempts, larger sample sizes would give even more robust statistics
3. **English-only**: This only tests English semantic understanding
4. **Word-level**: This doesn't test semantic diversity in longer text generation

## Future Research Directions

This benchmark could be expanded in several interesting ways:

-   Test with different embedding models (spaCy, Sentence-BERT, etc.) to validate results against OpenAI embeddings
-   Try different prompt variations to see if performance rankings are consistent
-   Extend to semantic diversity in paragraph-length text generation
-   Develop more comprehensive scoring systems that account for different types of semantic relationships
-   Create multilingual versions to test cross-language semantic understanding
-   Investigate whether performance correlates with other reasoning benchmarks

## Comparison with General Performance Rankings

Interestingly, the semantic diversity results show both alignment and divergence with general performance rankings from [LMArena's leaderboard](https://lmarena.ai/leaderboard/text). Some key observations:

**Strong correlations**: Google's `gemini-2.5-pro` ranks #1 on both benchmarks, suggesting its semantic understanding translates to general performance excellence. Similarly, several top performers like `kimi-k2`, `deepseek-r1-0528`, and various Qwen models rank highly on both lists.

**Specialized vs. general intelligence**: This suggests that semantic diversity represents a specific cognitive skill that doesn't always correlate with overall model capability. Some models excel at general tasks but struggle with the precise semantic reasoning required for this benchmark.

## A Note on Embedding Models

The choice of embedding model fundamentally affects evaluation outcomes. Using OpenAI's `text-embedding-3-large` provides more sophisticated semantic understanding compared to simpler approaches. This suggests that:

1. **Embedding quality matters**: More sophisticated embedding models may provide more nuanced semantic understanding
2. **Evaluation robustness**: Any benchmark should be tested across multiple embedding approaches to ensure consistent insights
3. **Model-embedding alignment**: Some AI models may be better aligned with certain embedding spaces than others

## The Broader Point

This experiment reinforces something I've been thinking about a lot: **we need better ways to evaluate what AI models actually understand**.

Traditional benchmarks often measure performance on human-designed tasks, but they don't always reveal the underlying capabilities or limitations of the models. Simple experiments like this semantic diversity test can reveal surprising insights about how different models process and understand language.

The fact that a sub-dollar experiment (running 3 trials across 35 models) could reveal such clear performance differences and consistency patterns suggests we're in the early days of understanding what these systems can and can't do.
