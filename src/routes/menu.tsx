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

// type Item = { name: string; price: string; desc: string; tag?: string };

export interface Item {
  name: string;
  price: string;
  desc: string;
  tag?: string;
}

const menu: Record<string, Item[]> = {
  Appetizers: [
    { name: "Mountain Pear Salad", price: "From $13.99", desc: "A refreshing medley of mixed greens, cherry tomatoes, grated carrot, pomegranate seeds, and Asian pear, finished with a light, zesty Nepali-style dressing. Add protein: Veg (+$0) / Chicken (+$2) / Shrimp (+$4) / Salmon (+$6).",tag: ""},    { name: "Lentil Soup", price: "$6.99", desc: "Mixed red and peeled black lentil cooked in Indian herbs & spices. (Veg, VN, G.F)" },
    { name: "Vegetable Samosa", price: "$6.99", desc: "Triangular Indian pastries stuffed with potatoes, green peas, mild herbs & spices. (Veg, VN)" },
    { name: "Mixed Veg. Pakoda", price: "$8.99", desc: "Crispy, deep-fried Indian fritters, shredded vegetables dipped in a chickpea flour batter. (Veg, VN, G.F)" },
    { name: "Crispy Palak Chaat", price: "$12.99", desc: "Deep-fried flash-crisped spinach served with tangy tamarind chutney, cool raita, and fresh mint sauce. (VN, Veg, G.F)" },
    { name: "Samosa Chaat", price: "$12.99", desc: "Crispy potato samosas crushed over warm chickpea curry, layered with yogurt, tamarind and mint chutneys, and topped with sev, onions, and cilantro." },
    { name: "Gobi Manchurian", price: "$12.99", desc: "Crispy cauliflower tossed in a spicy sweet and tangy sauce with soy sauce, vinegar and chilli sauce. (Veg, VN)" },
    { name: "Chicken 65", price: "$14.99", desc: "Crispy chicken with mustard seeds, whole chilli peppers, fresh garlic, ginger, curry leaf, chopped onion and cilantro." },
    { name: "Chicken Chilli", price: "$14.99", desc: "Crispy Chicken cooked with onion, colored bell pepper, garlic, herbs and spices." }
  ],
  "Nepalese Cuisine": [
    { name: "Chowmein", price: "$16.99", desc: "Shredded fresh vegetables and noodles cooked with herbs and spices. (Veg $16.99 / Chicken $17.99 / Shrimp $19.99 / Lamb $20.99)" },
    { name: "Chicken Sekuwa", price: "$12.99", desc: "Marinated chicken skewered and grilled in tandoor oven. (G.F)" },
    { name: "Chicken Choila", price: "$12.99", desc: "Grilled chicken Oil tempered with mustard oil, fenugreek seeds, green chilli, spring onion and spices, mixed with spring onion, Szechuan pepper, sliced ginger, garlic and cilantro. (G.F)" },
    { name: "Mustang Aloo", price: "$12.99", desc: "Boiled potatoes tossed with butter oil and Nepalese herbs and spices. (Veg, G.F)" },
    { name: "Goat Curry", price: "$20.99", desc: "Tender goat meat slow-cooked in a rich, aromatic gravy of caramelized onions, garlic, ginger, and traditional whole spices." },
    { name: "Veg. Momo", price: "From $16.99", desc: "Chopped fresh vegetable stuffed dumplings seasoned with Nepalese herbs and spices. Style options: Steamed (+$0) / Fried (+$1) / Chilli (+$2).",tag: "Veg"},  
    { name: "Chicken Momo", price: "$17.99", desc: "Chicken stuffed steamed dumplings seasoned with Nepalese herbs and spices. (Steamed $17.99 / Fried $18.99 / Chilli $19.99)" }
  ],
  "Tandoori Entrees": [
    { name: "Tandoori Chicken", price: "$20.99", desc: "Half chicken marinated in herbs, spices, mustard oil, and yogurt. Served with grilled onion and bell peppers on a sizzling hot plate. (G.F)" },
    { name: "Chicken Tikka", price: "$20.99", desc: "Tender boneless chicken marinated with aromatic herbs, flavorful spices, mustard oil, and sour cream, then served with grilled onions and bell peppers on a sizzling hot plate. (G.F)" },
    { name: "Tandoori Salmon", price: "$25.99", desc: "Fresh salmon marinated in aromatic herbs, spices, mustard oil, and sour cream, served with grilled onions and bell peppers on a sizzling hot plate. (G.F)" },
    { name: "Lamb Chop", price: "$25.99", desc: "Succulent lamb infused with a flavorful blend of herbs, spices, mustard oil, and sour cream, paired with grilled onions and bell peppers on a sizzling hot plate. (G.F)" },
    { name: "Tandoori Shrimp", price: "$23.99", desc: "Juicy shrimp marinated in a flavorful blend of herbs, spices, mustard oil, and sour cream, served with grilled onions and bell peppers on a sizzling hot plate. (G.F)" },
    { name: "Paneer Tikka Tandoori", price: "$22.99", desc: "Cubes of paneer homemade cheese marinated in herbs, spices, mustard oil, and sour cream. Served with grilled onion and bell peppers on a sizzling hot plate. (Veg, G.F)" }
  ],
  "Vegetable Entrees": [
    { name: "Vegetable Korma", price: "$17.99", desc: "Mixed vegetable simmered in a rich and creamy sauce of cashew nuts with herbs and spices. (Veg, G.F)" },
    { name: "Paneer Tikka Masala", price: "$17.99", desc: "Fried cubes of home made cheese cooked in a delicious creamy tomato and onion sauce. (Veg, G.F)" },
    { name: "Saag Paneer", price: "$17.99", desc: "Baby Spinach & fried cubes of home made cheese in tomato and onion sauce. (Veg, G.F)" },
    { name: "Chana Sag", price: "$17.99", desc: "Fresh spinach and chickpea cooked in onion and tomato sauce. (Veg, G.F)" },
    { name: "Chana Masala", price: "$16.99", desc: "Chick pea cooked in onion and tomato sauce with herbs and spices. (VN, G.F)" },
    { name: "Bhindi Masala", price: "$16.99", desc: "Okra sautéed with onion, tomato, herbs and spices. (VN, G.F)" },
    { name: "Baigan Bhatra", price: "$16.99", desc: "Roasted eggplant cooked with onion, tomato herbs and spices. (VN, G.F)" },
    { name: "Dal Makhani", price: "$17.99", desc: "Black lentils cooked in creamy tomato sauce and with herbs and spices. (G.F)" },
    { name: "Dal Tadka", price: "$17.99", desc: "Mixed lentils sautéed with garlic, cumin seeds and tomato. (VN, G.F)" },
    { name: "Aloo Gobi", price: "$16.99", desc: "Fresh cauliflower and potato cooked with onion, tomato herbs and spices. (VN, G.F)" },
    { name: "Vegetable Vindaloo", price: "$17.99", desc: "Cube cut boiled potato and mixed vegetable cooked in a vindaloo sauce. (VN, G.F)" },
    { name: "Veg. Curry", price: "$16.99", desc: "Mixed veg, cauliflower and broccoli cooked in tomato and onion sauce with herbs and spices. (VN, G.F)" }
  ],
  "Chicken Entrees": [
    { name: "Chicken Curry", price: "$18.99", desc: "Boneless chicken cooked in a onion and tomato with herbs and spices. (G.F)" },
    { name: "Butter Chicken", price: "$19.99", desc: "Grilled boneless chicken cooked in creamy tomato sauce with mild spices. (G.F)" },
    { name: "Chicken Tikka Masala", price: "$19.99", desc: "Grilled boneless chicken cooked in a tomato creamy tomato and onion sauce with mild spices. (G.F)" },
    { name: "Chicken Vindaloo", price: "$18.99", desc: "Boneless chicken and potato cooked in a vindaloo sauce. (G.F)" },
    { name: "Chicken with Veg Curry", price: "$18.99", desc: "Boneless chicken sautéed with fresh vegetables, herbs and spices. (G.F)" },
    { name: "Chiken Madras", price: "$18.99", desc: "Boneless chicken cooked in coconut milk with mustard seeds, whole chilli peppers, curry leaf, herbs and spices. (G.F)" },
    { name: "Chicken Korma", price: "$19.99", desc: "Boneless chicken cooked with cashews in a creamy onion and tomato sauce. (G.F)" },
    { name: "Chicken Sag", price: "$19.99", desc: "Boneless chicken and fresh spinach cooked in an onion and tomato sauce. (G.F)" },
    { name: "Chicken Dhaniya Korma", price: "$19.99", desc: "Boneless chicken cooked with mint chutney in a creamy onion and tomato sauce. (G.F)" }
  ],
  "Lamb Entrees": [
    { name: "Lamb Curry", price: "$20.99", desc: "Boneless lamb cooked in tomato and onion sauce with herbs and spices. (G.F)" },
    { name: "Lamb Vindaloo", price: "$20.99", desc: "Boneless lamb and potato cooked in vindaloo sauce with herbs & spices. (G.F)" },
    { name: "Lamb Korma", price: "$21.99", desc: "Boneless lamb cooked with cashews in creamy onion and tomato sauce. (G.F)" },
    { name: "Lamb Sag", price: "$20.99", desc: "Boneless lamb and fresh spinach cooked in an onion and tomato sauce. (G.F)" },
    { name: "Lamb with Veg. Curry", price: "$20.99", desc: "Boneless lamb sautéed with fresh vegetables, herbs and spices. (G.F)" },
    { name: "Lamb Tikka Masala", price: "$21.99", desc: "Boneless lamb sautéed with creamy tomato and onion sauce. (G.F)" },
    { name: "Lamb Madras", price: "$21.99", desc: "Boneless lamb cooked in coconut milk with mustard seeds, whole chilli pepper, curry leaf, herbs and spices. (G.F)" }
  ],
  "Shrimp Entrees": [
    { name: "Shrimp Curry", price: "$21.99", desc: "Fresh shrimp cooked in tomato and onion with herbs and spices. (G.F)" },
    { name: "Shrimp with Veg. Curry", price: "$21.99", desc: "Fresh shrimp sautéed with fresh vegetables, herbs and spices. (G.F)" },
    { name: "Shrimp Madras", price: "$22.99", desc: "Fresh shrimp cooked in coconut milk with mustard seed, whole chilli pepper, curry leaf, herbs and spices. (G.F)" },
    { name: "Shrimp Vindalo", price: "$21.99", desc: "Fresh shrimp and cube cut boiled potato cooked in vindaloo sauce, herbs & spices. (G.F)" },
    { name: "Shrimp Korma", price: "$22.99", desc: "Fresh shrimp cooked with cashews in a creamy sauce. (G.F)" },
    { name: "Shrimp Masala", price: "$22.99", desc: "Fresh shrimp cooked in creamy tomato and onion sauce with mild herbs and spices. (G.F)" }
  ],

 "Biryani & Rice": [
    { name: "Vegetable Biryani", price: "$16.99", desc: "Basmati rice cooked with mixed vegetable, herbs and spices. (Veg, G.F)" },
    { name: "Chicken Biryani", price: "$17.99", desc: "Basmati rice and tender pieces of chicken cooked with herbs and spices. (G.F)" },
    { name: "Lamb Biryani", price: "$19.99", desc: "Basmati rice and tender pieces of lamb cooked with herbs and spices. (G.F)" },
    { name: "Shrimp Biryani", price: "$20.99", desc: "Basmati rice and shrimp cooked with herbs and spices. (G.F)" }
  ],
  "Naan & Roti": [
    { name: "Naan", price: "$4.99", desc: "Leavened white bread baked in a Tandoor oven." },
    { name: "Garlic Naan", price: "$5.99", desc: "Leavened white bread topped with freshly chopped garlic and cilantro, baked in a Tandoor oven." },
    { name: "Coconut Naan", price: "$5.99", desc: "Leavened white soft bread stuffed with coconut and baked in a Tandoor oven." },
    { name: "Onion Kulcha", price: "$5.99", desc: "Leavened white soft bread stuffed with onion and freshly chopped onion and baked in a Tandoor oven." },
    { name: "Aloo Naan", price: "$5.99", desc: "Leavened white soft bread stuffed with potato and baked in a Tandoor oven." },
    { name: "Roti", price: "$4.99", desc: "Whole wheat soft bread baked in a Tandoor oven." },
    { name: "Aloo Paratha", price: "$5.99", desc: "Whole wheat soft bread stuffed with potato and baked in a Tandoor oven." },
    { name: "Lachha Paratha", price: "$5.99", desc: "Layered whole wheat bread, baked in a Tandoor oven." },
    { name: "Bread Basket", price: "$14.99", desc: "Layered whole wheat bread, baked in a Tandoor oven." }
  ],
  Desserts: [
    { name: "Gulab Jamun", price: "$5.99", desc: "Fried pastry dumplings in a sweet saffron syrup." },
    { name: "Kheer", price: "$5.99", desc: "Rice cooked in a creamy sweetest milk." },
    { name: "Gajar Halwa", price: "$6.99", desc: "A Carrot dish, fudgy texture enhanced with cardamom and dry fruits" }
  ],
  Beverages: [
    { name: "Soda Can", price: "$2.99", desc: "Coke, Pepsi, Sprite, Ginger Ale." },
    { name: "Mango Lassi", price: "$4.99", desc: "Smoothie drink, mango pulp and yogurt mixed." },
    { name: "Milk Tea", price: "$3.99", desc: "Milk cooked with tea leaf and spices." },
    { name: "Black Tea", price: "$2.99", desc: "Tea leaf cooked in water with spices." }
  ],
  "Sauces & Pickles": [
    { name: "Tamarind Sauce, 8 oz.", price: "$4.99", desc: "" },
    { name: "Green Chutney, 8 oz.", price: "$4.99", desc: "" },
    { name: "Mango Chutney, 8 oz.", price: "$4.99", desc: "" },
    { name: "Raita, 8 oz.", price: "$4.99", desc: "" }
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