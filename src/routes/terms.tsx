import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — AutoCode" }, { name: "description", content: "AutoCode terms of service." }] }),
  component: Terms,
});

function Terms() {
  return (
    <main>
      <SiteNav />
      <article className="pt-32 pb-24 px-6 max-w-3xl mx-auto prose prose-invert">
        <div className="font-mono uppercase text-xs text-primary mb-3">Legal</div>
        <h1 className="text-4xl font-bold">Terms & Conditions</h1>
        <p className="text-muted-foreground mt-2 font-mono text-xs uppercase">Last updated: May 2026</p>

        <section className="mt-10 space-y-6 text-muted-foreground">
          <div>
            <h2 className="text-xl font-bold text-foreground">1. Acceptance</h2>
            <p>By creating an account on AutoCode, you agree to these terms. If you do not agree, do not use the service.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">2. Account</h2>
            <p>You must provide accurate information and keep your credentials secure. You are responsible for activity on your account. Accounts are for individuals; one account per person.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">3. User content</h2>
            <p>Reviews and comments you post must be honest, lawful, and your own work. You grant AutoCode a non-exclusive license to display the content you post on the site. We may remove content that is abusive, defamatory, spam, or violates these terms.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">4. Project quotes</h2>
            <p>Prices shown by the calculator and packages are estimates. Final pricing is confirmed in a written quote before any work begins.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">5. Termination</h2>
            <p>We may suspend or delete accounts that violate these terms. You may delete your account at any time by contacting us.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">6. Liability</h2>
            <p>The service is provided "as is" without warranties. To the maximum extent permitted by law, AutoCode is not liable for indirect or consequential damages.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">7. Contact</h2>
            <p>Questions about these terms: autocode.business@gmail.com</p>
          </div>
        </section>
      </article>
    </main>
  );
}