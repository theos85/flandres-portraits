import { Header } from '@/components/Header';
import { CommuneSelector } from '@/components/CommuneSelector';
import { PortraitView } from '@/components/PortraitView';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <aside className="lg:col-span-2">
            <div className="sticky top-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Communes</h2>
              <CommuneSelector />
            </div>
          </aside>
          <section className="lg:col-span-3">
            <PortraitView />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
