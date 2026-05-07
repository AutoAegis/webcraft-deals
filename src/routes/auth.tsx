import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create an account — AutoCode" },
      { name: "description", content: "Create an AutoCode account to leave reviews and engage with the community." },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  displayName: z.string().trim().min(2).max(40),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});
const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!agree) { toast.error("You must accept the terms and data policy."); return; }
        const parsed = signupSchema.safeParse({ displayName, email, password });
        if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: parsed.data.displayName },
          },
        });
        if (error) { toast.error(error.message); return; }
        toast.success("Account created. Welcome!");
        navigate({ to: "/" });
      } else {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) { toast.error("Invalid email or password."); return; }
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) { toast.error(error.message); return; }
        toast.success("Signed in.");
        navigate({ to: "/" });
      }
    } finally { setLoading(false); }
  }

  return (
    <main>
      <Toaster theme="dark" position="top-right" />
      <SiteNav />
      <div className="pt-32 pb-24 px-6">
        <Card className="max-w-md mx-auto p-8 bg-card border-border">
          <div className="font-mono uppercase text-xs text-primary mb-2">Account</div>
          <h1 className="text-3xl font-bold">{mode === "login" ? "Sign in" : "Create account"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" ? "Welcome back." : "Join to leave reviews and stay updated."}
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="dn" className="font-mono uppercase text-xs">Display name</Label>
                <Input id="dn" value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={40} className="mt-2" required />
              </div>
            )}
            <div>
              <Label htmlFor="em" className="font-mono uppercase text-xs">Email</Label>
              <Input id="em" type="email" value={email} onChange={e=>setEmail(e.target.value)} maxLength={255} className="mt-2" required />
            </div>
            <div>
              <Label htmlFor="pw" className="font-mono uppercase text-xs">Password</Label>
              <Input id="pw" type="password" value={password} onChange={e=>setPassword(e.target.value)} maxLength={72} className="mt-2" required />
              {mode === "signup" && <p className="text-xs text-muted-foreground mt-1 font-mono">Min 8 characters.</p>}
            </div>
            {mode === "signup" && (
              <label className="flex items-start gap-3 text-sm">
                <Checkbox checked={agree} onCheckedChange={(c)=>setAgree(!!c)} className="mt-1" />
                <span>
                  I agree to the <Link to="/terms" className="text-primary underline">Terms</Link> and <Link to="/privacy" className="text-primary underline">Data Policy</Link>.
                </span>
              </label>
            )}
            <Button type="submit" variant="hero" disabled={loading} className="w-full">
              {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <button
            type="button"
            onClick={()=>setMode(mode === "login" ? "signup" : "login")}
            className="mt-6 text-sm text-muted-foreground hover:text-primary w-full text-center"
          >
            {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </Card>
      </div>
    </main>
  );
}