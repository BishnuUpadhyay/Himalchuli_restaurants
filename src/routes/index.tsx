import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { UtensilsCrossed, ChefHat, ShoppingBag, HeartHandshake, Star } from "lucide-react";
import heroMomo from "@/assets/hero-momo.jpg";
import heroInterior from "@/assets/hero-interior.jpg";
import dishTikka from "@/assets/dish-tikka.jpg";
import dishMomo from "@/assets/dish-momo.jpg";
import dishSekuwa from "@/assets/dish-sekuwa.jpg";
import dishSamosa from "@/assets/dish-samosa.jpg";
import dishPaneer from "@/assets/dish-paneer.jpg";
import dishGobi from "@/assets/dish-gobi.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const features = [
  { icon: ChefHat, title: "Master Chefs", body: "Decades of expertise in authentic Nepalese, Tibetan and Indian cuisine." },
  { icon: UtensilsCrossed, title: "Quality Food", body: "Hand-ground mountain spices, fresh local produce, premium halal meats." },
  { icon: ShoppingBag, title: "Online Order", body: "Enjoy Himalayan flavors at home with quick, seamless online ordering." },
  { icon: HeartHandshake, title: "Himalayan Hospitality", body: "Warm dine-in service and professional event catering." },
];

const popular = [
  { img: dishMomo, name: "Chicken Momo", price: "$11.99", desc: "Hand-folded steamed dumplings with tomato-sesame achar." },
  { img: dishSekuwa, name: "Sekuwa Chicken", price: "$12.99", desc: "Nepali grilled chicken marinated in Himalayan herbs." },
  { img: dishSamosa, name: "Samosa Chat", price: "$7.99", desc: "Crushed samosas topped with yogurt, chutneys and pomegranate." },
  { img: dishTikka, name: "Butter Chicken", price: "$16.99", desc: "Tender chicken in a rich, creamy tomato butter sauce." },
  { img: dishPaneer, name: "Paneer Tikka Masala", price: "$15.99", desc: "Grilled paneer cubes in a spiced tomato-onion gravy." },
  { img: dishGobi, name: "Gobi Manchurian", price: "$10.99", desc: "Crispy cauliflower in Indo-Chinese garlic-chili sauce." },
];

const testimonials = [
  { name: "Anita R.", role: "Food Blogger", quote: "The momos are the best I've had outside Kathmandu. Warm service, authentic flavors." },
  { name: "Marcus D.", role: "Regular Guest", quote: "The sekuwa and butter chicken are unbeatable. My weekly go-to in DC." },
  { name: "Priya S.", role: "Yelp Reviewer", quote: "Every dish tastes like it was cooked by someone's grandmother — in the best way." },
];

function Index() {
  return (
    <>
      {/* Hero */}
      <section className=" relative isolate overflow-hidden bg-surface">
        <img
          src={heroMomo}
          alt="Steaming Nepali momos on a wooden board"
          width={1600}
          height={900}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/70 to-surface/20" />
        <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col justify-center px-4 py-24 md:px-8">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-primary">Nepalese & Indian Cuisine</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold uppercase leading-tight tracking-wide text-white md:text-7xl">
            Himalchuli <br /> <span className="text-primary">Bar &amp; Grill</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
            Authentic Himalayan & Indian cuisine with rich, complex flavors and hand-crafted fresh ingredients.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/menu" className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90">
              View Menu
            </Link>
            <Link to="/booking" className="rounded-full border border-white/30 bg-white/5 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white backdrop-blur transition hover:bg-white hover:text-surface">
              Book a Table
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto mt-16 grid max-w-7xl gap-6 px-4 md:grid-cols-2 md:px-8 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-card p-8 shadow-lg">
            <f.icon className="h-10 w-10 text-primary" />
            <h3 className="mt-5 font-display text-xl font-semibold uppercase tracking-wide">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </section>

      {/* About */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-24 md:grid-cols-2 md:px-8">
        <img src={heroInterior} alt="Cozy Himalchuli Bar & Grill dining room" width={800} height={600} loading="lazy" className="rounded-2xl object-cover shadow-xl" />
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-primary">About Us</p>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">Welcome to Himalchuli Bar & Grill</h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Bringing the true essence of Himalayan hospitality to Washington DC, Himalchuli Bar & Grill offers an authentic culinary journey through the vibrant flavors of Nepal, Tibet, and India. Named after Himalchuli, the seventh-highest mountain in the world rising in the Nepalese Himalayas, our kitchen blends time-honored family recipes with traditional mountain cooking.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            From meticulously hand-folded momos to the deep, smoky notes of our clay tandoor, every dish is crafted with purpose — hand-ground spices, fresh produce and heritage techniques for a perfect balance of comfort and flavor.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <div className="font-display text-5xl font-bold text-primary">15+</div>
              <div className="mt-1 text-sm uppercase tracking-wider text-muted-foreground">Years of Experience</div>
            </div>
            <div>
              <div className="font-display text-5xl font-bold text-primary">50+</div>
              <div className="mt-1 text-sm uppercase tracking-wider text-muted-foreground">Signature Dishes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu highlights */}
      <section className="bg-secondary/40 py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-primary">Food Menu</p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">Most Popular Items</h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {popular.map((d) => (
              <article key={d.name} className="group overflow-hidden rounded-xl bg-card shadow-md transition hover:shadow-2xl">
                <div className="overflow-hidden">
                  <img src={d.img} alt={d.name} width={800} height={600} loading="lazy" className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold uppercase tracking-wide">{d.name}</h3>
                    <span className="font-display text-lg font-bold text-primary">{d.price}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.desc}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/menu" className="inline-block rounded-full bg-primary px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90">
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="relative isolate overflow-hidden bg-surface py-24">
        <img src={heroInterior} alt="" aria-hidden width={1600} height={900} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="relative mx-auto max-w-3xl px-4 text-center md:px-8">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-primary">Reservation</p>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide text-white md:text-5xl">Book a Table Online</h2>
          <p className="mt-5 text-white/80">Reserve your spot for an unforgettable Himalayan evening. Walk-ins welcome too.</p>
          <Link to="/booking" className="mt-8 inline-block rounded-full bg-primary px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90">
            Reserve Now
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-primary">Testimonials</p>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">Our Guests Say</h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <div className="flex gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <blockquote className="mt-4 text-muted-foreground">"{t.quote}"</blockquote>
              <figcaption className="mt-6">
                <div className="font-display text-lg font-semibold uppercase tracking-wide">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
