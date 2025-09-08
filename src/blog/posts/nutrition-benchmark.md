# The Nutrition Prediction Benchmark: Testing LLMs on Google Cafeteria Menus

Can AI language models accurately predict the nutritional content of food just from ingredient lists? I created a simple benchmark to find out, testing models on real Google cafeteria dishes with surprising results.

**Why does this matter?** This benchmark tests something practical and important: whether AI models truly understand the relationship between food ingredients and their nutritional properties. It's not just about memorizing nutrition facts - it requires understanding portion sizes, cooking methods, and how different ingredients contribute to overall nutritional content.

## The Experiment

The setup was straightforward. Using the [Nutrition5k dataset](https://github.com/google-research-datasets/Nutrition5k) from Google Research, I selected 10 random dishes from their cafeteria menus and asked 4 different AI models to:

> Predict the exact nutritional content (calories, protein, carbs, fat) based solely on ingredient lists.

I used Google's dataset because it provides ground truth nutritional values measured through comprehensive analysis. Each dish was filtered to have at least 3 ingredients and 100+ calories to ensure meaningful complexity. To ensure reliability, I used the same 10 dishes across all models for direct comparison.

Here's my evaluation approach:

```python
prompt = f"""You are a nutrition expert API which will take a list of ingredients and output the following format:
{{"calories": <answer>, "protein": <answer>, "carbs": <answer>, "fat": <answer>}}
You will respond with no other text. Your response must be json parsable.

Ingredients: {ingredients}
"""

# Calculate Mean Absolute Percentage Error (MAPE) for each nutrition field
for field in ["calories", "protein", "carbs", "fat"]:
    error = abs(predicted[field] - actual[field])
    mape = (error / actual[field] * 100) if actual[field] > 0 else 0

# Overall score: accuracy (60%) + correlation (40%)
accuracy_score = 100 / (1 + avg_mape)
correlation_score = avg_correlation * 100
overall_score = accuracy_score * 0.6 + correlation_score * 0.4
```

The entire experiment cost **$2.65** using [OpenRouter](https://openrouter.ai/) for model calls and parallel execution to speed up testing across 50 different models.

## The Results

The results revealed significant differences in nutritional understanding across models:

### The Full Leaderboard (tested on 10 dishes, 50 models, higher overall score = better)

| Rank | Model                                      | Overall Score | Avg MAPE | Correlation | Cost    |
| ---- | ------------------------------------------ | ------------- | -------- | ----------- | ------- |
| 1    | `deepseek/deepseek-r1-0528`                | 42.3          | 12.3%    | 0.944       | $0.1341 |
| 2    | `openai/gpt-oss-120b`                      | 42.1          | 12.8%    | 0.944       | $0.0155 |
| 3    | `openai/gpt-5-mini`                        | 41.7          | 13.9%    | 0.943       | $0.0537 |
| 4    | `google/gemini-2.5-pro`                    | 41.2          | 15.8%    | 0.941       | $0.3682 |
| 5    | `openai/o4-mini`                           | 40.7          | 17.8%    | 0.938       | $0.1175 |
| 6    | `openai/o3`                                | 40.6          | 18.6%    | 0.940       | $0.2075 |
| 7    | `openai/gpt-5`                             | 40.0          | 21.8%    | 0.934       | $0.4361 |
| 8    | `qwen/qwen3-235b-a22b-thinking-2507`       | 39.8          | 20.4%    | 0.925       | $0.0214 |
| 9    | `openai/gpt-5-nano`                        | 39.6          | 20.0%    | 0.918       | $0.0186 |
| 10   | `openai/gpt-oss-20b`                       | 39.5          | 19.8%    | 0.916       | $0.0039 |
| 11   | `openai/gpt-4o-2024-11-20`                 | 39.3          | 30.4%    | 0.935       | $0.0071 |
| 12   | `x-ai/grok-3-mini`                         | 39.2          | 23.5%    | 0.919       | $0.1159 |
| 13   | `openai/gpt-4.1-mini`                      | 38.2          | 27.4%    | 0.903       | $0.0011 |
| 14   | `openai/gpt-5-chat`                        | 38.0          | 25.2%    | 0.893       | $0.0049 |
| 15   | `google/gemini-2.0-flash-001`              | 37.8          | 25.1%    | 0.887       | $0.0003 |
| 16   | `openai/gpt-4.1`                           | 37.6          | 32.0%    | 0.894       | $0.0054 |
| 17   | `x-ai/grok-4`                              | 37.5          | 22.3%    | 0.874       | $0.7182 |
| 18   | `openai/gpt-4o`                            | 37.3          | 25.6%    | 0.875       | $0.0071 |
| 19   | `qwen/qwen3-235b-a22b-2507`                | 36.5          | 34.6%    | 0.870       | $0.0015 |
| 20   | `qwen/qwen3-30b-a3b`                       | 36.4          | 23.0%    | 0.848       | $0.0167 |
| 21   | `z-ai/glm-4.5`                             | 35.9          | 26.9%    | 0.843       | $0.0674 |
| 22   | `anthropic/claude-opus-4.1`                | 35.6          | 35.5%    | 0.850       | $0.0477 |
| 23   | `mistralai/mistral-medium-3.1`             | 35.5          | 53.8%    | 0.860       | $0.0016 |
| 24   | `openai/chatgpt-4o-latest`                 | 35.3          | 30.2%    | 0.835       | $0.0137 |
| 25   | `mistralai/mistral-large-2411`             | 34.8          | 42.7%    | 0.835       | $0.0067 |
| 26   | `anthropic/claude-opus-4`                  | 34.7          | 36.9%    | 0.829       | $0.0481 |
| 27   | `anthropic/claude-3.5-sonnet`              | 33.2          | 51.1%    | 0.801       | $0.0100 |
| 28   | `minimax/minimax-m1`                       | 32.8          | 30.9%    | 0.772       | $0.1335 |
| 29   | `anthropic/claude-3.5-haiku`               | 32.8          | 49.5%    | 0.789       | $0.0026 |
| 30   | `moonshotai/kimi-k2`                       | 32.7          | 35.6%    | 0.776       | $0.0028 |
| 31   | `tencent/hunyuan-a13b-instruct`            | 32.0          | 39.5%    | 0.764       | $0.0014 |
| 32   | `deepseek/deepseek-chat-v3-0324`           | 31.8          | 60.9%    | 0.772       | $0.0018 |
| 33   | `x-ai/grok-3`                              | 31.7          | 37.5%    | 0.753       | $0.0134 |
| 34   | `anthropic/claude-sonnet-4`                | 31.4          | 50.0%    | 0.756       | $0.0095 |
| 35   | `meta-llama/llama-3.3-70b-instruct`        | 31.4          | 70.3%    | 0.764       | $0.0018 |
| 36   | `anthropic/claude-3.7-sonnet`              | 31.0          | 53.4%    | 0.747       | $0.0094 |
| 37   | `microsoft/mai-ds-r1`                      | 30.4          | 31.0%    | 0.713       | $0.0128 |
| 38   | `google/gemini-2.5-flash`                  | 30.2          | 66.7%    | 0.733       | $0.0012 |
| 39   | `nousresearch/hermes-3-llama-3.1-70b`      | 30.2          | 50.9%    | 0.725       | $0.0003 |
| 40   | `mistralai/mistral-small-3.2-24b-instruct` | 29.3          | 37.3%    | 0.693       | $0.0009 |
| 41   | `meta-llama/llama-4-maverick`              | 28.7          | 50.6%    | 0.689       | $0.0005 |
| 42   | `microsoft/phi-4-reasoning-plus`           | 27.5          | 114.7%   | 0.675       | $0.0016 |
| 43   | `amazon/nova-pro-v1`                       | 27.2          | 117.9%   | 0.667       | $0.0025 |
| 44   | `mistralai/mistral-nemo`                   | 26.8          | 71.3%    | 0.648       | $0.0001 |
| 45   | `amazon/nova-micro-v1`                     | 25.1          | 97.7%    | 0.613       | $0.0001 |
| 46   | `openai/gpt-3.5-turbo`                     | 24.7          | 106.7%   | 0.604       | $0.0013 |
| 47   | `inception/mercury`                        | 24.1          | 95.6%    | 0.586       | $0.0005 |
| 48   | `meta-llama/llama-4-scout`                 | 23.1          | 104.3%   | 0.562       | $0.0003 |
| 49   | `liquid/lfm-7b`                            | 22.1          | 131.6%   | 0.541       | $0.0000 |
| 50   | `amazon/nova-lite-v1`                      | 20.4          | 250.4%   | 0.504       | $0.0002 |

### Detailed Performance Breakdown

**The clear winner** is `deepseek/deepseek-r1-0528`, narrowly edging out the competition with an overall score of 42.3 and exceptional accuracy, particularly for calories:

-   **Calories**: 5.9% MAPE (exceptional)
-   **Protein**: 13.1% MAPE (very good)
-   **Carbs**: 14.1% MAPE (good)
-   **Fat**: 16.1% MAPE (good)
-   **Correlation**: 0.944 (outstanding)

**Close second place** goes to `openai/gpt-oss-120b` with a score of 42.1, showing balanced performance across all nutrition fields:

-   **Calories**: 12.8% MAPE (excellent)
-   **Protein**: 15.8% MAPE (very good)
-   **Carbs**: 11.9% MAPE (excellent)
-   **Fat**: 10.8% MAPE (excellent)
-   **Correlation**: 0.944 (outstanding)

**Strong third place** is `openai/gpt-5-mini` with a score of 41.7, demonstrating impressive capability for a "mini" model:

-   **Calories**: 7.8% MAPE (excellent)
-   **Protein**: 12.5% MAPE (very good)
-   **Carbs**: 20.1% MAPE (acceptable)
-   **Fat**: 15.3% MAPE (good)
-   **Correlation**: 0.943 (outstanding)

**Google's flagship** `google/gemini-2.5-pro` takes fourth place with a score of 41.2, showing solid performance but struggling with carbs:

-   **Calories**: 7.7% MAPE (excellent)
-   **Protein**: 13.1% MAPE (very good)
-   **Carbs**: 25.0% MAPE (concerning)
-   **Fat**: 17.3% MAPE (good)
-   **Correlation**: 0.941 (outstanding)

## What This Reveals About AI Models

### 1. **Specialized Knowledge vs. General Intelligence**

The results reveal fascinating disconnects from general performance rankings. `deepseek/deepseek-r1-0528` dominated despite being less prominent than flagship models like `openai/gpt-5` or `anthropic/claude-opus-4.1` (which ranked 22nd). Meanwhile, the compact `openai/gpt-5-mini` outperformed the full `openai/gpt-5`, and several Chinese models showed exceptional nutritional reasoning. This suggests that nutritional prediction requires specific knowledge about food science that doesn't correlate with general language capabilities.

### 2. **The Carbohydrate Challenge**

A striking pattern emerged across the 50 models: carbohydrate prediction was consistently the most challenging nutrition field. Even top performers like `google/gemini-2.5-pro` showed 25.0% MAPE for carbs while achieving 7.7% for calories. Several Claude models exhibited catastrophic carb prediction failures, with `anthropic/claude-3.5-haiku` reaching 114.4% MAPE for carbs while maintaining reasonable performance on other nutrients.

This carbohydrate challenge is particularly interesting because:

-   Carbs often come from multiple sources in complex dishes
-   Cooking methods significantly affect carbohydrate content (starch gelatinization, etc.)
-   Portion estimation is critical for accuracy
-   Complex carbohydrates vs. simple sugars require nuanced understanding

The fact that even sophisticated models consistently struggle with carbs suggests this requires deeper understanding of food chemistry and preparation methods than other macronutrients.

### 3. **Cost-Performance Efficiency**

The cost-performance analysis reveals striking insights across 50 models. `google/gemini-2.0-flash-001` achieved 15th place at just $0.0003 - incredible value. Meanwhile, the winner `deepseek/deepseek-r1-0528` cost $0.1341, while second-place `openai/gpt-oss-120b` cost only $0.0155 for nearly identical performance. The most expensive model, `x-ai/grok-4` at $0.7182, ranked a disappointing 17th, highlighting that higher cost doesn't guarantee better nutritional reasoning.

### 4. **Consistency in Nutritional Reasoning**

Models that performed well showed consistent accuracy across all nutrition fields, while struggling models had erratic performance. This suggests that effective nutritional prediction requires systematic understanding rather than field-specific memorization.

## The Methodology's Strengths and Limitations

### Strengths:

1. **Real-world applicability**: Uses actual Google cafeteria dishes with measured nutritional values
2. **Cost-effective**: Entire benchmark runs for under 3 dollars
3. **Comprehensive evaluation**: Tests multiple nutrition dimensions and includes correlation analysis
4. **Reproducible**: Fixed seed ensures consistent dish selection across models

### Limitations:

1. **Limited sample size**: Only 10 dishes, though carefully selected for complexity
2. **Ingredient-only input**: Doesn't include portion sizes, cooking methods, or visual information
3. **English-only**: Tests only English ingredient descriptions
4. **Single domain**: Focused on cafeteria-style prepared foods

## Future Research Directions

This benchmark could be expanded in several compelling ways:

-   **Multi-modal input**: Include food images alongside ingredient lists to test visual nutritional reasoning
-   **Portion awareness**: Test models' ability to adjust predictions based on serving size information
-   **Cooking method sensitivity**: Evaluate how well models account for preparation techniques (grilled vs. fried)
-   **Cultural cuisine diversity**: Extend beyond American cafeteria food to international dishes
-   **Macro vs. micro nutrients**: Test prediction of vitamins, minerals, and other micronutrients
-   **Temporal consistency**: Run the same benchmark over time to track model improvements

## The Practical Implications

Unlike more abstract benchmarks, nutrition prediction has immediate real-world applications:

-   **Health apps**: Accurate nutrition tracking from photos or ingredient lists
-   **Food service**: Automated nutritional labeling for restaurants and cafeterias
-   **Medical applications**: Dietary planning for patients with specific nutritional needs
-   **Food development**: Optimizing recipes for target nutritional profiles

The fact that `deepseek-r1-0528` achieved 12.3% average MAPE (87.7% accuracy) suggests we're approaching the threshold where AI nutrition prediction could be practically useful for many applications.

## A Note on Dataset Quality

Using Google's Nutrition5k dataset provides high-quality ground truth, but it's worth noting that:

1. **Measurement precision**: The dataset uses sophisticated analysis techniques, making it more reliable than self-reported or estimated nutritional data
2. **Domain specificity**: Google cafeteria dishes may not represent broader food categories
3. **Temporal stability**: Nutritional content can vary based on ingredient sources, seasonality, and preparation variations

## The Broader Point

This experiment reinforces a key insight: **specialized benchmarks can reveal capabilities that general performance metrics miss**.

While `anthropic/claude-opus-4.1` might excel at reasoning tasks or creative writing, it ranks 22nd here, struggling with the specific domain knowledge required for nutritional prediction. Conversely, `deepseek/deepseek-r1-0528`'s dominance suggests it has internalized food science relationships that don't necessarily translate to other domains.

The $2.65 cost of testing 50 models makes this benchmark feasible to run regularly, tracking how models improve on practical, domain-specific reasoning over time. As AI systems become more capable, we need more benchmarks like this that test real-world applications rather than abstract reasoning abilities.

The fact that we can achieve 87.7% accuracy (100% - 12.3% MAPE) on nutritional prediction from ingredient lists alone suggests we're closer to practical AI nutrition applications than many might expect.
