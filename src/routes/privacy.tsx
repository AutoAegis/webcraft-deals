import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Data Policy — AutoCode" }, { name: "description", content: "How AutoCode handles your personal data." }] }),
  component: Privacy,
});

function Privacy() {
  return (
    <main>
      <SiteNav />
      <article className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
        <div className="font-mono uppercase text-xs text-primary mb-3">Legal</div>
        <h1 className="text-4xl font-bold">Data Policy</h1>
        <p className="text-muted-foreground mt-2 font-mono text-xs uppercase">Last updated: May 2026</p>

        <section className="mt-10 space-y-6 text-muted-foreground">
          <div>
            <h2 className="text-xl font-bold text-foreground">What we collect</h2>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Email address — used to create your account and contact you.</li>
              <li>Display name — shown publicly on reviews you post.</li>
              <li>Reviews and comments you submit — public on the site.</li>
              <li>Authentication data (session tokens) — to keep you signed in.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">How we use it</h2>
            <p>To operate the site, authenticate you, display your reviews, and respond to enquiries. We do not sell your data.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Storage & security</h2>
            <p>Data is stored on secure managed infrastructure. Passwords are hashed and never stored in plain text. Access is restricted by row-level security policies.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Your rights</h2>
            <p>You can request access, correction, or deletion of your data by emailing autocode.business@gmail.com. Deleting your account removes your profile; reviews you posted may be retained but anonymised.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Cookies</h2>
            <p>We use only essential cookies for authentication. No advertising or third-party tracking.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Contact</h2>
            <p>autocode.business@gmail.com</p>
          </div>
        </section>
      </article>
    </main>
  );
}