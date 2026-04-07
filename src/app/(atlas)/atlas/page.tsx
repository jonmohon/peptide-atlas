import { BodyMapView } from '@/components/body/body-map-view';
import { peptides } from '@/data/peptides';

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      {/* Full-screen body map */}
      <BodyMapView peptides={peptides} />

      {/* Disclaimer - minimal, bottom-fixed */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <p className="text-[10px] text-text-muted text-center py-1 opacity-50">
          Educational purposes only. Not medical advice. Consult a healthcare professional before using any peptides.
        </p>
      </div>
    </div>
  );
}
