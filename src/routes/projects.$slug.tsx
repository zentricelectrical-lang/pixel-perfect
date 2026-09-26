import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => {
    const readable = params.slug.replace(/-/g, " ");
    const title = `${readable.replace(/\b\w/g, (c) => c.toUpperCase())} | Zentric Project`;
    const description = `Electrical project by Zentric Electrical Services: ${readable}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProjectDetail,
});

function projectQuery(slug: string) {
  return queryOptions({
    queryKey: ["project", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, project_images(id,image_url,stage,caption,sort_order)")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

const STAGES = [
  { key: "before", label: "Before" },
  { key: "during", label: "During" },
  { key: "after", label: "After" },
];

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data: project, isLoading } = useQuery(projectQuery(slug));

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-4 py-20 text-sm text-muted-foreground">Loading…</div>
      </SiteLayout>
    );
  }

  if (!project) {
    return (
      <SiteLayout>
        <PageHeader title="Project not found" description="This project is not published." />
        <div className="mx-auto max-w-6xl px-4 py-12">
          <Button asChild>
            <Link to="/projects">Back to projects</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const images = (project.project_images ?? []) as Array<{
    id: string;
    image_url: string;
    stage: string;
    caption: string | null;
  }>;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={project.category ?? "Project"}
        title={project.title}
        description={[project.location, project.completed_on].filter(Boolean).join(" • ")}
      />
      <section className="section">
        <div className="mx-auto max-w-6xl space-y-10 px-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
            {project.description}
          </p>

          {project.services_performed && project.services_performed.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold uppercase">Work performed</h2>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {project.services_performed.map((item: string) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {STAGES.map((stage) => {
            const stageImages = images.filter((i) => i.stage === stage.key);
            if (stageImages.length === 0) return null;
            return (
              <div key={stage.key}>
                <h2 className="mb-3 text-lg font-semibold uppercase">{stage.label}</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {stageImages.map((image) => (
                    <figure key={image.id}>
                      <img
                        src={image.image_url}
                        alt={image.caption ?? project.title}
                        loading="lazy"
                        className="w-full rounded-md border border-border object-cover"
                      />
                      {image.caption ? (
                        <figcaption className="mt-1 text-xs text-muted-foreground">
                          {image.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              </div>
            );
          })}

          {project.testimonial ? (
            <blockquote className="rounded-md border border-gold/40 bg-card p-5 text-sm italic text-muted-foreground">
              “{project.testimonial}”
            </blockquote>
          ) : null}

          <Button asChild>
            <Link to="/request-quote">Request similar work</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
