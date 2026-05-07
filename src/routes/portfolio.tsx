import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site-nav";
import { useAuth } from "@/hooks/use-auth";
import { AdminSignature } from "@/components/admin-signature";
import { ImageUpload } from "@/components/image-upload";

export const Route = createFileRoute("/portfolio")({
  head: () => ({ meta: [{ title: "Portfolio — AutoCode" }, { name: "description", content: "Selected websites and apps built by AutoCode." }] }),
  component: PortfolioPage,
});

type Project = { id: string; title: string; description: string; image_url: string | null; project_url: string | null; tech: string[]; sort_order: number };

const schema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(800),
  image_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  project_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  tech: z.string().trim().max(200),
  sort_order: z.number().int(),
});

function PortfolioPage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<Project[]>([]);
  const [form, setForm] = useState({ title: "", description: "", image_url: "", project_url: "", tech: "", sort_order: "0" });
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data } = await supabase.from("portfolio_projects").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
    if (data) setItems(data as Project[]);
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, sort_order: Number(form.sort_order) || 0 });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const tech = parsed.data.tech.split(",").map(s=>s.trim()).filter(Boolean);
    const { error } = await supabase.from("portfolio_projects").insert({
      title: parsed.data.title,
      description: parsed.data.description,
      image_url: parsed.data.image_url || null,
      project_url: parsed.data.project_url || null,
      tech,
      sort_order: parsed.data.sort_order,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setForm({ title: "", description: "", image_url: "", project_url: "", tech: "", sort_order: "0" });
    toast.success("Project added.");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this project?")) return;
    const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  }

  return (
    <main>
      <Toaster theme="dark" position="top-right" />
      <SiteNav />
      <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <div className="font-mono uppercase text-xs text-primary mb-3">Work</div>
        <h1 className="text-5xl md:text-6xl font-bold">Portfolio</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">A selection of recent sites and apps. Each one shipped fast, hand-coded, and built to last.</p>

        {isAdmin && (
          <Card className="mt-10 p-6 bg-card border-primary/40">
            <h2 className="font-bold text-lg">Add a project</h2>
            <form onSubmit={submit} className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="font-mono uppercase text-xs">Title</Label>
                <Input value={form.title} onChange={e=>setForm({...form, title: e.target.value})} maxLength={120} className="mt-2" />
              </div>
              <div>
                <Label className="font-mono uppercase text-xs">Sort order</Label>
                <Input type="number" value={form.sort_order} onChange={e=>setForm({...form, sort_order: e.target.value})} className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label className="font-mono uppercase text-xs">Description</Label>
                <Textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} maxLength={800} rows={3} className="mt-2" />
              </div>
              <div>
                <Label className="font-mono uppercase text-xs">Image URL</Label>
                <div className="mt-2"><ImageUpload value={form.image_url} onChange={(url)=>setForm({...form, image_url: url})} /></div>
              </div>
              <div>
                <Label className="font-mono uppercase text-xs">Project URL</Label>
                <Input value={form.project_url} onChange={e=>setForm({...form, project_url: e.target.value})} className="mt-2" placeholder="https://..." />
              </div>
              <div className="sm:col-span-2">
                <Label className="font-mono uppercase text-xs">Tech (comma separated)</Label>
                <Input value={form.tech} onChange={e=>setForm({...form, tech: e.target.value})} className="mt-2" placeholder="React, Tailwind, Supabase" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" variant="hero" disabled={loading}>{loading ? "Adding..." : "Add project"}</Button>
              </div>
            </form>
          </Card>
        )}

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.length === 0 && (
            <Card className="md:col-span-2 lg:col-span-3 p-12 border-dashed border-border bg-transparent text-center text-muted-foreground">
              No projects yet.
            </Card>
          )}
          {items.map(p => (
            <Card key={p.id} className="overflow-hidden bg-card border-border flex flex-col group">
              {p.image_url && (
                <div className="aspect-video overflow-hidden bg-secondary/30">
                  <img src={p.image_url} alt={p.title} className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xl font-bold">{p.title}</h3>
                  {isAdmin && <button onClick={()=>remove(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>}
                </div>
                <div className="mt-1"><AdminSignature /></div>
                <p className="mt-2 text-sm text-muted-foreground flex-1">{p.description}</p>
                {p.tech.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.tech.map(t => (
                      <span key={t} className="font-mono text-[10px] uppercase px-2 py-1 border border-border text-muted-foreground">{t}</span>
                    ))}
                  </div>
                )}
                {p.project_url && (
                  <a href={p.project_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-mono uppercase text-primary hover:underline">
                    Visit <ArrowUpRight className="size-4" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}