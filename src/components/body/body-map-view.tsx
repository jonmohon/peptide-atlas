'use client';

import { useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { RegionId } from '@/types/body';
import type { Peptide } from '@/types/peptide';
import { useBodyStore } from '@/stores/use-body-store';
import { usePeptideStore } from '@/stores/use-peptide-store';
import { useBodyHighlights } from '@/hooks/use-body-highlights';
import { BodySvg } from './body-svg';
import { BodyLegend } from './body-legend';
import { SidebarPanel } from '@/components/layout/sidebar-panel';
import { PeptideCard } from '@/components/peptides/peptide-card';
import { bodyRegions } from '@/data/body-regions';
import { getPathwaysForPeptide } from '@/data/pathways';
import { Tag } from '@/components/ui/tag';
import { Button } from '@/components/ui/button';

interface BodyMapViewProps {
  peptides: Peptide[];
}

export function BodyMapView({ peptides }: BodyMapViewProps) {
  const {
    hoveredRegion,
    selectedRegion,
    showPathways,
    activePathwayPeptideId,
    setHoveredRegion,
    selectRegion,
    togglePathways,
    clearAll,
  } = useBodyStore();

  const { selectedPeptideId, selectPeptide } = usePeptideStore();

  const highlights = useBodyHighlights(peptides, selectedPeptideId, selectedRegion);

  // Get pathway data for active peptide
  const activePathways = useMemo(() => {
    if (!activePathwayPeptideId) return [];
    return getPathwaysForPeptide(activePathwayPeptideId);
  }, [activePathwayPeptideId]);

  // Get peptides for the selected region
  const regionPeptides = useMemo(() => {
    if (!selectedRegion) return [];
    return peptides.filter((p) =>
      p.affectedRegions.some((r) => r.regionId === selectedRegion)
    );
  }, [peptides, selectedRegion]);

  // Get selected peptide details
  const selectedPeptide = useMemo(() => {
    if (!selectedPeptideId) return null;
    return peptides.find((p) => p.id === selectedPeptideId) ?? null;
  }, [peptides, selectedPeptideId]);

  // Get region info
  const selectedRegionInfo = useMemo(() => {
    if (!selectedRegion) return null;
    return bodyRegions.find((r) => r.id === selectedRegion) ?? null;
  }, [selectedRegion]);

  const handleRegionClick = useCallback(
    (regionId: RegionId) => {
      selectRegion(regionId);
      selectPeptide(null);
    },
    [selectRegion, selectPeptide]
  );

  const handlePeptideClick = useCallback(
    (peptideId: string) => {
      selectPeptide(selectedPeptideId === peptideId ? null : peptideId);
    },
    [selectPeptide, selectedPeptideId]
  );

  const handleCloseSidebar = useCallback(() => {
    selectRegion(null);
    selectPeptide(null);
  }, [selectRegion, selectPeptide]);

  const isPanelOpen = selectedRegion !== null || selectedPeptideId !== null;

  const panelTitle = selectedPeptide
    ? selectedPeptide.name
    : selectedRegionInfo
      ? selectedRegionInfo.label
      : 'Select a Region';

  return (
    <div className="flex flex-1 min-h-0">
      {/* Body Map Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Instructions */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Explore the <span className="text-medical-500">Peptide Atlas</span>
          </h1>
          <p className="text-sm text-text-secondary">
            Click on a body region to discover which peptides affect that area
          </p>
        </div>

        {/* SVG Body */}
        <div className="relative w-full max-w-[320px] mx-auto">
          <BodySvg
            hoveredRegion={hoveredRegion}
            selectedRegion={selectedRegion}
            highlightedRegions={highlights}
            activePathways={activePathways}
            showPathways={showPathways}
            onRegionHover={setHoveredRegion}
            onRegionClick={handleRegionClick}
            className="w-full h-auto"
          />
        </div>

        {/* Legend */}
        <BodyLegend className="mt-4" />

        {/* Active filters indicator */}
        {selectedPeptideId && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-text-secondary">Showing regions for:</span>
            <Tag
              variant="medical"
              size="sm"
              onClick={() => selectPeptide(null)}
            >
              {selectedPeptide?.name} &times;
            </Tag>
          </div>
        )}
      </div>

      {/* Sidebar Panel */}
      <SidebarPanel
        isOpen={isPanelOpen}
        onClose={handleCloseSidebar}
        title={panelTitle}
      >
        {/* Peptide detail view */}
        {selectedPeptide && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">{selectedPeptide.description}</p>

            {/* Pathway toggle */}
            {getPathwaysForPeptide(selectedPeptide.id).length > 0 && (
              <Button
                size="sm"
                variant={showPathways && activePathwayPeptideId === selectedPeptide.id ? 'primary' : 'outline'}
                onClick={() => togglePathways(selectedPeptide.id)}
              >
                {showPathways && activePathwayPeptideId === selectedPeptide.id
                  ? 'Hide Pathways'
                  : 'Show Pathways'}
              </Button>
            )}

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
                Effects
              </h4>
              <div className="flex flex-wrap gap-1">
                {selectedPeptide.effects.map((effect) => (
                  <Tag key={effect} size="sm" variant="medical">
                    {effect.replace(/-/g, ' ')}
                  </Tag>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
                Dosing
              </h4>
              <div className="bg-surface-dim rounded-lg p-3 text-sm space-y-1">
                <div><span className="font-medium">Route:</span> {selectedPeptide.dosing.route}</div>
                <div><span className="font-medium">Dose:</span> {selectedPeptide.dosing.typicalDose}</div>
                <div><span className="font-medium">Frequency:</span> {selectedPeptide.dosing.frequency}</div>
                <div><span className="font-medium">Cycle:</span> {selectedPeptide.dosing.cycleLength}</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
                Timeline
              </h4>
              <div className="space-y-2">
                {selectedPeptide.timeline.map((phase, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 text-xs font-medium text-medical-600">
                      Week {phase.weekStart}-{phase.weekEnd}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{phase.label}</div>
                      <div className="text-xs text-text-secondary">{phase.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                selectPeptide(null);
              }}
              className="text-sm text-medical-500 hover:text-medical-600 font-medium"
            >
              &larr; Back to region
            </button>
          </div>
        )}

        {/* Region peptide list */}
        {!selectedPeptide && selectedRegionInfo && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              {selectedRegionInfo.description}
            </p>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-3">
                Peptides affecting this region ({regionPeptides.length})
              </h4>
              <AnimatePresence mode="popLayout">
                <div className="space-y-2">
                  {regionPeptides.map((peptide) => (
                    <PeptideCard
                      key={peptide.id}
                      peptide={peptide}
                      compact
                      isSelected={selectedPeptideId === peptide.id}
                      onClick={() => handlePeptideClick(peptide.id)}
                    />
                  ))}
                </div>
              </AnimatePresence>
              {regionPeptides.length === 0 && (
                <p className="text-sm text-text-secondary italic">
                  No peptides directly target this region.
                </p>
              )}
            </div>
          </div>
        )}
      </SidebarPanel>
    </div>
  );
}
