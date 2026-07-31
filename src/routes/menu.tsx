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
  Appetizers: [
    { name: "Lentil Soup", price: "$5.99", desc: "", img: dishdefault },
    { name: "Vegetable Samosa", price: "$5.99", desc: "", img: dishdefault },
    { name: "Mixed Veg Pakoda", price: "$7.99", desc: "", img: dishdefault },
    { name: "Samosa Chat", price: "$11.99", desc: "", img: dishdefault },
    { name: "Gobi Manchurian", price: "$11.99", desc: "", img: dishdefault },
    { name: "Chicken 65", price: "$13.99", desc: "", img: dishdefault },
    { name: "Chicken Chilli", price: "$13.99", desc: "", img: dishdefault }
  ],

  Nepalese_Cuisine: [
    { name: "Veg Chowmein", price: "$13.99", desc: "", img: dishdefault },
    { name: "Chicken Chowmein", price: "$15.99", desc: "", img: dishdefault },
    { name: "Shrimp Chowmein", price: "$16.99", desc: "", img: dishdefault },
    { name: "Chicken Sekuwa", price: "$15.99", desc: "", img: dishdefault },
    { name: "Chicken Choila", price: "$15.99", desc: "", img: dishdefault },
    { name: "Steamed Veg Momo", price: "$15.99", desc: "Preparation: Steamed", img: dishdefault },
    { name: "Fried Veg Momo", price: "$16.99", desc: "Preparation: Fried", img: dishdefault },
    { name: "Chilli Veg Momo", price: "$17.99", desc: "Preparation: Chilli", img: dishdefault },
    { name: "Steamed Chicken Momo", price: "$15.99", desc: "Preparation: Steamed", img: dishdefault },
    { name: "Fried Chicken Momo", price: "$17.99", desc: "Preparation: Fried", img: dishdefault },
    { name: "Chilli Chicken Momo", price: "$18.99", desc: "Preparation: Chilli", img: dishdefault },
    { name: "Mustang Aloo", price: "$11.99", desc: "", img: dishdefault }
  ],

  Tandoori_Entrees: [
    { name: "Tandoori Chicken", price: "$18.99", desc: "", img: dishdefault },
    { name: "Chicken Tikka", price: "$18.99", desc: "", img: dishdefault },
    { name: "Tandoori Salmon", price: "$24.99", desc: "", img: dishdefault },
    { name: "Lamb Chop", price: "$24.99", desc: "", img: dishdefault },
    { name: "Tandoori Shrimp", price: "$20.99", desc: "", img: dishdefault },
    { name: "Paneer Tikka Tandoor", price: "$21.99", desc: "", img: dishdefault }
  ],

  Vegetable_Entrees: [
    { name: "Vegetable Korma", price: "$16.99", desc: "", img: dishdefault },
    { name: "Paneer Tikka Masala", price: "$18.99", desc: "", img: dishdefault },
    { name: "Saag Paneer", price: "$16.99", desc: "", img: dishdefault },
    { name: "Chana Saag", price: "$16.99", desc: "", img: dishdefault },
    { name: "Chana Masala", price: "$15.99", desc: "", img: dishdefault },
    { name: "Bhindi Masala", price: "$15.99", desc: "", img: dishdefault },
    { name: "Baigan Bharta", price: "$15.99", desc: "", img: dishdefault },
    { name: "Dal Makhani", price: "$16.99", desc: "", img: dishdefault },
    { name: "Dal Tadka", price: "$15.99", desc: "", img: dishdefault },
    { name: "Aloo Gobi", price: "$15.99", desc: "", img: dishdefault },
    { name: "Vegetable Vindaloo", price: "$15.99", desc: "", img: dishdefault },
    { name: "Veg Curry", price: "$15.99", desc: "", img: dishdefault }
  ],

  Chicken_Entrees: [
    { name: "Chicken Curry", price: "$17.99", desc: "", img: dishdefault },
    { name: "Butter Chicken", price: "$18.99", desc: "", img: dishdefault },
    { name: "Chicken Tikka Masala", price: "$18.99", desc: "", img: dishdefault },
    { name: "Chicken Vindaloo", price: "$17.99", desc: "", img: dishdefault },
    { name: "Chicken with Veg Curry", price: "$17.99", desc: "", img: dishdefault },
    { name: "Chicken Madras", price: "$17.99", desc: "", img: dishdefault },
    { name: "Chicken Korma", price: "$17.99", desc: "", img: dishdefault },
    { name: "Chicken Saag", price: "$18.99", desc: "", img: dishdefault },
    { name: "Chicken Dhansak Korma", price: "$17.99", desc: "", img: dishdefault }
  ],

  Lamb_Entrees: [
    { name: "Lamb Curry", price: "$19.99", desc: "", img: dishdefault },
    { name: "Lamb Vindaloo", price: "$19.99", desc: "", img: dishdefault },
    { name: "Lamb Korma", price: "$19.99", desc: "", img: dishdefault },
    { name: "Lamb Saag", price: "$20.99", desc: "", img: dishdefault },
    { name: "Lamb with Veg Curry", price: "$19.99", desc: "", img: dishdefault },
    { name: "Lamb Tikka Masala", price: "$20.99", desc: "", img: dishdefault },
    { name: "Lamb Madras", price: "$19.99", desc: "", img: dishdefault }
  ],

  Shrimp_Entrees: [
    { name: "Shrimp Curry", price: "$20.99", desc: "", img: dishdefault },
    { name: "Shrimp with Veg Curry", price: "$20.99", desc: "", img: dishdefault },
    { name: "Shrimp Madras", price: "$20.99", desc: "", img: dishdefault },
    { name: "Shrimp Vindaloo", price: "$20.99", desc: "", img: dishdefault },
    { name: "Shrimp Korma", price: "$20.99", desc: "", img: dishdefault },
    { name: "Shrimp Masala", price: "$21.99", desc: "", img: dishdefault }
  ],

  Biryani_And_Rice: [
    { name: "Plain White Rice", price: "$4.00", desc: "", img: dishdefault },
    { name: "Vegetable Biryani", price: "$16.99", desc: "", img: dishdefault },
    { name: "Chicken Biryani", price: "$17.99", desc: "", img: dishdefault },
    { name: "Lamb Biryani", price: "$19.99", desc: "", img: dishdefault },
    { name: "Shrimp Biryani", price: "$20.99", desc: "", img: dishdefault }
  ],

  Breads: [
    { name: "Naan", price: "$4.00", desc: "", img: dishdefault },
    { name: "Garlic Naan", price: "$5.00", desc: "", img: dishdefault },
    { name: "Coconut Naan", price: "$5.50", desc: "", img: dishdefault },
    { name: "Aloo Naan", price: "$5.00", desc: "", img: dishdefault },
    { name: "Onion Kulcha", price: "$5.00", desc: "", img: dishdefault },
    { name: "Roti", price: "$4.00", desc: "", img: dishdefault },
    { name: "Aloo Paratha", price: "$5.00", desc: "", img: dishdefault },
    { name: "Lachha Paratha", price: "$5.00", desc: "", img: dishdefault },
    { name: "Bread Basket", price: "$14.00", desc: "", img: dishdefault }
  ],

  Desserts: [
    { name: "Gulab Jamun", price: "$5.00", desc: "", img: dishdefault },
    { name: "Kheer", price: "$5.00", desc: "", img: dishdefault },
    { name: "Gajar Halwa", price: "$6.00", desc: "", img: dishdefault }
  ],

  Beverages: [
    { name: "Soda Can", price: "$2.00", desc: "", img: dishdefault },
    { name: "Mango Lassi", price: "$4.99", desc: "", img: dishdefault },
    { name: "Milk Tea", price: "$3.50", desc: "", img: dishdefault },
    { name: "Black Tea", price: "$2.99", desc: "", img: dishdefault }
  ],

  Sauces_And_Pickles: [
    { name: "Tamarind Sauce, 8 oz.", price: "$4.99", desc: "", img: dishdefault },
    { name: "Green Chutney, 8 oz.", price: "$4.99", desc: "", img: dishdefault },
    { name: "Mango Chutney, 8 oz.", price: "$4.99", desc: "", img: dishdefault },
    { name: "Raita, 8 oz.", price: "$4.00", desc: "", img: dishdefault }
  ]
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