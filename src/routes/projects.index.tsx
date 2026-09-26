import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { projectsQuery } from "@/lib/site-data";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Completed Electrical Projects | Zentric Electrical Services" },
      {
        name: "description",
        content:
          "Browse completed electrical installation, repair, solar and automation projects delivered by Zentric Electrical Services.",
      },
      { property: "og:title", content: "Our Projects | Zentric Electrical Services" },
      {
        property: "og:description",
        content: "Completed electrical work by Zentric Electrical Services in Kenya.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: projects, isLoading } = useQuery(projectsQuery);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Portfolio"
        title="Completed projects"
        description="Real work delivered by our team. Published projects only."
      />
      <section className="section">
        <div className="mx-auto max-w-6xl px-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading projects…</p>
          ) : (projects ?? []).length === 0 ? (
            <div className="rounded-md border border-border bg-card p-8 text-center">
              <h2 className="text-lg font-semibold">No projects published yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Project photographs are added from the admin dashboard as jobs are completed.
              </p>
              <Button asChild className="mt-5">
                <Link to="/request-quote">Request a quote</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(projects ?? []).map((project) => (
                <Link
                  key={project.id}
                  to="/projects/$slug"
                  params={{ slug: project.slug }}
                  className="overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-primary"
                >
                  {project.cover_image_url ? (
                    <img
                      src={project.cover_image_url}
                      alt={project.title}
                      loading="lazy"
                      className="h-44 w-full object-cover"
                    />
                  ) : null}
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-widest text-primary">
                      {project.category}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">{project.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{project.location}</p>
                    {project.is_demo ? (
                      <span className="mt-3 inline-block rounded-sm bg-secondary px-1.5 py-0.5 text-[0.65rem] uppercase text-muted-foreground">
                        Demo data
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
