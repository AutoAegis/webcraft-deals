import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast, Toaster } from "sonner";
import { z } from "zod";
import { ArrowRight, Check, Code2, Rocket, Sparkles, Star, Tag, Trash2, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import hero from "@/assets/hero.jpg";
import { SiteNav } from "@/components/site-nav";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: Index,
});

type Review = { id: string; name: string; rating: number; comment: string; created_at: string };

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(600),
});

function Hero() {
  return (
    <header id="top" className="relative pt-32 pb-24 overflow-hidden">
      <img src={hero} alt="" width={1600} height={1200} className="absolute inset-0 size-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-8">
          <Badge variant="outline" className="font-mono uppercase mb-6 border-primary/40 text-primary">
            <Sparkles className="size-3 mr-1" /> Competent web dev
          </Badge>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95]">
            Pro websites.<br />
            <span className="text-primary">Fair prices.</span><br />
            Zero fluff.
          </h1>
          <p className="mt-8 text-lg text-muted-foreground max-w-xl">
            I design and code custom websites that load fast, rank well, and don't cost a fortune. Built by one competent human — not an agency.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg"><a href="#calc">Estimate my project <ArrowRight className="ml-2 size-4" /></a></Button>
            <Button asChild variant="outline" size="lg"><a href="#packages">See packages</a></Button>
          </div>
        </div>
        <div className="md:col-span-4 grid grid-cols-2 gap-3 font-mono text-xs">
          {[["10+","Sites shipped"],["7d","Avg delivery"],["99%","Hand-coded"],["5★","Avg rating"]].map(([n,l]) => (
            <div key={l} className="p-4 border border-border bg-card">
              <div className="text-2xl font-bold text-primary">{n}</div>
              <div className="uppercase text-muted-foreground mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

const features = [
  { id: "blog", label: "Blog / CMS", price: 15 },
  { id: "auth", label: "User accounts", price: 20 },
  { id: "shop", label: "E-commerce / payments", price: 35 },
  { id: "i18n", label: "Multi-language", price: 12 },
  { id: "anim", label: "Custom animations", price: 15 },
  { id: "seo", label: "SEO package", price: 10 },
];

function Calculator() {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [pages, setPages] = useState(5);
  const [design, setDesign] = useState<"template"|"custom"|"premium">("custom");
  const [picked, setPicked] = useState<string[]>(["seo"]);
  const [rush, setRush] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; discount_percent: number } | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);

  const subtotal = useMemo(() => {
    const base = { template: 19, custom: 49, premium: 99 }[design];
    const pageCost = pages * 5;
    const featCost = picked.reduce((s, id) => s + (features.find(f=>f.id===id)?.price ?? 0), 0);
    const sub = base + pageCost + featCost;
    return Math.round(sub * (rush ? 1.3 : 1));
  }, [pages, design, picked, rush]);

  const total = useMemo(() => {
    if (!promo) return subtotal;
    return Math.round(subtotal * (1 - promo.discount_percent / 100));
  }, [subtotal, promo]);

  async function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setCheckingPromo(true);
    const { data } = await supabase
      .from("promo_codes")
      .select("code, discount_percent, active, expires_at")
      .eq("code", code)
      .maybeSingle();
    setCheckingPromo(false);
    if (!data || !data.active) { toast.error("Invalid promo code."); return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { toast.error("This code has expired."); return; }
    setPromo({ code: data.code, discount_percent: data.discount_percent });
    toast.success(`${data.discount_percent}% off applied!`);
  }

  function finalize() {
    if (!user) {
      toast.error("Please sign in to finalise your order.");
      navigate({ to: "/auth" });
      return;
    }
    navigate({
      to: "/order",
      search: {
        type: "custom",
        design,
        pages,
        picked: picked.join(","),
        rush,
        promo: promo?.code,
        promoPct: promo?.discount_percent,
        total,
      },
    });
  }

  return (
    <section id="calc" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader kicker="01 / Calculator" title="Estimate your project" sub="Drag, click, and see a fair price in real time. No hidden fees." />
        <div className="mt-12 grid lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 p-8 space-y-8 bg-card border-border">
            <div>
              <Label className="font-mono uppercase text-xs text-muted-foreground">Design tier</Label>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(["template","custom","premium"] as const).map(t => (
                  <button key={t} onClick={()=>setDesign(t)}
                    className={`p-4 border text-left transition-all ${design===t ? "border-primary bg-primary/10 text-foreground" : "border-border hover:border-primary/50"}`}>
                    <div className="font-bold capitalize">{t}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      £{{template:19,custom:49,premium:99}[t]} base
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-3">
                <Label className="font-mono uppercase text-xs text-muted-foreground">Pages</Label>
                <span className="font-mono text-primary font-bold">{pages}</span>
              </div>
              <Slider value={[pages]} min={1} max={25} step={1} onValueChange={v=>setPages(v[0])} />
            </div>
            <div>
              <Label className="font-mono uppercase text-xs text-muted-foreground">Add-ons</Label>
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                {features.map(f => {
                  const on = picked.includes(f.id);
                  return (
                    <label key={f.id} className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${on ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                      <Checkbox checked={on} onCheckedChange={(c)=>setPicked(p => c ? [...p, f.id] : p.filter(x=>x!==f.id))} />
                      <span className="flex-1 text-sm">{f.label}</span>
                      <span className="font-mono text-xs text-muted-foreground">+£{f.price}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <label className="flex items-center gap-3 p-3 border border-border cursor-pointer">
              <Checkbox checked={rush} onCheckedChange={(c)=>setRush(!!c)} />
              <span className="flex-1 text-sm">Rush delivery (under 5 days)</span>
              <span className="font-mono text-xs text-muted-foreground">+30%</span>
            </label>
            <div className="border border-border p-4 space-y-3">
              <div className="flex items-center gap-2 font-mono uppercase text-xs text-muted-foreground">
                <Tag className="size-3" /> Promo code
              </div>
              {promo ? (
                <div className="flex items-center justify-between text-sm">
                  <span><span className="text-primary font-bold">{promo.code}</span> — {promo.discount_percent}% off</span>
                  <button type="button" onClick={()=>{ setPromo(null); setPromoInput(""); }} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input value={promoInput} onChange={e=>setPromoInput(e.target.value.toUpperCase())} placeholder="ENTER CODE" maxLength={32} className="font-mono uppercase" />
                  <Button type="button" variant="outline" onClick={applyPromo} disabled={checkingPromo}>{checkingPromo ? "..." : "Apply"}</Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Got a discount code? Enter it for a percentage off your project.</p>
            </div>
          </Card>
          <Card className="lg:col-span-2 p-8 bg-primary text-primary-foreground border-primary sticky top-24 self-start" style={{ boxShadow: "var(--shadow-brutal)" }}>
            <div className="font-mono uppercase text-xs opacity-70">Estimated total</div>
            {promo && (
              <div className="mt-2 text-lg line-through opacity-60 tabular-nums">£{subtotal.toLocaleString()}</div>
            )}
            <div className="mt-1 text-6xl font-bold tabular-nums">£{total.toLocaleString()}</div>
            {promo && (
              <div className="mt-2 font-mono text-xs uppercase opacity-90">Code {promo.code} — {promo.discount_percent}% off</div>
            )}
            <p className="mt-4 text-sm opacity-80">One-time price. Hosting, edits & training included for 30 days post-launch.</p>
            <Button onClick={finalize} variant="secondary" size="lg" className="mt-8 w-full">
              Finalise & confirm <ArrowRight className="ml-2 size-4" />
            </Button>
            {!user && (
              <p className="mt-3 text-xs opacity-80 text-center"><Link to="/auth" className="underline">Sign in</Link> to send your order.</p>
            )}
          </Card>
        </div>
        {isAdmin && <PromoAdmin />}
      </div>
    </section>
  );
}

type Promo = { id: string; code: string; discount_percent: number; active: boolean; expires_at: string | null };

function PromoAdmin() {
  const [items, setItems] = useState<Promo[]>([]);
  const [code, setCode] = useState("");
  const [pct, setPct] = useState("10");
  const [expires, setExpires] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as Promo[]);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    const p = parseInt(pct, 10);
    if (c.length < 3 || c.length > 32) { toast.error("Code must be 3–32 characters."); return; }
    if (!/^[A-Z0-9_-]+$/.test(c)) { toast.error("Code: A–Z, 0–9, _ - only."); return; }
    if (isNaN(p) || p < 1 || p > 90) { toast.error("Discount must be 1–90%."); return; }
    setLoading(true);
    const { error } = await supabase.from("promo_codes").insert({
      code: c, discount_percent: p, expires_at: expires ? new Date(expires).toISOString() : null,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setCode(""); setPct("10"); setExpires("");
    toast.success("Promo code created.");
    load();
  }

  async function toggle(p: Promo) {
    await supabase.from("promo_codes").update({ active: !p.active }).eq("id", p.id);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this code?")) return;
    await supabase.from("promo_codes").delete().eq("id", id);
    load();
  }

  return (
    <Card className="mt-8 p-6 bg-card border-primary/40">
      <div className="flex items-center gap-2">
        <Tag className="size-4 text-primary" />
        <h3 className="font-bold text-lg">Promo codes (admin)</h3>
      </div>
      <form onSubmit={create} className="mt-4 grid sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <Label className="font-mono uppercase text-xs">Code</Label>
          <Input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} maxLength={32} className="mt-2 font-mono uppercase" placeholder="LAUNCH20" />
        </div>
        <div>
          <Label className="font-mono uppercase text-xs">% off</Label>
          <Input type="number" min={1} max={90} value={pct} onChange={e=>setPct(e.target.value)} className="mt-2" />
        </div>
        <div>
          <Label className="font-mono uppercase text-xs">Expires (optional)</Label>
          <Input type="date" value={expires} onChange={e=>setExpires(e.target.value)} className="mt-2" />
        </div>
        <div className="sm:col-span-4">
          <Button type="submit" variant="hero" disabled={loading}>{loading ? "..." : "Create code"}</Button>
        </div>
      </form>
      <div className="mt-6 space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">No promo codes yet.</p>}
        {items.map(p => (
          <div key={p.id} className="flex items-center justify-between gap-3 p-3 border border-border">
            <div className="font-mono text-sm">
              <span className="text-primary font-bold">{p.code}</span>
              <span className="text-muted-foreground"> — {p.discount_percent}% off</span>
              {p.expires_at && <span className="text-muted-foreground/70"> · exp {new Date(p.expires_at).toLocaleDateString()}</span>}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={()=>toggle(p)} className={`font-mono text-xs uppercase px-2 py-1 border ${p.active ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
                {p.active ? "Active" : "Disabled"}
              </button>
              <button type="button" onClick={()=>remove(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

const packages = [
  { name: "Starter", price: 39, icon: Zap, desc: "Perfect single-page presence.", features: ["1-page landing site", "Mobile responsive", "Basic SEO setup", "Contact form", "5-day delivery"] },
  { name: "Business", price: 99, icon: Rocket, popular: true, desc: "Everything a small business needs.", features: ["Up to 6 pages", "Custom design", "CMS / blog ready", "Advanced SEO", "Analytics + forms", "30 days support"] },
  { name: "Bespoke", price: 249, icon: Code2, desc: "Custom apps & e-commerce.", features: ["Unlimited pages", "Custom backend / DB", "Auth & dashboards", "Payments / e-commerce", "Performance tuning", "90 days support"] },
];

function Packages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  function choose(p: { name: string; price: number }) {
    if (!user) { toast.error("Please sign in to choose a package."); navigate({ to: "/auth" }); return; }
    navigate({ to: "/order", search: { type: "package", name: p.name, price: p.price } });
  }
  return (
    <section id="packages" className="py-24 px-6 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader kicker="02 / Packages" title="Pick your package" sub="Or mix and match — every project is shaped to your goals." />
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {packages.map(p => (
            <Card key={p.name} className={`p-8 flex flex-col bg-card border-border relative ${p.popular ? "border-primary" : ""}`}>
              {p.popular && (
                <Badge className="absolute -top-3 left-8 bg-primary text-primary-foreground font-mono uppercase">Most popular</Badge>
              )}
              <p.icon className="size-8 text-primary" />
              <h3 className="mt-6 text-2xl font-bold">{p.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
              <div className="mt-6 font-mono">
                <span className="text-4xl font-bold">£{p.price}</span>
                <span className="text-muted-foreground text-sm"> / project</span>
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex gap-3 text-sm">
                    <Check className="size-4 text-primary shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Button onClick={() => choose(p)} variant={p.popular ? "hero" : "outline"} className="mt-8">
                Choose {p.name}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stars({ value, onChange, size = "size-5" }: { value: number; onChange?: (n:number)=>void; size?: string }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" disabled={!onChange} onClick={()=>onChange?.(n)}
          className={`${onChange ? "cursor-pointer" : "cursor-default"}`}>
          <Star className={`${size} ${n <= value ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  );
}

function Reviews() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(20);
    if (data) setReviews(data as Review[]);
  }
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!user) { setDisplayName(""); return; }
    supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setDisplayName(data?.display_name ?? user.email?.split("@")[0] ?? "User"));
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to post a review."); return; }
    const parsed = reviewSchema.safeParse({ rating, comment });
    if (!parsed.success) { toast.error("Please write a comment."); return; }
    setLoading(true);
    const { error } = await supabase.from("reviews").insert({
      ...parsed.data,
      name: displayName || "User",
      user_id: user.id,
    });
    setLoading(false);
    if (error) { toast.error("Couldn't post your review."); return; }
    toast.success("Thanks for the review!");
    setComment(""); setRating(5);
    load();
  }

  return (
    <section id="reviews" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader kicker="03 / Reviews" title="What clients say" sub="Real feedback. Add yours below — I read every one." />
        <div className="mt-12 grid lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-2 p-8 bg-card border-border h-fit">
            <h3 className="font-bold text-xl">Leave a review</h3>
            {user ? (
              <form onSubmit={submit} className="mt-6 space-y-5">
                <div className="font-mono text-xs text-muted-foreground uppercase">Posting as <span className="text-primary">{displayName || "you"}</span></div>
                <div>
                  <Label className="font-mono uppercase text-xs">Rating</Label>
                  <div className="mt-2"><Stars value={rating} onChange={setRating} size="size-7" /></div>
                </div>
                <div>
                  <Label htmlFor="cmt" className="font-mono uppercase text-xs">Comment</Label>
                  <Textarea id="cmt" value={comment} onChange={e=>setComment(e.target.value)} maxLength={600} rows={4} className="mt-2" placeholder="Tell people about your experience..." />
                </div>
                <Button type="submit" variant="hero" disabled={loading} className="w-full">{loading ? "Posting..." : "Post review"}</Button>
              </form>
            ) : (
              <div className="mt-6 space-y-4">
                <p className="text-sm text-muted-foreground">Reviews are tied to accounts to keep them genuine. Sign in or create a free account to post.</p>
                <Button asChild variant="hero" className="w-full"><Link to="/auth">Sign in to leave a review</Link></Button>
              </div>
            )}
          </Card>
          <div className="lg:col-span-3 space-y-4">
            {reviews.length === 0 && (
              <Card className="p-8 border-dashed border-border bg-transparent text-center text-muted-foreground">
                No reviews yet. Be the first.
              </Card>
            )}
            {reviews.map(r => (
              <Card key={r.id} className="p-6 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div className="font-bold">{r.name}</div>
                  <Stars value={r.rating} />
                </div>
                <p className="mt-3 text-muted-foreground">{r.comment}</p>
                <div className="mt-3 font-mono text-xs text-muted-foreground/70 uppercase">
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <div className="max-w-2xl">
      <div className="font-mono uppercase text-xs text-primary mb-3">{kicker}</div>
      <h2 className="text-4xl md:text-5xl font-bold">{title}</h2>
      <p className="mt-4 text-muted-foreground">{sub}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-4 font-mono text-xs uppercase text-muted-foreground">
        <div>© 2025 AutoCode — Built by hand</div>
        <div className="flex gap-6">
          <Link to="/terms" className="hover:text-primary">Terms</Link>
          <Link to="/privacy" className="hover:text-primary">Data Policy</Link>
          <a href="mailto:autocode.business@gmail.com" className="hover:text-primary">autocode.business@gmail.com</a>
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <main>
      <Toaster theme="dark" position="top-right" />
      <SiteNav />
      <Hero />
      <Calculator />
      <Packages />
      <Reviews />
      <Footer />
    </main>
  );
}
