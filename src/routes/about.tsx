import { createFileRoute } from "@tanstack/react-router";
import heroInterior from "@/assets/hero-interior.jpg";
import heroTandoor from "@/assets/hero-tandoor.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Himalchuli Bar & Grill" },
      { name: "description", content: "Our story: bringing authentic Himalayan and Indian cuisine to Washington DC with heritage recipes and hand-ground spices." },
      { property: "og:title", content: "About Himalchuli Bar & Grill" },
      { property: "og:description", content: "Our story: Himalayan hospitality in the heart of DC." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-surface py-24">
        <img src={heroTandoor} alt="" aria-hidden width={1600} height={900} className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-8">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-primary">About Us</p>
          <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-wide text-white md:text-6xl">Our Story</h1>
          <p className="mt-6 text-lg leading-relaxed text-white/80">
            A family-run kitchen bringing the flavors of the Himalayas to Washington DC.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-24 md:grid-cols-2 md:px-8">
        <img src={heroInterior} alt="Restaurant interior" width={800} height={600} loading="lazy" className="rounded-2xl object-cover shadow-xl" />
        <div>
          <h2 className="font-display text-4xl font-bold uppercase tracking-wide">Rooted in tradition, grown with love</h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Himalchuli Bar & Grill was born from a simple dream: to share the warmth of Himalayan hospitality and the depth of Nepalese cooking with our community in DC. Every recipe on our menu traces back generations — passed from grandmothers to mothers to our chefs today.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            We source premium halal meats, seasonal produce, and hand-grind our spice blends daily. Our clay tandoor runs from morning to close, delivering the smoky, blistered breads and kebabs you'd find in a Kathmandu alley bhojanalaya.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Whether it's a first date, a family celebration, or a quiet weeknight, we want every guest to leave feeling nourished — and part of our extended family.
          </p>
        </div>
      </section>

      {/* <section className="bg-secondary/40 py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-3 md:px-8">
          {[
            { n: "15+", l: "Years of Experience" },
            { n: "50+", l: "Signature Dishes" },
            { n: "10k+", l: "Happy Guests" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
              <div className="font-display text-6xl font-bold text-primary">{s.n}</div>
              <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section> */}
    </>
  );
}