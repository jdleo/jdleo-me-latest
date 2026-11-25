// Site data for the jdleo.me static build.
export const SITE = {
  name: 'John Leonardo',
  url: 'https://jdleo.me',
  title: 'John Leonardo - Senior Software Engineer',
  description:
    'Senior Software Engineer specializing in distributed systems, high-scale architectures, and AI services. Experience at Roblox (OS), Amazon (Search Science) and IBM (iX). Expert in Java, Python, TypeScript, Rust, Go, and AWS.',
  bio: "Hey! I'm currently a Senior Engineer at Roblox working on people/AI systems. Before that, I was at Amazon working in Search AI and anomaly detection in logistics. Before that, I was working at IBM on infra modernization.",
  role: 'Senior Software Engineer at Roblox.',
  location: 'San Francisco Bay Area.',
  email: 'j@jdleo.me',
  github: 'https://github.com/jdleo?ref=jdleo.me',
  linkedin: 'https://linkedin.com/in/jdleo?ref=jdleo.me',
  twitter: '@jdleo',
  keywords: [
    'software engineer', 'distributed systems', 'aws', 'amazon', 'ibm',
    'search science', 'system design', 'backend engineer', 'full stack',
    'ai engineering', 'high scale', 'typescript', 'rust', 'go', 'java',
  ],
};

// Published on the App Store (verified via App Store Connect 2026-11-24).
// Wave is intentionally NOT listed (John's direction, 2026-11-24).
// Luna and Scanly join automatically when their live flag flips after approval.
export const APPS = [
  { name: 'Sweep', tagline: 'free photo cleaner', id: 6824570170, live: true },
  { name: 'Unmark', tagline: 'AI tag remover', id: 6829614367, live: true },
  { name: 'All-in-One TV Remote', tagline: 'for every TV', id: 6834723396, live: true },
  { name: 'Tale', tagline: 'AI story generator', id: 6753922553, live: true },
  { name: 'Grasp', tagline: 'learn anything with AI', id: 6754008830, live: true },
  { name: 'Convo', tagline: 'AI chat & agents', id: 6753784349, live: true },
  { name: 'Prism', tagline: 'AI photo art & filters', id: 6757168364, live: true },
  { name: 'Plate', tagline: 'AI calorie tracker', id: 6759228569, live: true },
  { name: 'Luna', tagline: 'period tracker', id: 6829358578, live: false },
  { name: 'Scanly', tagline: 'document scanner', id: 6825671604, live: false },
];
export const appUrl = (a) => `https://apps.apple.com/app/id${a.id}`;

// Blog registry (mirrors the old site's registry; posts live in src/blog/posts/).
export const POSTS = [
  { slug: 'first-post', title: 'Welcome to My Blog', date: '2025-06-09', tags: ['welcome', 'blog', 'jdleo'], description: 'Welcome to my blog!' },
  { slug: 'transformers-are-limited', title: 'Transformers are Limited', date: '2025-08-01', tags: ['transformers', 'limitation', 'reasoning', 'llm'], description: 'The transformer architecture is fundamentally limited for true reasoning.' },
  { slug: 'new-grad-swe-search', title: 'New Grad Job Search for Software Engineers', date: '2025-08-02', tags: ['career', 'job search', 'new grad', 'software engineering', 'tech industry'], description: 'A quick guide for new grads looking to break into the software engineering industry, including networking tips, technical preparation advice, and insights into why the current job market is more challenging.' },
  { slug: 'semantic-diversity-benchmark', title: 'The Semantic Diversity Benchmark: A New Way to Test AI Language Models', date: '2025-08-31', tags: ['ai', 'llm', 'benchmark', 'semantic diversity', 'language models', 'experiment'], description: 'A simple but powerful benchmark for testing AI language models by asking them to generate maximally semantically unrelated words, revealing surprising insights about model capabilities.' },
  { slug: 'nutrition-benchmark', title: 'The Nutrition Prediction Benchmark: Testing LLMs on Google Cafeteria Menus', date: '2025-09-07', tags: ['ai', 'llm', 'benchmark', 'nutrition', 'google', 'experiment'], description: "Testing large language models on their ability to predict accurate nutritional information from Google cafeteria dishes, revealing surprising insights about AI's understanding of food science." },
  { slug: 'clash-royale-ai-deck-prediction', title: 'I Trained AI on 70k Clash Royale Battles to Settle the Ultimate Debate: Does Your Deck Actually Matter?', date: '2025-09-14', tags: ['ai', 'machine learning', 'clash royale', 'game analysis', 'data science', 'lightgbm', 'pytorch', 'decks', 'experiment'], description: "Using machine learning on 70,000+ real battles from the Clash Royale API to definitively answer whether deck composition actually predicts victory, or if it's just skill and luck." },
  { slug: 'are-computer-science-majors-cooked', title: 'Are Computer Science Majors "Cooked" because of AI?', date: '2025-09-22', tags: ['ai', 'computer science', 'job market', 'tech industry', 'software engineering', 'unemployment', 'career'], description: 'A speculative deep dive on whether AI will augment or replace new software engineers.' },
  { slug: 'ai-political-compass', title: 'Which AI Models Lean in Which Political Direction?', date: '2026-01-25', tags: ['ai', 'llm', 'political compass', 'bias', 'experiment', 'politics', 'alignment'], description: 'I asked the top LLMs 20 different political compass questions to figure out how left/right/libertarian/authoritarian they were.' },
  { slug: 'tinysafe', title: 'I Built TinySafe, a Safety Model that Beats 8B Guard Models with 71M Parameters for $37', date: '2026-02-28', tags: ['ai', 'machine learning', 'safety', 'nlp', 'experiment'], description: 'Building a sub-2ms safety classifier that outperforms LlamaGuard, ShieldGemma, and every encoder-based model in its weight class.' },
  { slug: 'tinysafe-v3', title: 'TinySafe v3: How I Built a Near-SOTA Safety LLM for Under $100', date: '2026-03-07', tags: ['ai', 'machine learning', 'safety', 'nlp', 'experiment', 'distillation', 'qlora'], description: 'A 4B parameter model fine-tuned with QLoRA gets within 0.008 F1 of SOTA on ToxicChat, then hits a wall. Five versions, $100, and a lot of lessons about why 0.83 is so hard to break.' },
  { slug: 'current-ai-opinions', title: 'My Current AI Opinions', date: '2026-03-15', tags: ['ai', 'opinions', 'current'], description: 'My current thoughts on AI and how to be good at it.' },
  { slug: 'thoughts-on-ai-aug-2026', title: 'Thoughts on AI now in August 2026', date: '2026-08-28', tags: ['ai', 'opinions', 'august', '2026'], description: 'My opinions on where we are, and where we go from here.' },
];
