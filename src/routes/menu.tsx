import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import dishTikka from "@/assets/dish-tikka.jpg";
import dishMomo from "@/assets/dish-momo.jpg";
import dishSekuwa from "@/assets/dish-sekuwa.jpg";
import dishSamosa from "@/assets/dish-samosa.jpg";
import dishPaneer from "@/assets/dish-paneer.jpg";
import dishGobi from "@/assets/dish-gobi.jpg";
import dishdefault from "@/assets/dish-default.png";

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
  // Starters: [
  //   { name: "Chicken 65", price: "$11.99", desc: "Spicy South Indian style crispy chicken tossed with curry leaves.", img: dishSekuwa },
  //   { name: "Gobi Manchurian", price: "$10.99", desc: "Vegan crispy cauliflower in Indo-Chinese garlic-chili sauce.", img: dishGobi, tag: "Vegan" },
  //   { name: "Samosa Chat", price: "$7.99", desc: "Crushed samosas topped with yogurt, chutneys, and pomegranate.", img: dishSamosa },
  //   { name: "Mix Vegetarian Pakora", price: "$6.99", desc: "Assorted vegetable fritters dipped in garbanzo batter.", tag: "Vegan" },
  // ],
 Appetizers: [
  { name: "Lentil Soup", price: "$7.99", desc: "Mixed red and black lentils cooked in Indian herbs and spices", tag: "Veg, VN, GF", img: dishdefault },
  { name: "Vegetable Samosa", price: "$6.99", desc: "Triangular Indian pastries stuffed with potatoes, green peas, mild herbs and spices", tag: "VN, Veg", img: dishdefault },
  { name: "Mixed Veg Pakoda", price: "$8.99", desc: "Crispy, deep-fried Indian fritters, shredded vegetables dipped in a chickpea flour batter", tag: "VN, GF, Veg", img: dishdefault },
  { name: "Mustang Aaloo", price: "$8.99", desc: "Boiled potatoes tossed with butter, oil and Nepalese herbs and spices", tag: "GF, Veg", img: dishdefault },
  { name: "Spinach Chat", price: "$9.99", desc: "Crispy, deep-fried Indian fritters, dipped in a chickpea flour batter", tag: "VN, Veg, GF", img: dishdefault },
  { name: "Govi Manchurian", price: "$10.99", desc: "Crispy cauliflower tossed in a spicy, sweet and tangy sauce with soy sauce, vinegar and chilli sauce", tag: "Veg, VN", img: dishdefault },
  { name: "Chicken 65", price: "$12.99", desc: "Crispy chicken with mustard seeds, whole chilli peppers, fresh garlic, ginger, curry leaf, chopped onion and cilantro", tag: "VN", img: dishdefault },
],
Nepalese_Cuisine: [
  { name: "Veg Chaumin", price: "$13.99", desc: "Shredded vegetables and noodles cooked with herbs and spices", img: dishdefault },
  { name: "Lamb Chaumin", price: "$16.99", desc: "Tender lamb and noodles cooked with herbs and spices", img: dishdefault },
  { name: "Chicken Chaumin", price: "$15.99", desc: "Tender chicken and noodles cooked with herbs and spices", img: dishdefault },
  { name: "Shrimp Chaumin", price: "$17.99", desc: "Tiger shrimp and noodles cooked with herbs and spices", img: dishdefault },
  { name: "Chicken Sekuwa", price: "$15.99", desc: "Marinated chicken skewered and grilled in tandoor oven", tag: "VN, GF", img: dishdefault },
  { name: "Chicken Choilla", price: "$15.99", desc: "Grilled chicken tossed with mustard oil, fenugreek seeds, green chilli, spring onion and turmeric; mixed with spring onion, Szechuan pepper, sliced ginger, garlic and cilantro", img: dishdefault },
],
Tandoori_Entrees: [
  { name: "Chicken Chilli", price: "$16.99", desc: "Crispy chicken cooked with onion, colored bell pepper, garlic, herbs and spices", img: dishdefault },
  { name: "Tandoori Chicken", price: "$17.99", desc: "Half chicken marinated in herbs, spices, mustard oil and yogurt; serve with grilled onion and bell peppers", tag: "GF", img: dishdefault },
  { name: "Chicken Tikka", price: "$16.99", desc: "Boneless chicken pieces marinated in herbs, spices, mustard oil and sour cream; serve with grilled onion and bell peppers", tag: "GF", img: dishdefault },
  { name: "Tandoori Salmon", price: "$21.99", desc: "Salmon marinated in herbs, spices, mustard oil and sour cream; serve with grilled onion and bell peppers", tag: "GF", img: dishdefault },
  { name: "Lamb Seekh Kebab", price: "$18.99", desc: "Minced lamb marinated with ginger, garlic paste, herbs and spices", tag: "GF", img: dishdefault },
  { name: "Tandoori Shrimp", price: "$19.99", desc: "Shrimp marinated in herbs, spices, mustard oil and sour cream; serve with grilled onion and bell peppers", img: dishdefault },
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