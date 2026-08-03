import { useEffect } from "react";
import { CalendarDays } from "lucide-react";
import logo from "@/assets/logo.png"; // update path

export default function OpeningSoon() {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1b0b07] via-[#2f140f] to-black" />

      {/* Glow */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-red-600/30 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-yellow-500/30 blur-[120px]" />

      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      <div className="relative z-10 max-w-xl px-8 text-center">

        <img
          src={logo}
          alt="Himalchuli"
          className="mx-auto mb-8 w-40"
        />

        <p className="tracking-[8px] uppercase text-primary">
          Grand Opening
        </p>

        <h1 className="mt-5 text-6xl font-black uppercase text-white">
          Opening
        </h1>

        <h2 className="mt-2 text-5xl font-bold text-primary">
          August 7
        </h2>

        <p className="mt-8 text-lg leading-8 text-gray-300">
          We're putting the final touches on
          <span className="font-semibold text-white">
            {" "}Himalchuli Bar & Grill
          </span>
          .
          <br />
          Join us for authentic Nepalese, Indian & Tibetan cuisine.
        </p>

        <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-primary/40 bg-white/10 px-8 py-4 backdrop-blur">
          <CalendarDays className="text-primary" />
          <span className="font-semibold text-white">
            Thursday • August 7
          </span>
        </div>
        <div className="mt-8 space-y-3">
  <a
    href="tel:9782414259"
    className="block text-xl font-semibold text-white transition hover:text-primary"
  >
    📞 (978) 241-4259
  </a>

  <a
    href="mailto:himalchuli2026@gmail.com"
    className="block text-lg text-gray-300 transition hover:text-primary"
  >
    ✉️ himalchuli2026@gmail.com
  </a>
</div>
      </div>
    </div>
  );
}