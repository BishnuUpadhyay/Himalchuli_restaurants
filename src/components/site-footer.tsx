import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function SiteFooter() {
  const schedule = [
    { day: "Sunday", hours: ["11:00 AM – 10:00 PM"] },
    { day: "Monday", hours: ["Closed"] },
    { day: "Tuesday", hours: ["11:00 AM – 10:00 PM"] },
    { day: "Wednesday", hours: ["11:00 AM – 10:00 PM"] },
    { day: "Thursday", hours: ["11:00 AM – 10:00 PM"] },
    { day: "Friday", hours: ["11:00 AM – 10:30 PM"] },
    { day: "Saturday", hours: ["11:00 AM – 10:30 PM"] },
  ];
  return (
    <footer className="bg-surface text-white/80 border-t border-white/10">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-4 md:px-8">
        <div>
          <h3 className="font-display text-2xl font-bold uppercase tracking-wider text-white">
            Himalchuli<span className="text-primary"> Bar & Grill</span>
          </h3>
          <p className="mt-4 text-sm leading-relaxed">
            Authentic Himalayan hospitality. Nepalese, Tibetan & Indian cuisine crafted with hand-ground spices and heritage recipes.
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold uppercase tracking-wider text-white">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary" /> 36 Plaistow Rd, Haverhill, MA 01830</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-primary" /> (978) 241-4259</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-primary" /> himalchuli2026@gmail.com</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold uppercase tracking-wider text-white">Opening Hours</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {schedule.map((item) => (
              <li key={item.day} className="flex justify-between items-start gap-4">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-primary" /> {item.day}
                </span>
                <div className="text-right">
                  {item.hours.map((time, idx) => (
                    <div key={idx}>{time}</div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold uppercase tracking-wider text-white">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/menu" className="hover:text-primary">Menu</Link></li>
            <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
            <li><Link to="/booking" className="hover:text-primary">Reservations</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-white/50 md:px-8">
          © {new Date().getFullYear()} Himalchuli Bar & Grill. All rights reserved.
        </div>
      </div>
    </footer>
  );
}