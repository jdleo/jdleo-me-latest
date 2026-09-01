import { apps } from "@/app/constants/apps";
import { strings } from "@/app/constants/strings";
import { getAllBlogPosts } from "@/blog/registry";
import { SITE_URL } from "@/lib/llms";

export const revalidate = 3600;

export function GET() {
  const lines: string[] = [];

  lines.push(`# John Leonardo (jdleo.me)`);
  lines.push(``);
  lines.push(
    `> Personal site of John Leonardo, Senior Software Engineer at Roblox. Home to ${apps.length} interactive AI and developer mini-apps plus a technical blog of AI/ML experiments.`
  );
  lines.push(``);
  lines.push(
    `${strings.NAME} — ${strings.DESCRIPTION}`
  );
  lines.push(``);
  lines.push(`All pages below exist as both HTML and clean Markdown.`);
  lines.push(`Append \`.md\` to any page URL to get the Markdown version (e.g. ${SITE_URL}/blog/tinysafe.md).`);
  lines.push(`This file is the LLM-readable overview for the whole site.`);
  lines.push(``);

  lines.push(`## Apps`);
  lines.push(``);
  for (const app of apps) {
    lines.push(`- [${app.title}](${SITE_URL}${app.href}.md): ${app.subtitle}`);
  }
  lines.push(``);

  lines.push(`## Blog`);
  lines.push(``);
  for (const post of getAllBlogPosts()) {
    const notes = post.description ? `: ${post.description}` : "";
    lines.push(
      `- [${post.title}](${SITE_URL}/blog/${post.slug}.md) (${post.date})${notes}`
    );
  }
  lines.push(``);

  lines.push(`## Optional`);
  lines.push(``);
  lines.push(`- [Sitemap](${SITE_URL}/sitemap.xml): full list of all pages`);
  lines.push(`- [All apps as Markdown](${SITE_URL}/apps.md): index of the Apps section`);
  lines.push(`- [All blog posts as Markdown](${SITE_URL}/blog.md): index of the Blog section`);
  lines.push(``);

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
