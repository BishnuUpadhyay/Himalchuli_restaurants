import { createFileRoute, Link } from "@tanstack/react-router";
import { Instagram, Facebook, ArrowRight } from "lucide-react";
import pakora from "@/assets/pakora.jpg";
import lambCurry from "@/assets/lamb-curry.jpg";
import saag from "@/assets/saag.jpg";
import garlicNaan from "@/assets/garlic-naan.jpg";
import chaat from "@/assets/chaat.jpg";
import samosaPlate from "@/assets/samosa-plate.jpg";
import sizzler from "@/assets/sizzler.jpg";
import friedMomo from "@/assets/fried-momo.jpg";
import paneerTikka from "@/assets/paneer-tikka.jpg";
import heroInterior from "@/assets/hero-interior.jpg";

export const Route = createFileRoute("/gallery")({
    head: () => ({
        meta: [
            { title: "Gallery — Himalchuli Bar & Grill" },
            {
                name: "description",
                content:
                    "A glimpse into our kitchen — momos, tandoori grills, chaat and Himalayan classics photographed fresh off the pass.",
            },
            { property: "og:title", content: "Gallery — Himalchuli Bar & Grill" },
            {
                property: "og:description",
                content: "Photos of our food, our tandoor and our dining room in Washington DC.",
            },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
        ],
    }),
    component: Gallery,
});

const photos = [
    { src: friedMomo, alt: "Chicken fried momos" },
    { src: paneerTikka, alt: "Paneer Tikka Masala" },
    { src: chaat, alt: "Samosa Chaat" },
    { src: sizzler, alt: "Chicken Sekuwa" },
    { src: garlicNaan, alt: "Garlic naan" },
    { src: lambCurry, alt: "Lamb Curry" },
    { src: saag, alt: "Saag Paneer" },
    { src: samosaPlate, alt: "Vegetable samosa" },
    // { src: pakora, alt: "Mixed Veg. Pakoda" },
];

export function Gallery({ fromhome }: { fromhome?: boolean }) {
    return (
        <section className="relative isolate overflow-hidden bg-surface py-24">
            <img src={heroInterior} alt="" aria-hidden width={1600} height={900} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/70 to-surface/20" />

            <div className="relative mx-auto max-w-7xl px-4 md:px-8">
                <div className="text-center">
                    <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-primary">
                        Gallery
                    </p>
                    <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-[0.15em] text-white md:text-6xl">
                        Follow Our Journey
                    </h1>
                    <p className="mt-4 text-white/70">
                        A glimpse into our kitchen, our tandoor and your moments.
                    </p>
                </div>

                <div className="mt-14 grid gap-6 grid-cols-2  sm:grid-cols-2 lg:grid-cols-4">
                    {photos.map((p) => (
                        <figure
                            key={p.alt}
                            className="group relative overflow-hidden rounded-xl border border-border/40 shadow-lg"
                        >
                            <img
                                src={p.src}
                                alt={p.alt}
                                width={800}
                                height={800}
                                loading="lazy"
                                className="h-60 sm:h-72 w-full object-cover transition duration-700 [filter:saturate(1.12)_contrast(1.06)_brightness(0.96)] group-hover:scale-105"
                            />
                            {/* warm brand grade to unify the photos with the site theme */}
                            <span
                                aria-hidden
                                className="pointer-events-none absolute inset-0 bg-primary/20 mix-blend-overlay"
                            />
                            <span
                                aria-hidden
                                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface/80 via-surface/10 to-transparent"
                            />
                            <figcaption className="absolute inset-x-0 bottom-0 p-4 font-display text-sm uppercase tracking-[0.2em] text-white/90">
                                {p.alt.split(" ").slice(0, 3).join(" ")}
                            </figcaption>
                        </figure>
                    ))}
                </div>

                <div className="mt-16 flex  flex-col items-center gap-3">

                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                        <a
                            href="https://www.facebook.com/profile.php?id=61592058508609"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 rounded-full border border-primary/60 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-primary hover:text-primary-foreground"
                        >
                            <Facebook className="h-4 w-4" />
                            Follow Us On Facebook
                            <ArrowRight className="h-4 w-4" />
                        </a>
                        <a
                            href="https://www.instagram.com/himalchuli2026?igsh=MWw5bWRvaWpncHgxcg=="
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 rounded-full border border-primary/60 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-primary hover:text-primary-foreground"
                        >
                            <Instagram className="h-4 w-4" />
                            Follow Us On Instagram
                            <ArrowRight className="h-4 w-4" />
                        </a>

                    </div>


                    {fromhome ? null : <Link to="/menu" className="mt-6 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90">
                        View Full Menu
                    </Link>}
                </div>
            </div>
        </section>
    );
}
