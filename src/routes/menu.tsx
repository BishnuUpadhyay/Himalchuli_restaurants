import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import dishTikka from "@/assets/dish-tikka.jpg";
import dishMomo from "@/assets/dish-momo.jpg";
import dishSekuwa from "@/assets/dish-sekuwa.jpg";
import dishSamosa from "@/assets/dish-samosa.jpg";
import dishPaneer from "@/assets/dish-paneer.jpg";
import dishGobi from "@/assets/dish-gobi.jpg";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Himalchuli Bar & Grill" },
      { name: "description", content: "Explore our full menu of Nepalese, Tibetan and Indian dishes: momos, tandoor, curries, biryanis and more." },
      { property: "og:title", content: "Menu — Himalchuli Bar & Grill" },
      { property: "og:description", content: "Nepalese, Tibetan & Indian dishes — from momos to tandoor." },
    ],
  }),
  component: MenuPage,
});

type Item = { name: string; price: string; desc: string; img?: string; tag?: string };

const menu: Record<string, Item[]> = {
  Starters: [
    { name: "Chicken 65", price: "$11.99", desc: "Spicy South Indian style crispy chicken tossed with curry leaves.", img: dishSekuwa },
    { name: "Gobi Manchurian", price: "$10.99", desc: "Vegan crispy cauliflower in Indo-Chinese garlic-chili sauce.", img: dishGobi, tag: "Vegan" },
    { name: "Samosa Chat", price: "$7.99", desc: "Crushed samosas topped with yogurt, chutneys, and pomegranate.", img: dishSamosa },
    { name: "Mix Vegetarian Pakora", price: "$6.99", desc: "Assorted vegetable fritters dipped in garbanzo batter.", tag: "Vegan" },
  ],
  "Momos & Nepali Specials": [
    { name: "Chicken Momo (Steamed)", price: "$11.99", desc: "Hand-folded steamed dumplings with tomato-sesame achar.", img: dishMomo },
    { name: "Buff Momo", price: "$12.99", desc: "Traditional Nepali water buffalo dumplings, richly spiced." },
    { name: "Vegetable Momo", price: "$10.99", desc: "Cabbage, carrot and paneer momos with spicy dip.", tag: "Veg" },
    { name: "Sekuwa Chicken", price: "$12.99", desc: "Nepali grilled chicken marinated with Himalayan herbs.", img: dishSekuwa },
    { name: "Thukpa Noodle Soup", price: "$13.99", desc: "Tibetan hand-pulled noodles in aromatic broth." },
  ],
  "Tandoor & Grill": [
    { name: "Tandoori Chicken (Half)", price: "$14.99", desc: "Overnight yogurt-marinated chicken from the clay oven." },
    { name: "Seekh Kebab", price: "$13.99", desc: "Minced lamb skewers with fresh herbs." },
    { name: "Paneer Tikka", price: "$12.99", desc: "Charred paneer with peppers and onion.", tag: "Veg" },
  ],
  Curries: [
    { name: "Butter Chicken", price: "$16.99", desc: "Creamy tomato butter chicken.", img: dishTikka },
    { name: "Chicken Curry", price: "$15.99", desc: "Traditional chicken curry with onion-tomato sauce." },
    { name: "Paneer Tikka Masala", price: "$15.99", desc: "Grilled paneer cubes in creamy tomato onion sauce.", img: dishPaneer, tag: "Veg" },
    { name: "Vegetable Vindaloo", price: "$14.99", desc: "Spicy tangy Goan-style curry.", tag: "Vegan" },
    { name: "Vegetable Curry", price: "$13.99", desc: "Seasonal vegetables in onion-tomato gravy.", tag: "Vegan" },
  ],
  "Breads & Rice": [
    { name: "Garlic Naan", price: "$3.99", desc: "Clay-oven flatbread brushed with garlic butter." },
    { name: "Plain Basmati Rice", price: "$3.49", desc: "Fluffy long-grain rice." },
    { name: "Chicken Biryani", price: "$16.99", desc: "Fragrant basmati layered with spiced chicken." },
  ],
};

const categories = Object.keys(menu);

function MenuPage() {
  const [active, setActive] = useState(categories[0]);
  const items = menu[active];

  return (
    <>
      <section className="bg-surface py-20 text-center">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-primary">Our Menu</p>
        <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-wide text-white md:text-6xl">Explore the Flavors</h1>
        <p className="mx-auto mt-4 max-w-xl px-4 text-white/70">A curated selection of Himalayan and Indian classics.</p>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={
                "rounded-full border px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition " +
                (active === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary hover:text-primary")
              }
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {items.map((i) => (
            <div key={i.name} className="flex gap-5 rounded-xl border border-border bg-card p-5 shadow-sm">
              {i.img ? (
                <img src={i.img} alt={i.name} width={200} height={200} loading="lazy" className="h-24 w-24 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="grid h-24 w-24 shrink-0 place-items-center rounded-lg bg-secondary text-primary font-display text-2xl">✦</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold uppercase tracking-wide">{i.name}</h3>
                  <span className="font-display text-lg font-bold text-primary">{i.price}</span>
                </div>
                {i.tag && <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">{i.tag}</span>}
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{i.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}