import { readFile } from 'fs/promises';
import { join } from 'path';
import { apps } from '@/app/constants/apps';
import { strings } from '@/app/constants/strings';
import { getAllBlogPosts } from '@/blog/registry';

export const SITE_URL = 'https://jdleo.me';

export function homeMarkdown(): string {
    const lines: string[] = [
        `# John Leonardo (jdleo.me)`,
        ``,
        `> Personal site of John Leonardo, Senior Software Engineer at Roblox. Interactive AI/developer mini-apps and a technical blog covering AI/ML experiments.`,
        ``,
        strings.DESCRIPTION ?? '',
        ``,
        `- Site: ${SITE_URL}`,
        `- Contact: ${strings.EMAIL}`,
        `- GitHub: ${strings.GITHUB_URL}`,
        `- LinkedIn: ${strings.LINKEDIN_URL}`,
        ``,
        `Every page on this site is available in both HTML and clean Markdown. Append \`.md\` to any page URL to get the Markdown version (e.g. ${SITE_URL}/blog/tinysafe.md).`,
        ``,
    ];
    return lines.join('\n');
}

export function appsIndexMarkdown(): string {
    const lines: string[] = [
        `# Apps — John Leonardo`,
        ``,
        `> Interactive mini-apps hosted on jdleo.me.`,
        ``,
    ];
    for (const app of apps) {
        lines.push(`- [${app.title}](${SITE_URL}${app.href}.md): ${app.subtitle}`);
    }
    return lines.join('\n');
}

export function blogIndexMarkdown(): string {
    const lines: string[] = [
        `# Blog — John Leonardo`,
        ``,
        `> Technical posts and AI/ML experiments by John Leonardo.`,
        ``,
    ];
    for (const post of getAllBlogPosts()) {
        const desc = post.description ? `: ${post.description}` : '';
        lines.push(`- [${post.title}](${SITE_URL}/blog/${post.slug}.md) (${post.date})${desc}`);
    }
    return lines.join('\n');
}

export function appMarkdown(href: string): string | null {
    const app = apps.find(a => a.href === href);
    if (!app) return null;
    const lines: string[] = [
        `# ${app.title}`,
        ``,
        `> ${app.subtitle}`,
        ``,
        `This is an interactive web app — open it in a browser to use it:`,
        ``,
        `${SITE_URL}${app.href}`,
        ``,
    ];
    return lines.join('\n');
}

export async function blogPostMarkdown(slug: string): Promise<string | null> {
    const posts = getAllBlogPosts();
    const post = posts.find(p => p.slug === slug);
    if (!post) return null;

    let content: string;
    try {
        const filePath = join(process.cwd(), 'src', 'blog', 'posts', `${slug}.md`);
        content = await readFile(filePath, 'utf-8');
    } catch {
        return null;
    }

    // Drop a leading H1 if it duplicates the registry title, then prepend canonical H1 + byline
    const escapedTitle = post.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    content = content.replace(new RegExp(`^#\\s+${escapedTitle}\\s*\\n+`), '');

    const tags = post.tags.length > 0 ? ` · ${post.tags.join(', ')}` : '';
    const lines = [
        `# ${post.title}`,
        ``,
        `Published ${post.date}${tags} — ${SITE_URL}/blog/${post.slug}`,
        ``,
        content.trimEnd(),
        ``,
    ];
    return lines.join('\n');
}
