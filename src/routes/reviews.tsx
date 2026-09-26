import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { approvedReviewsQuery, servicesQuery } from "@/lib/site-data";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Customer Reviews | Zentric Electrical Services" },
      {
        name: "description",
        content:
          "Read reviews from Zentric Electrical Services customers and share your own experience of our electrical work.",
      },
      { property: "og:title", content: "Customer Reviews | Zentric" },
      { property: "og:description", content: "Verified customer feedback on our electrical work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const queryClient = useQueryClient();
  const { data: reviews } = useQuery(approvedReviewsQuery);
  const { data: services } = useQuery(servicesQuery);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [serviceId, setServiceId] = useState<string | undefined>();
  const [body, setBody] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reviews").insert({
        author_name: name.trim(),
        rating,
        body: body.trim() || null,
        service_id: serviceId ?? null,
        status: "PENDING_APPROVAL",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thank you. Your review was submitted for approval.");
      setName("");
      setBody("");
      setRating(5);
      setServiceId(undefined);
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Reviews"
        title="Customer reviews"
        description="Only reviews approved by our office appear here."
      />
      <section className="section">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {(reviews ?? []).length === 0 ? (
              <div className="rounded-md border border-border bg-card p-8">
                <h2 className="text-lg font-semibold">No approved reviews yet</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  If we have worked for you, your feedback is welcome.
                </p>
              </div>
            ) : (
              (reviews ?? []).map((review) => (
                <figure key={review.id} className="rounded-md border border-border bg-card p-5">
                  <div className="flex gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <blockquote className="mt-3 text-sm text-muted-foreground">{review.body}</blockquote>
                  <figcaption className="mt-3 text-sm font-medium">
                    {review.author_name}
                    {review.is_demo ? (
                      <span className="ml-2 rounded-sm bg-secondary px-1.5 py-0.5 text-[0.65rem] uppercase text-muted-foreground">
                        Demo data
                      </span>
                    ) : null}
                  </figcaption>
                </figure>
              ))
            )}
          </div>

          <form
            className="h-fit space-y-4 rounded-md border border-border bg-card p-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim()) {
                toast.error("Please enter your name.");
                return;
              }
              submit.mutate();
            }}
          >
            <h2 className="text-lg font-semibold uppercase">Leave a review</h2>
            <div className="space-y-2">
              <Label htmlFor="review-name">Your name</Label>
              <Input id="review-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} star`}
                    onClick={() => setRating(value)}
                    className="p-1"
                  >
                    <Star
                      className={
                        value <= rating ? "h-6 w-6 fill-gold text-gold" : "h-6 w-6 text-muted-foreground"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {(services ?? []).map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-body">Your review</Label>
              <Textarea
                id="review-body"
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submit.isPending}>
              {submit.isPending ? "Submitting…" : "Submit review"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Reviews are checked by our office before they appear publicly.
            </p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
