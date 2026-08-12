import { createFileRoute, Link } from "@tanstack/react-router";
import { Instagram, ArrowRight } from "lucide-react";
import pakora from "@/assets/pakora.jpg";
import lambCurry from "@/assets/lamb-curry.jpg";
import saag from "@/assets/saag.jpg";
import garlicNaan from "@/assets/garlic-naan.jpg";
import chaat from "@/assets/chaat.jpg";
import samosaPlate from "@/assets/samosa-plate.jpg";
import sizzler from "@/assets/sizzler.jpg";
import friedMomo from "@/assets/fried-momo.jpg";
import paneerTikka from "@/assets/paneer-tikka.jpg";

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
    { src: friedMomo, alt: "Golden fried momos served with house chilli dipping sauce" },
    { src: paneerTikka, alt: "Chargrilled paneer tikka with peppers, onion and lemon" },
    { src: chaat, alt: "Layered chaat with sev, pomegranate and chutneys" },
    { src: sizzler, alt: "Smoking tandoori sizzler platter fresh off the grill" },
    { src: garlicNaan, alt: "Garlic naan with coriander in a basket" },
    { src: lambCurry, alt: "Slow-cooked lamb curry finished with fresh coriander" },
    { src: saag, alt: "Creamy saag simmered with Himalayan spices" },
    { src: samosaPlate, alt: "Crisp samosas with tamarind and mint chutneys" },
    { src: pakora, alt: "Onion pakora with tamarind and mint chutney" },
];

function Gallery() {
    return (
        <section className="bg-surface py-24">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
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

                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                                className="h-72 w-full object-cover transition duration-700 [filter:saturate(1.12)_contrast(1.06)_brightness(0.96)] group-hover:scale-105"
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

                <div className="mt-16 flex flex-col items-center gap-3">
                    <a
                        href="https://www.instagram.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 rounded-full border border-primary/60 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-primary hover:text-primary-foreground"
                    >
                        <Instagram className="h-4 w-4" />
                        Follow Us On Instagram
                        <ArrowRight className="h-4 w-4" />
                    </a>
                    <p className="text-xs uppercase tracking-wider text-white/50">
                        @himalchulibarandgrill
                    </p>
                    <Link
                        to="/menu"
                        className="mt-6 text-sm font-semibold uppercase tracking-wider text-primary hover:underline"
                    >
                        View Full Menu
                    </Link>
                </div>
            </div>
        </section>
    );
}
