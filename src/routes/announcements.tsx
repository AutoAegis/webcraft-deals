import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pin, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site-nav";
import { useAuth } from "@/hooks/use-auth";
import { AdminSignature } from "@/components/admin-signature";
import { ImageUpload } from "@/components/image-upload";

export const Route = createFileRoute("/announcements")({
  head: () => ({ meta: [{ title: "Announcements — AutoCode" }, { name: "description", content: "Latest updates and news from AutoCode." }] }),
  component: AnnouncementsPage,
});

type Announcement = { id: string; title: string; body: string; pinned: boolean; created_at: string; image_url: string | null };

const schema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(4000),
});

function AnnouncementsPage() {
  const { isAdmin, user } = useAuth();
  const [items, setItems] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data } = await supabase.from("announcements").select("*").order("pinned", { ascending: false }).order("created_at", { ascending: false });
    if (data) setItems(data as Announcement[]);
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ title, body });
    if (!parsed.success) { toast.error("Title and body are required."); return; }
    setLoading(true);
    const { error } = await supabase.from("announcements").insert({ ...parsed.data, pinned, image_url: imageUrl || null });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setTitle(""); setBody(""); setPinned(false); setImageUrl("");
    toast.success("Announcement posted.");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this announcement?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted.");
    load();
  }

  return (
    <main>
      <Toaster theme="dark" position="top-right" />
      <SiteNav />
      <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="font-mono uppercase text-xs text-primary mb-3">News</div>
        <h1 className="text-5xl font-bold">Announcements</h1>
        <p className="mt-3 text-muted-foreground">Updates, releases, and news from AutoCode.</p>

        {isAdmin && (
          <Card className="mt-10 p-6 bg-card border-primary/40">
            <h2 className="font-bold text-lg">New announcement</h2>
            <form onSubmit={submit} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="t" className="font-mono uppercase text-xs">Title</Label>
                <Input id="t" value={title} onChange={e=>setTitle(e.target.value)} maxLength={120} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="b" className="font-mono uppercase text-xs">Body</Label>
                <Textarea id="b" value={body} onChange={e=>setBody(e.target.value)} maxLength={4000} rows={5} className="mt-2" />
              </div>
              <label className="flex items-center gap-3 text-sm">
                <Checkbox checked={pinned} onCheckedChange={(c)=>setPinned(!!c)} />
                Pin to top
              </label>
              <div>
                <Label className="font-mono uppercase text-xs">Image (optional)</Label>
                <div className="mt-2"><ImageUpload value={imageUrl} onChange={setImageUrl} /></div>
              </div>
              <Button type="submit" variant="hero" disabled={loading}>{loading ? "Posting..." : "Post announcement"}</Button>
            </form>
          </Card>
        )}

        {!user && (
          <p className="mt-8 text-sm text-muted-foreground"><Link to="/auth" className="text-primary underline">Sign in</Link> to your account to comment on future announcements.</p>
        )}

        <div className="mt-10 space-y-4">
          {items.length === 0 && (
            <Card className="p-8 border-dashed border-border bg-transparent text-center text-muted-foreground">No announcements yet.</Card>
          )}
          {items.map(a => (
            <Card key={a.id} className="p-6 bg-card border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    {a.pinned && <Badge className="bg-primary text-primary-foreground font-mono uppercase text-xs"><Pin className="size-3 mr-1" /> Pinned</Badge>}
                    <h3 className="text-2xl font-bold">{a.title}</h3>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <AdminSignature />
                    <span className="font-mono text-xs uppercase text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {isAdmin && (
                  <Button size="sm" variant="outline" onClick={()=>remove(a.id)}><Trash2 className="size-4" /></Button>
                )}
              </div>
              <p className="mt-4 whitespace-pre-wrap text-foreground/90">{a.body}</p>
              {a.image_url && (
                <img src={a.image_url} alt={a.title} className="mt-4 rounded border border-border max-h-96 w-auto" />
              )}
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}