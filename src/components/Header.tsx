import { MapPin } from 'lucide-react';

export function Header() {
  return (
    <header className="gradient-hero py-8 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="h-7 w-7 text-primary-foreground/80" />
          <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground tracking-tight">
            Portraits de Territoire
          </h1>
        </div>
        <p className="text-primary-foreground/70 text-sm md:text-base font-sans ml-10">
          Flandre — 130 communes · Données INSEE & Sirene
        </p>
      </div>
    </header>
  );
}
