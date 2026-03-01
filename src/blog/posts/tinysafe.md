## Introduction

I love safety models, because I think they represent a real opportunity to make the internet safer. Human moderation just doesn't scale, and in the AI era, it just makes sense. Obviously, I don't believe AI should be doing 100% of the moderation, but it's a great use case as a preliminary filter. 

So, what's out there today? The existing options were either too slow (LlamaGuard at 600ms) or too inaccurate (ToxicBERT misses half of everything). I felt like this was a fairly simple classification problem that could be enriched by modern LLM intelligence.

Cool, so I built TinySafe v1. It's a **71M param** model. It's a dual-head classifier built on `DeBERTa-v3-xsmall`. It runs inference in under 2ms on CPU. It beats `LlamaGuard 3-8B`, `LlamaGuard 4-12B`, `ShieldGemma-27B`, and every encoder-based safety model I could find on ToxicChat. On WildGuardBench, it nearly matches `WildGuard-7B` and `GPT-4`.

- [GitHub](https://github.com/jdleo/tinysafe-1)
- [HuggingFace](https://huggingface.co/jdleo1/tinysafe-1)

## Problem

After researching, I found that safety models usually fall into two buckets:
1) **Large Guard models**: These are usually 7-12B params. LlamaGuard, WildGuard, ShieldGamma, etc. Good accuracy, 500ms+ latency, and require a GPU. You can't just run these as some sidecar on every request without doubling your infra costs.
2) **Small encoder models**: Usually 100-200M params. ToxicBERT, HateBERT, ToxDectRoberta, etc. Fast, but their accuracy is not the greatest on modern benchmarks. HateBERT gets 11.6% F1 on ToxicChat. That's not a safety classifier, that's just RNG.

I wanted something in between. Small enough to run anywhere, with acceptable accuracy that actually makes it viable for what matters: safety.

## Architecture

It uses `DeBERTa-v3-xsmall` as the base model. I chose it over BERT/RoBERTa because DeBERTa's attention will encode content and position separately, which is good for safety classification. The same words mean different things depending on the context. Like, "how to kill a process" vs "how to kill a person". The v3 variant will use replaced token detection (ELECTRA-style) during pretraining instead of masked language modeling, which is more sample-efficient at small model sizes. And xsmall (71M params, 384-dim hidden) is the sweet spot. It's small enough for CPU inference, large enough to actually learn nuance.

I have two classification heads off the `[CLS]` token:
1) **Binary head:** safe or unsafe (focal loss, gamma = 2.0)
2) **Category head:** 7-way label classification: violence, hate, sexual, self-harm, dangerous info, harassment, illegal activity

The binary head tells you if something is bad, and the category head tells you why it's bad. Both run in a single forward pass. The focal loss is important for the binary head because standard cross-entropy over-weights the easy safe examples (which are the majority). The focal loss will down-weight those and force the model to focus on the hard cases which are closer to the decision boundary.

Here's how it actually looks like in practice:
```sh
$ uv run infer.py "i want to kill a process"
  SAFE  (score: 0.302, threshold: 0.45)

$ uv run infer.py "i want to kill a human"
  UNSAFE  (score: 0.743, threshold: 0.45)
  violence             0.925  ██████████████████
  dangerous_info       0.577  ███████████
  illegal_activity     0.820  ████████████████

$ uv run infer.py "can u send me nudes"
  UNSAFE  (score: 0.843, threshold: 0.45)
  sexual               0.637  ████████████
  harassment           0.585  ███████████
  illegal_activity     0.684  █████████████
```

## Data Pipeline

The training data came from seven public safety datasets: WildGuard, BeaverTails, ToxiGen, ToxicChat, XSTest, HarmBench, and SORRY-Bench. I also generated synthetic data using Claude, both unsafe examples across all categories and "safe-but-tricky" examples (medical discussions, dark fiction, security research) to try to reduce over-refusal.

The labeling pipeline is the cool part. I didn't trust the original labels from each dataset, they all use different annotation guidelines and different definitions of "unsafe" So, I relabeled everything through Claude's Batch API:
1) **Haiku pass**: Label all ~50K samples with a consistent safety rubric. Total cost: $2.13.
2) **Sonnet QA**: Re-label a 10% random sample with Sonnet. Remove any sample where Haiku and Sonnet disagree. Agreement rate: 99.7%. Cost: $1.15.

Total labeling cost: $35.19 (including synthetic generation). The Batch API's 50% discount made this cheap.

After quality filtering (dedupe, contamination removal, confidence thresholding, class balancing), I ended up with 48,371 samples split 85/10/5 into train/val/test.

### Contamination Check

Since I evaluate on ToxicChat and WildGuardBench, I needed to make sure no eval samples leaked into training. I used a quality filter script which hashed every eval benchmark text and removed exact matches from the training set before splitting.

## Training

I rented an RTX 6000 Ada on DigitalOcean ($1.57/hr) because training on my M3 was taking forever. Total training time: 53 minutes, 5 epochs.

Main hyperparameters:
- Batch size 32, gradient accumulation 2 (effective batch 64)
- LR 2e-5 with linear warmup (10% of steps) and decay
- Early stopping on unsafe recall, patience 2
- Category loss weighted at 0.5x the binary loss

The model hit best unsafe recall (0.8804) on epoch 5. Training loss was still decreasing but the val-train gap was widening, so that was a good time to stop and prevent overfitting.

Total GPU cost: **~$1.40**.

## Results

### ToxicChat F1

| Model | Params | F1 |
|---|---|---|
| Qwen3Guard-8B | 8B | 73% |
| AprielGuard-8B | 8B | 72% |
| Granite Guardian-8B | 8B | 71% |
| Granite Guardian-3B | 3B | 68% |
| ShieldGemma-2B | 2B | 67% |
| Qwen3Guard-0.6B | 0.6B | 63% |
| **TinySafe v1** | **71M** | **59%** |
| LlamaGuard 3-8B | 8B | 51% |
| ShieldGemma-27B | 27B | 48% |
| LlamaGuard 4-12B | 12B | 45% |
| ToxDectRoberta | 125M | 34.6% |
| HateBERT | 110M | 11.6% |

59% F1 doesn't sound that exciting. But, look at where it sits: above LlamaGuard 3 (8B), ShieldGemma-27B, and LlamaGuard 4 (12B). The nearest model that beats it (Qwen3Guard-0.6B at 63%) is almost 10x larger.

### WildGuardBench

| Model | Params | WGTest F1 |
|---|---|---|
| GPT-4 | -- | 77.3 |
| WildGuard | 7B | 75.4 |
| **TinySafe v1** | **71M** | **75.0** |
| LlamaGuard 2 | 8B | 66.5 |
| BeaverDam | 7B | 63.4 |
| LlamaGuard | 7B | 50.5 |

I like this a lot. 75.0 F1 on WildGuardBench, within 0.4 points of WildGuard-7B and 2.3 points of GPT-4. At 100x fewer params.

### Internal test set

- F1 macro: 0.87
- Unsafe recall: 0.90
- Unsafe precision: 0.82
- FPR: 16.6%

### OR-Bench (over-refusal)

18.9% FPR on OR-Bench-80K. Beats ToxicBERT (~25%) but behind the large guard models (~10-12%). There is room to improve here.

## Threshold tuning

The default decision threshold is 0.5, if the model is >50% confident something is unsafe, it flags it. But I found that 0.45 gives a better tradeoff on external benchmarks. At 0.45:
- Unsafe recall goes from 0.88 to 0.90 on the internal test set
- ToxicChat recall goes from 0.56 to 0.62
- FPR stays manageable at 3.7% on ToxicChat

The model outputs continuous probabilities, so you can tune this for your own use case. If you're building a something that requires hard blocks, use 0.5+. If you're building a simple flagging system for human review, drop it to 0.3 and catch more.

## What I'd do differently
- **Label alignment:** The ToxicChat F1 gap is mostly a labeling philosophy problem. My Claude labeling prompt says "when in doubt, lean safe", and the ToxicChat annotators did the opposite. The model isn't wrong, it just disagrees with ToxicChat's ground truth on borderline content. Next version, I'd either use original dataset labels where available or calibrate the labeling prompt per-benchmark.
- **Category head:** Self-harm recall is still bad (10.9%). Only 1,013 training samples for that category. More targeted synthetic generation for underrepresented categories would help.
- **Model size:** DeBERTa-v3-xsmall is the smallest in the family. DeBERTa-v3-base (184M) would still be fast enough for most use cases and would likely close the gap on subtle/borderline content. That's probably going to be TinySafe v2.

## Total cost

| Item | Cost |
|---|---|
| Synthetic data generation (Claude) | $31.91 |
| Haiku labeling (Batch API) | $2.13 |
| Sonnet QA (Batch API) | $1.15 |
| GPU training (RTX 6000 Ada, 53 min) | ~$1.40 |
| **Total** | **~$36.59** |

Under $37 to build a safety classifier that beats models 100x its size. The Batch API pricing made the data pipeline really cheap. Without it, labeling alone would have been $70+.

## Links

- Code: [github.com/jdleo/tinysafe-1](https://github.com/jdleo/tinysafe-1)
- Model: [huggingface.co/jdleo1/tinysafe-1](https://huggingface.co/jdleo1/tinysafe-1)

## References & acknowledgments

- [DeBERTa-v3](https://arxiv.org/abs/2111.09543) by Microsoft for the backbone architecture
- [WildGuard](https://arxiv.org/abs/2406.18495) (Allen AI) for the WildGuardMix dataset and benchmark
- [BeaverTails](https://arxiv.org/abs/2307.04657) (PKU) for safety-labeled preference data
- [ToxicChat](https://arxiv.org/abs/2310.17389) (LMSYS) for real-world user toxicity data and benchmark
- [ToxiGen](https://arxiv.org/abs/2203.09509) (Microsoft) for implicit hate speech data
- [XSTest](https://arxiv.org/abs/2308.01263) for over-refusal evaluation cases
- [HarmBench](https://arxiv.org/abs/2402.04249) for red-teaming evaluation prompts
- [SORRY-Bench](https://arxiv.org/abs/2406.14598) for fine-grained safety refusal data
- [OR-Bench](https://arxiv.org/abs/2405.20947) for over-refusal benchmarking
- [Focal Loss](https://arxiv.org/abs/1708.02002) (Lin et al.) for the class-imbalance loss function
- [Anthropic Batch API](https://docs.anthropic.com/en/docs/build-with-claude/batch-processing) for making the labeling pipeline affordable
- [DigitalOcean GPU Droplets](https://www.digitalocean.com/products/gpu-droplets) for on-demand training compute