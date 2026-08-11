import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { UtensilsCrossed, ChefHat, ShoppingBag, HeartHandshake, Star, Instagram, Facebook} from "lucide-react";
import heroMomo from "@/assets/hero-momo.jpg";
import heroInterior from "@/assets/hero-interior.jpg";
import dishTikka from "@/assets/dish-tikka.jpg";
import dishMomo from "@/assets/dish-momo.jpg";
import dishSekuwa from "@/assets/dish-sekuwa.jpg";
import dishSamosa from "@/assets/dish-samosa.jpg";
import dishPaneer from "@/assets/dish-paneer.jpg";
import dishGobi from "@/assets/dish-gobi.jpg";
import dishdefault from "@/assets/dish-default.png";

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
{ name: "Chicken Momo",price: "From $17.99", desc: "Chicken stuffed dumplings seasoned with Nepalese herbs and spices. Style choices: Steamed (+$0), Fried (+$1), Chilli (+$2)." },  { name: "Goat Curry", price: "$20.99", tag: "", desc: "Tender goat meat slow-cooked in a rich, aromatic gravy of caramelized onions, garlic, ginger, and traditional whole spices.", img: dishdefault },
{name: "Tandoori Chicken", price: "$20.99", tag: "", desc: "Half chicken marinated in herbs, spices, mustard oil, and yogurt. Served with grilled onion and bell peppers on a sizzling hot plate.", img: dishdefault },
{ name: "Chowmein",  price: "From $16.99", desc: "Shredded fresh vegetables and noodles cooked with herbs and spices. Protein choices: Veg (+$0), Chicken (+$1), Shrimp (+$3), Lamb (+$4)." },  { name: "Samosa Chaat", price: "$12.99", tag: "", desc: "Crispy potato samosas crushed over warm chickpea curry, layered with yogurt, tamarind and mint chutneys, and topped with sev, onions, and cilantro.", img: dishdefault },
{ name: "Gobi Manchurian",price: "$12.99", tag: "Veg, VN", desc: "Crispy cauliflower tossed in a spicy sweet and tangy sauce with soy sauce, vinegar and chilli sauce.",  img: dishdefault }
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
          className="absolute inset-0 h-full w-full object-cover opacity-60 "
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
            Bringing the true essence of Himalayan hospitality to Haverhill, MA, Himalchuli Bar & Grill offers an authentic culinary journey through the vibrant flavors of Nepal, Tibet, and India. Named after Himalchuli, the seventh-highest mountain in the world rising in the Nepalese Himalayas, our kitchen blends time-honored family recipes with traditional mountain cooking.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            From meticulously hand-folded momos to the deep, smoky notes of our clay tandoor, every dish is crafted with purpose — hand-ground spices, fresh produce and heritage techniques for a perfect balance of comfort and flavor.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6">
            {/* <div>
              <div className="font-display text-5xl font-bold text-primary">15+</div>
              <div className="mt-1 text-sm uppercase tracking-wider text-muted-foreground">Years of Experience</div>
            </div>
            <div>
              <div className="font-display text-5xl font-bold text-primary">50+</div>
              <div className="mt-1 text-sm uppercase tracking-wider text-muted-foreground">Signature Dishes</div>
            </div> */}
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

      {/* Menu highlights */}
      <section className="bg-secondary/40 py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-primary">
              Food Menu
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">
              Most Popular Items
            </h2>
          </div>

          {/* Menu Items Grid with Dotted Leader Lines */}
          <div className="mt-14 grid gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {popular.map((d) => (
              <div key={d.name} className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm">
                <div>
                  <div className="flex w-full items-baseline">
                    {/* Item Name */}
                    <h3 className="shrink-0 font-display text-lg font-semibold uppercase tracking-wide text-foreground">
                      {d.name}
                    </h3>

                    {/* Dotted Leader Line */}
                    <div className="relative top-[-4px] mx-2 flex-grow border-b-2 border-dotted border-border" />

                    {/* Price */}
                    <div className="shrink-0 font-display text-lg font-bold text-primary">
                      {d.price}
                    </div>
                  </div>

                  {/* Optional Tag */}
                  {d.tag && (
                    <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {d.tag}
                    </span>
                  )}

                  {/* Description */}
                  {d.desc && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {d.desc}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Call To Action Button */}
          <div className="mt-12 text-center">
            <Link
              to="/menu"
              className="inline-block rounded-full bg-primary px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90"
            >
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
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
      </section> */}
    </>
  );
}
