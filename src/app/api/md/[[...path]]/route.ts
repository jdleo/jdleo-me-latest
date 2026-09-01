import {
  appMarkdown,
  appsIndexMarkdown,
  blogIndexMarkdown,
  blogPostMarkdown,
  homeMarkdown,
} from "@/lib/llms";

export const revalidate = 3600;

function markdownResponse(body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}

function notFoundResponse() {
  return new Response("Not found", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

interface MdRouteProps {
  params: Promise<{ path?: string[] }>;
}

export async function GET(_request: Request, { params }: MdRouteProps) {
  const { path = [] } = await params;
  const segments = path.filter((s) => s.length > 0);

  // /api/md/ or /api/md/index -> home
  if (segments.length === 0 || (segments.length === 1 && segments[0] === "index")) {
    return markdownResponse(homeMarkdown());
  }

  const [section, slug] = segments;

  if (segments.length === 1 && section === "apps") {
    return markdownResponse(appsIndexMarkdown());
  }

  if (segments.length === 2 && section === "apps") {
    const md = appMarkdown(`/apps/${slug}`);
    return md ? markdownResponse(md) : notFoundResponse();
  }

  if (segments.length === 1 && section === "blog") {
    return markdownResponse(blogIndexMarkdown());
  }

  if (segments.length === 2 && section === "blog") {
    const md = await blogPostMarkdown(slug);
    return md ? markdownResponse(md) : notFoundResponse();
  }

  return notFoundResponse();
}
