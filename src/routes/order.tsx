import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  type: z.enum(["package", "custom"]).default("package"),
  name: z.string().optional(),
  price: z.coerce.number().optional(),
  design: z.string().optional(),
  pages: z.coerce.number().optional(),
  picked: z.string().optional(),
  rush: z.coerce.boolean().optional(),
  promo: z.string().optional(),
  promoPct: z.coerce.number().optional(),
  total: z.coerce.number().optional(),
});

export const Route = createFileRoute("/order")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Confirm your order — AutoCode" },
      { name: "description", content: "Review your selection and send your project request." },
    ],
  }),
  component: OrderPage,
});

const ADMIN_EMAIL = "autocode.business@gmail.com";

function OrderPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [siteAbout, setSiteAbout] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        const name = data?.display_name ?? "";
        setDisplayName(name);
        setContactName(name);
      });
  }, [user]);

  const summary = useMemo(() => {
    if (search.type === "package") {
      return {
        title: `${search.name ?? "Package"} package`,
        lines: [`Package: ${search.name}`, `Price: £${search.price ?? "—"}`],
      };
    }
    const picked = search.picked ? search.picked.split(",").filter(Boolean) : [];
    const lines = [
      `Type: Custom build`,
      `Design tier: ${search.design ?? "—"}`,
      `Pages: ${search.pages ?? "—"}`,
      `Add-ons: ${picked.length ? picked.join(", ") : "none"}`,
      `Rush delivery: ${search.rush ? "Yes (+30%)" : "No"}`,
    ];
    if (search.promo) lines.push(`Promo code: ${search.promo} (${search.promoPct}% off)`);
    lines.push(`Estimated total: £${search.total ?? "—"}`);
    return { title: "Custom project", lines };
  }, [search]);

  function buildMailto() {
    const subject = `New project request — ${summary.title}`;
    const body = [
      `Hi Auto,`,
      ``,
      `I'd like to go ahead with the following:`,
      ``,
      `--- ORDER ---`,
      ...summary.lines,
      `--- /ORDER ---`,
      ``,
      `About my website / project:`,
      siteAbout || "(not provided)",
      ``,
      `Additional comments:`,
      comments || "(none)",
      ``,
      `--- CONTACT ---`,
      `Name: ${contactName || displayName}`,
      `Email: ${user?.email ?? ""}`,
      `Phone: ${phone || "(not provided)"}`,
      ``,
      `Thanks!`,
    ].join("\n");
    return `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!siteAbout.trim()) return;
    window.location.href = buildMailto();
  }

  if (loading || !user) {
    return <main><SiteNav /><div className="pt-32 px-6 text-center text-muted-foreground">Loading...</div></main>;
  }

  return (
    <main>
      <SiteNav />
      <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="font-mono uppercase text-xs text-primary mb-3">Confirm</div>
        <h1 className="text-4xl md:text-5xl font-bold">Review & send your request</h1>
        <p className="mt-3 text-muted-foreground">
          Take one last look, tell me about your project, and send it across. I'll reply within 24h.
        </p>

        <div className="mt-10 grid lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-2 p-6 bg-primary text-primary-foreground border-primary h-fit" style={{ boxShadow: "var(--shadow-brutal)" }}>
            <div className="font-mono uppercase text-xs opacity-70">Your selection</div>
            <div className="mt-2 text-2xl font-bold">{summary.title}</div>
            <ul className="mt-4 space-y-2 text-sm">
              {summary.lines.map(l => <li key={l} className="font-mono">{l}</li>)}
            </ul>
          </Card>

          <Card className="lg:col-span-3 p-6 bg-card border-border">
            <form onSubmit={handleSend} className="space-y-5">
              <div>
                <Label htmlFor="about" className="font-mono uppercase text-xs">What is your website / project about? *</Label>
                <Textarea id="about" value={siteAbout} onChange={e=>setSiteAbout(e.target.value)} required maxLength={2000} rows={5} className="mt-2" placeholder="e.g. A booking site for my dog grooming business in Leeds. Need online bookings, gallery, and a blog." />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="font-mono uppercase text-xs">Your name</Label>
                  <Input id="name" value={contactName} onChange={e=>setContactName(e.target.value)} maxLength={80} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="phone" className="font-mono uppercase text-xs">Phone (optional)</Label>
                  <Input id="phone" value={phone} onChange={e=>setPhone(e.target.value)} maxLength={32} className="mt-2" />
                </div>
              </div>
              <div>
                <Label htmlFor="comments" className="font-mono uppercase text-xs">Additional comments</Label>
                <Textarea id="comments" value={comments} onChange={e=>setComments(e.target.value)} maxLength={2000} rows={4} className="mt-2" placeholder="Deadlines, references, examples you like, etc." />
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Sending as <span className="text-primary">{user.email}</span>. Pressing send opens your email app with everything pre-filled.
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" variant="hero" size="lg" disabled={!siteAbout.trim()}>
                  <Mail className="mr-2 size-4" /> Send request <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button asChild variant="outline" size="lg"><Link to="/">Cancel</Link></Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}