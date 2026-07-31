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
    { name: "Lentil Soup", price: "$5.99", desc: "Mixed red and peeled black lentil cooked with Indian herbs & spices. (Veg, VN, G.F)", img: dishdefault },
    { name: "Vegetable Samosa", price: "$5.99", desc: "Triangular Indian pastries stuffed with potatoes, green peas, mild herbs & spices. (Veg, VN)", img: dishdefault },
    { name: "Mixed Veg Pakoda", price: "$7.99", desc: "Crispy, deep-fried Indian fritters, shredded vegetables dipped in a chickpea flour batter. (Veg, VN, G.F)", img: dishdefault },
    { name: "Samosa Chat", price: "$11.99", desc: "Triangular Indian pastries stuffed with potatoes, topped with chickpea curry, yogurt, and chutneys.", img: dishdefault },
    { name: "Gobi Manchurian", price: "$11.99", desc: "Crispy cauliflower tossed in a spicy sweet and tangy sauce with soy sauce, vinegar and chilli sauce. (Veg, VN)", img: dishdefault },
    { name: "Chicken 65", price: "$13.99", desc: "Crispy chicken with mustard seeds, whole chilli peppers, fresh garlic, ginger, curry leaf and chopped green onion. (VN)", img: dishdefault },
    { name: "Chicken Chilli", price: "$13.99", desc: "Crispy Chicken cooked with onion, colored bell pepper, garlic, herbs and spices. (VN)", img: dishdefault }
  ],

  Nepalese_Cuisine: [
    { name: "Veg Chowmein", price: "$13.99", desc: "Stir-fried noodles cooked with vegetables, Nepalese herbs, and spices.", img: dishdefault },
    { name: "Chicken Chowmein", price: "$15.99", desc: "Stir-fried noodles cooked with chicken, vegetables, Nepalese herbs, and spices.", img: dishdefault },
    { name: "Shrimp Chowmein", price: "$16.99", desc: "Stir-fried noodles cooked with shrimp, vegetables, Nepalese herbs, and spices.", img: dishdefault },
    { name: "Chicken Sekuwa", price: "$15.99", desc: "Marinated chicken skewered and grilled in tandoor oven. (VN)", img: dishdefault },
    { name: "Chicken Choila", price: "$15.99", desc: "Grilled chicken tossed with mustard oil, fenugreek seeds, green chilli, spring onion and spices, mixed with spring onion, Szechuan pepper, sliced ginger, garlic and cilantro. (VN)", img: dishdefault },
    { name: "Steamed Veg Momo", price: "$15.99", desc: "Dumplings seasoned with Nepalese herbs and spices with vegetable filling. Preparation: Steamed.", img: dishdefault },
    { name: "Fried Veg Momo", price: "$16.99", desc: "Dumplings seasoned with Nepalese herbs and spices with vegetable filling. Preparation: Fried.", img: dishdefault },
    { name: "Chilli Veg Momo", price: "$17.99", desc: "Dumplings seasoned with Nepalese herbs and spices with vegetable filling. Preparation: Chilli.", img: dishdefault },
    { name: "Steamed Chicken Momo", price: "$15.99", desc: "Dumplings seasoned with Nepalese herbs and spices with chicken filling. Preparation: Steamed.", img: dishdefault },
    { name: "Fried Chicken Momo", price: "$17.99", desc: "Dumplings seasoned with Nepalese herbs and spices with chicken filling. Preparation: Fried.", img: dishdefault },
    { name: "Chilli Chicken Momo", price: "$18.99", desc: "Dumplings seasoned with Nepalese herbs and spices with chicken filling. Preparation: Chilli.", img: dishdefault },
    { name: "Mustang Aloo", price: "$11.99", desc: "Boiled potatoes tossed with butter and oil with Nepalese herbs and spices. (Veg, G.F)", img: dishdefault }
  ],

  Tandoori_Entrees: [
    { name: "Tandoori Chicken", price: "$18.99", desc: "Half chicken marinated in herbs, spices, mustard oil and yogurt. Served with grilled onion and bell peppers. (G. F)", img: dishdefault },
    { name: "Chicken Tikka", price: "$18.99", desc: "Boneless chicken pieces marinated in herbs, spices, mustard oil and sour cream. Serve with grilled onion and bell peppers. (G. F)", img: dishdefault },
    { name: "Tandoori Salmon", price: "$24.99", desc: "Salmon marinated in herbs, spices, mustard oil and sour cream. Serve with grilled onion and bell peppers. (G. F)", img: dishdefault },
    { name: "Lamb Chop", price: "$24.99", desc: "Minced lamb or lamb chops with ginger garlic paste, herbs and spices. (G.F)", img: dishdefault },
    { name: "Tandoori Shrimp", price: "$20.99", desc: "Shrimp marinated in herbs, spices, mustard oil and sour cream, serve with grilled onion and bell peppers. (G.F)", img: dishdefault },
    { name: "Paneer Tikka Tandoor", price: "$21.99", desc: "Cubes of paneer home made cheese marinated in herbs, spices, mustard oil and sour cream. Served with grilled onion, and bell peppers. (Veg, G.F)", img: dishdefault }
  ],

  Vegetable_Entrees: [
    { name: "Vegetable Korma", price: "$16.99", desc: "Mixed vegetable simmered in a rich and creamy sauce of cashew nuts with herbs and spices. (G. F)", img: dishdefault },
    { name: "Paneer Tikka Masala", price: "$18.99", desc: "Fried cubes of home made cheese cooked in a delicious creamy tomato and onion sauce. (G. F)", img: dishdefault },
    { name: "Saag Paneer", price: "$16.99", desc: "Fried cubes of home made cheese in tomato and onion sauce with fresh spinach. (G. F)", img: dishdefault },
    { name: "Chana Saag", price: "$16.99", desc: "Fresh spinach and chickpea cooked in onion and tomato sauce. (G.F)", img: dishdefault },
    { name: "Chana Masala", price: "$15.99", desc: "Chick pea cooked in onion and tomato sauce with herbs and spices. (VN, G.F)", img: dishdefault },
    { name: "Bhindi Masala", price: "$15.99", desc: "Okra sauteed with onion, tomato, herbs and spices. (VN , G.F)", img: dishdefault },
    { name: "Baigan Bharta", price: "$15.99", desc: "Roasted eggplant cooked with tomato, onion, herbs and spices. (VN , G.F)", img: dishdefault },
    { name: "Dal Makhani", price: "$16.99", desc: "Black lentils cooked in creamy tomato sauce with herbs and spices. (G. F)", img: dishdefault },
    { name: "Dal Tadka", price: "$15.99", desc: "Mixed lentils sauteed with garlic, cumin seeds and tomato. (VN , G.F)", img: dishdefault },
    { name: "Aloo Gobi", price: "$15.99", desc: "Fresh cauliflower and potato cooked with onion, tomato herbs and spices. (VN, G.F)", img: dishdefault },
    { name: "Vegetable Vindaloo", price: "$15.99", desc: "Cube cut boiled potato and mixed vegetable cooked in a vindaloo sauce. (VN , G. F)", img: dishdefault },
    { name: "Veg Curry", price: "$15.99", desc: "Mixed veg, cauliflower and broccoli cooked in tomato and onion sauce with herbs and spices. (VN, G.F)", img: dishdefault }
  ],

  Chicken_Entrees: [
    { name: "Chicken Curry", price: "$17.99", desc: "Boneless chicken cooked in a onion and tomato with herbs and spices. (VN, G.F)", img: dishdefault },
    { name: "Butter Chicken", price: "$18.99", desc: "Grilled boneless chicken cooked in creamy tomato sauce with mild spices. (G.F)", img: dishdefault },
    { name: "Chicken Tikka Masala", price: "$18.99", desc: "Grilled boneless chicken cooked in a tomato creamy tomato and onion sauce with mild spices. (G.F)", img: dishdefault },
    { name: "Chicken Vindaloo", price: "$17.99", desc: "Boneless chicken and potato cooked in a vindaloo sauce. (VN, G. F)", img: dishdefault },
    { name: "Chicken with Veg Curry", price: "$17.99", desc: "Boneless chicken sauteed with fresh vegetables, herbs and spices. (VN, G.F)", img: dishdefault },
    { name: "Chicken Madras", price: "$17.99", desc: "Boneless chicken cooked in coconut milk with mustard seeds, whole chilli peppers, curry leaf, herbs and spices. (G.F)", img: dishdefault },
    { name: "Chicken Korma", price: "$17.99", desc: "Boneless chicken cooked with cashews in a creamy onion and tomato sauce. (G.F)", img: dishdefault },
    { name: "Chicken Saag", price: "$18.99", desc: "Boneless chicken and fresh spinach cooked in an onion and tomato sauce. (G. F)", img: dishdefault },
    { name: "Chicken Dhansak Korma", price: "$17.99", desc: "Boneless chicken cooked in creamy sauce with mint chutney and lentils. (G. F)", img: dishdefault }
  ],

  Lamb_Entrees: [
    { name: "Lamb Curry", price: "$19.99", desc: "Boneless lamb cooked in tomato and onion sauce with herbs and spices. (VN, G.F)", img: dishdefault },
    { name: "Lamb Vindaloo", price: "$19.99", desc: "Boneless lamb and potato cooked in vindaloo sauce with herbs & spices. (VN, G.F)", img: dishdefault },
    { name: "Lamb Korma", price: "$19.99", desc: "Boneless lamb cooked with cashews in creamy onion and tomato sauce. (G.F)", img: dishdefault },
    { name: "Lamb Saag", price: "$20.99", desc: "Boneless lamb and fresh spinach cooked in an onion and tomato sauce. (G. F)", img: dishdefault },
    { name: "Lamb with Veg Curry", price: "$19.99", desc: "Boneless lamb sautéed with fresh vegetables, herbs and spices. (VN, G.F)", img: dishdefault },
    { name: "Lamb Tikka Masala", price: "$20.99", desc: "Boneless lamb sautéed with creamy tomato and onion sauce. (G.F)", img: dishdefault },
    { name: "Lamb Madras", price: "$19.99", desc: "Boneless lamb cooked in coconut milk with mustard seeds, whole chilli pepper, curry leaf, herbs and spices. (G. F)", img: dishdefault }
  ],

  Shrimp_Entrees: [
    { name: "Shrimp Curry", price: "$20.99", desc: "Fresh shrimp cooked in tomato and onion with herbs and spices. (VN, G. F)", img: dishdefault },
    { name: "Shrimp with Veg Curry", price: "$20.99", desc: "Fresh shrimp sautéed with fresh vegetables, herbs and spices. (VN, G. F)", img: dishdefault },
    { name: "Shrimp Madras", price: "$20.99", desc: "Fresh shrimp cooked in coconut milk with mustard seed, whole chilli pepper, curry leaf, herbs and spices. (G. F)", img: dishdefault },
    { name: "Shrimp Vindaloo", price: "$20.99", desc: "Fresh shrimp and cube cut boiled potato cooked in vindaloo sauce, herbs & spices. (VN, G. F)", img: dishdefault },
    { name: "Shrimp Korma", price: "$20.99", desc: "Fresh shrimp cooked with cashews in a creamy sauce. (G. F)", img: dishdefault },
    { name: "Shrimp Masala", price: "$21.99", desc: "Fresh shrimp cooked in creamy tomato and onion sauce with mild herbs and spices. (G. F)", img: dishdefault }
  ],

  Biryani_And_Rice: [
    { name: "Plain White Rice", price: "$4.00", desc: "Basmati Rice. (VN, G.F)", img: dishdefault },
    { name: "Vegetable Biryani", price: "$16.99", desc: "Basmati rice cooked with mixed vegetable, herbs and spices. (Veg, G,F)", img: dishdefault },
    { name: "Chicken Biryani", price: "$17.99", desc: "Basmati rice and tender pieces of chicken cooked with herbs and spices. (G,F)", img: dishdefault },
    { name: "Lamb Biryani", price: "$19.99", desc: "Basmati rice and tender pieces of lamb cooked with herbs and spices. (G,F)", img: dishdefault },
    { name: "Shrimp Biryani", price: "$20.99", desc: "Basmati rice and shrimp cooked with herbs and spices. (G,F)", img: dishdefault }
  ],

  Breads: [
    { name: "Naan", price: "$4.00", desc: "Leavened white bread baked in a Tandoor oven.", img: dishdefault },
    { name: "Garlic Naan", price: "$5.00", desc: "Leavened white bread topped with freshly chopped garlic and cilantro, baked in a Tandoor oven.", img: dishdefault },
    { name: "Coconut Naan", price: "$5.50", desc: "Leavened white soft bread stuffed with coconut and baked in a Tandoor oven.", img: dishdefault },
    { name: "Aloo Naan", price: "$5.00", desc: "Leavened white soft bread stuffed with potato and baked in a Tandoor oven.", img: dishdefault },
    { name: "Onion Kulcha", price: "$5.00", desc: "Leavened white soft bread stuffed with onion and freshly chopped onion and baked in a Tandoor oven.", img: dishdefault },
    { name: "Roti", price: "$4.00", desc: "Whole wheat soft bread baked in a Tandoor oven.", img: dishdefault },
    { name: "Aloo Paratha", price: "$5.00", desc: "Whole wheat soft bread stuffed with potato and baked in a Tandoor oven.", img: dishdefault },
    { name: "Lachha Paratha", price: "$5.00", desc: "Layered whole wheat bread, baked in a Tandoor oven.", img: dishdefault },
    { name: "Bread Basket", price: "$14.00", desc: "Assortment of freshly baked tandoori breads.", img: dishdefault }
  ],

  Desserts: [
    { name: "Gulab Jamun", price: "$5.00", desc: "Fried pastry dumplings in a sweet saffron syrup.", img: dishdefault },
    { name: "Kheer", price: "$5.00", desc: "Rice cooked in a creamy sweetest milk.", img: dishdefault },
    { name: "Gajar Halwa", price: "$6.00", desc: "Grated carrots cooked with sweet milk, ghee, and nuts.", img: dishdefault }
  ],

  Beverages: [
    { name: "Soda Can", price: "$2.00", desc: "Coke, Pepsi, Sprite, Ginger Ale.", img: dishdefault },
    { name: "Mango Lassi", price: "$4.99", desc: "Smoothie drink, mango pulp and yogurt mixed.", img: dishdefault },
    { name: "Milk Tea", price: "$3.50", desc: "Milk cooked with tea leaf and spices.", img: dishdefault },
    { name: "Black Tea", price: "$2.99", desc: "Tea leaf cooked in water with spices.", img: dishdefault }
  ],

  Sauces_And_Pickles: [
    { name: "Tamarind Sauce, 8 oz.", price: "$4.99", desc: "Sweet and tangy tamarind dipping sauce.", img: dishdefault },
    { name: "Green Chutney, 8 oz.", price: "$4.99", desc: "Fresh mint and cilantro chutney.", img: dishdefault },
    { name: "Mango Chutney, 8 oz.", price: "$4.99", desc: "Sweet and spicy preserved mango relish.", img: dishdefault },
    { name: "Raita, 8 oz.", price: "$4.00", desc: "Yogurt sauce with cucumber, herbs, and mild spices.", img: dishdefault }
  ]
};

const categories = Object.keys(menu);

function MenuPage() {
  const [active, setActive] = useState(categories[0]);
  const items = menu[active];
const formatLabel = (str: any) =>
    str.toLowerCase().replace(/_/g, " ")
      .replace(/\b\w/g, (char : any) => char.toUpperCase());
  return (
    <>
      <section className="bg-surface py-20 text-center">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-primary">Our Menu</p>
        <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-wide text-white md:text-6xl">Explore the Flavors</h1>
        <p className="mx-auto mt-4 max-w-xl px-4 text-white/70">A curated selection of Himalayan and Indian classics.</p>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-12">
        <div className="flex overflow-x-auto gap-2 pb-3 scrollbar-none md:flex-wrap md:justify-center">
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