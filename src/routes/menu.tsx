import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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

type Item = { name: string; price: string; desc: string; tag?: string };

const menu: Record<string, Item[]> = {
  Appetizers: [
    { name: "Lentil Soup", price: "$5.99", desc: "" },
    { name: "Vegetable Samosa", price: "$5.99", desc: "" },
    { name: "Mixed Veg Pakoda", price: "$7.99", desc: "" },
    { name: "Samosa Chat", price: "$11.99", desc: "" },
    { name: "Gobi Manchurian", price: "$11.99", desc: "" },
    { name: "Chicken 65", price: "$13.99", desc: "" },
  ],
  Nepalese_Cuisine: [
    { name: "Veg Chowmein", price: "$13.99", desc: "" },
    { name: "Chicken Chowmein", price: "$15.99", desc: "" },
    { name: "Shrimp Chowmein", price: "$16.99", desc: "" },
    { name: "Chicken Sekuwa", price: "$15.99", desc: "" },
    { name: "Chicken Choila", price: "$15.99", desc: "" },
    { name: "Steamed Veg Momo", price: "$15.99", desc: "Preparation: Steamed" },
    { name: "Fried Veg Momo", price: "$16.99", desc: "Preparation: Fried" },
    { name: "Chilli Veg Momo", price: "$17.99", desc: "Preparation: Chilli" },
    { name: "Steamed Chicken Momo", price: "$15.99", desc: "Preparation: Steamed" },
    { name: "Fried Chicken Momo", price: "$17.99", desc: "Preparation: Fried" },
    { name: "Chilli Chicken Momo", price: "$18.99", desc: "Preparation: Chilli" },
    { name: "Mustang Aloo", price: "$11.99", desc: "" }
  ],
  Tandoori_Entrees: [
    { name: "Tandoori Chicken", price: "$18.99", desc: "" },
    { name: "Chicken Tikka", price: "$18.99", desc: "" },
    { name: "Tandoori Salmon", price: "$24.99", desc: "" },
    { name: "Lamb Chop", price: "$24.99", desc: "" },
    { name: "Tandoori Shrimp", price: "$20.99", desc: "" },
    { name: "Paneer Tikka Tandoor", price: "$21.99", desc: "" }
  ],
  Vegetable_Entrees: [
    { name: "Vegetable Korma", price: "$16.99", desc: "" },
    { name: "Paneer Tikka Masala", price: "$18.99", desc: "" },
    { name: "Saag Paneer", price: "$16.99", desc: "" },
    { name: "Chana Saag", price: "$16.99", desc: "" },
    { name: "Chana Masala", price: "$15.99", desc: "" },
    { name: "Bhindi Masala", price: "$15.99", desc: "" },
    { name: "Baigan Bharta", price: "$15.99", desc: "" },
    { name: "Dal Makhani", price: "$16.99", desc: "" },
    { name: "Dal Tadka", price: "$15.99", desc: "" },
    { name: "Aloo Gobi", price: "$15.99", desc: "" },
    { name: "Vegetable Vindaloo", price: "$15.99", desc: "" },
    { name: "Veg Curry", price: "$15.99", desc: "" }
  ],
  Chicken_Entrees: [
    { name: "Chicken Curry", price: "$17.99", desc: "" },
    { name: "Butter Chicken", price: "$18.99", desc: "" },
    { name: "Chicken Tikka Masala", price: "$18.99", desc: "" },
    { name: "Chicken Vindaloo", price: "$17.99", desc: "" },
    { name: "Chicken with Veg Curry", price: "$17.99", desc: "" },
    { name: "Chicken Madras", price: "$17.99", desc: "" },
    { name: "Chicken Korma", price: "$17.99", desc: "" },
    { name: "Chicken Saag", price: "$18.99", desc: "" },
    { name: "Chicken Dhansak Korma", price: "$17.99", desc: "" }
  ],
  Lamb_Entrees: [
    { name: "Lamb Curry", price: "$19.99", desc: "" },
    { name: "Lamb Vindaloo", price: "$19.99", desc: "" },
    { name: "Lamb Korma", price: "$19.99", desc: "" },
    { name: "Lamb Saag", price: "$20.99", desc: "" },
    { name: "Lamb with Veg Curry", price: "$19.99", desc: "" },
    { name: "Lamb Tikka Masala", price: "$20.99", desc: "" },
    { name: "Lamb Madras", price: "$19.99", desc: "" }
  ],
  Shrimp_Entrees: [
    { name: "Shrimp Curry", price: "$20.99", desc: "" },
    { name: "Shrimp with Veg Curry", price: "$20.99", desc: "" },
    { name: "Shrimp Madras", price: "$20.99", desc: "" },
    { name: "Shrimp Vindaloo", price: "$20.99", desc: "" },
    { name: "Shrimp Korma", price: "$20.99", desc: "" },
    { name: "Shrimp Masala", price: "$21.99", desc: "" }
  ],
  Biryani_And_Rice: [
    { name: "Plain White Rice", price: "$4.00", desc: "" },
    { name: "Vegetable Biryani", price: "$16.99", desc: "" },
    { name: "Chicken Biryani", price: "$17.99", desc: "" },
    { name: "Lamb Biryani", price: "$19.99", desc: "" },
    { name: "Shrimp Biryani", price: "$20.99", desc: "" }
  ],
  Breads: [
    { name: "Naan", price: "$4.00", desc: "" },
    { name: "Garlic Naan", price: "$5.00", desc: "" },
    { name: "Coconut Naan", price: "$5.50", desc: "" },
    { name: "Aloo Naan", price: "$5.00", desc: "" },
    { name: "Onion Kulcha", price: "$5.00", desc: "" },
    { name: "Roti", price: "$4.00", desc: "" },
    { name: "Aloo Paratha", price: "$5.00", desc: "" },
    { name: "Lachha Paratha", price: "$5.00", desc: "" },
    { name: "Bread Basket", price: "$14.00", desc: "" }
  ],
  Desserts: [
    { name: "Gulab Jamun", price: "$5.00", desc: "" },
    { name: "Kheer", price: "$5.00", desc: "" },
    { name: "Gajar Halwa", price: "$6.00", desc: "" }
  ],
  Beverages: [
    { name: "Soda Can", price: "$2.00", desc: "" },
    { name: "Mango Lassi", price: "$4.99", desc: "" },
    { name: "Milk Tea", price: "$3.50", desc: "" },
    { name: "Black Tea", price: "$2.99", desc: "" }
  ],
  Sauces_And_Pickles: [
    { name: "Tamarind Sauce, 8 oz.", price: "$4.99", desc: "" },
    { name: "Green Chutney, 8 oz.", price: "$4.99", desc: "" },
    { name: "Mango Chutney, 8 oz.", price: "$4.99", desc: "" },
    { name: "Raita, 8 oz.", price: "$4.00", desc: "" }
  ]
};

const categories = Object.keys(menu);

function MenuPage() {
  const [active, setActive] = useState(categories[0]);
  const items = menu[active];

  const formatLabel = (str: string) =>
    str.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (char: string) => char.toUpperCase());

  return (
    <>
      {/* Hero Section */}
      <section className="bg-surface py-20 text-center">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-primary">
          Our Menu
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-wide text-white md:text-6xl">
          Explore the Flavors
        </h1>
        <p className="mx-auto mt-4 max-w-xl px-4 text-white/70">
          A curated selection of Himalayan and Indian classics.
        </p>
      </section>

      {/* Main Menu Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        {/* Category Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none md:flex-wrap md:justify-center">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={
                "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition md:px-5 md:py-2.5 " +
                (active === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary hover:text-primary")
              }
            >
              {formatLabel(c)}
            </button>
          ))}
        </div>

        {/* Menu Items Grid with Leader Lines */}
        <div className="mt-12 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {items.map((i) => (
            <div key={i.name} className="flex flex-col">
              <div className="flex w-full items-baseline">
                {/* Item Name */}
                <h3 className="shrink-0 font-display text-lg font-semibold uppercase tracking-wide text-foreground">
                  {i.name}
                </h3>

                {/* Dotted Leader Line */}
                <div className="relative top-[-4px] mx-2 flex-grow border-b-2 border-dotted border-border" />

                {/* Price */}
                <div className="shrink-0 font-display text-lg font-bold text-primary">
                  {i.price}
                </div>
              </div>

              {/* Tag / Description */}
              {i.tag && (
                <span className="mt-1 w-max rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {i.tag}
                </span>
              )}
              {i.desc && (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {i.desc}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}