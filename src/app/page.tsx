import { BodyMapView } from '@/components/body/body-map-view';
import { peptides } from '@/data/peptides';

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      {/* Medical Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
        <p className="text-xs text-amber-800 text-center">
          <strong>Disclaimer:</strong> This content is for educational purposes only and does not constitute medical advice. Consult a healthcare professional before using any peptides.
        </p>
      </div>

      {/* Main Body Map */}
      <BodyMapView peptides={peptides} />
    </div>
  );
}
