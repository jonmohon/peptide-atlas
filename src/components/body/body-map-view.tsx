'use client';

import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { RegionId } from '@/types/body';
import type { Peptide } from '@/types/peptide';
import { useBodyStore } from '@/stores/use-body-store';
import { usePeptideStore } from '@/stores/use-peptide-store';
import { useBodyHighlights } from '@/hooks/use-body-highlights';
import { BodySvg } from './body-svg';
import { SidebarPanel } from '@/components/layout/sidebar-panel';
import { PeptideCard } from '@/components/peptides/peptide-card';
import { bodyRegions } from '@/data/body-regions';
import { getPathwaysForPeptide } from '@/data/pathways';
import { Tag } from '@/components/ui/tag';
import { Button } from '@/components/ui/button';
import { RegionSuggestion } from '@/components/ai/region-suggestion';

interface BodyMapViewProps {
  peptides: Peptide[];
}

const categories = [
  { id: 'all', label: 'All' },
  { id: 'growth-hormone', label: 'Growth Hormone' },
  { id: 'healing', label: 'Healing' },
  { id: 'cognitive', label: 'Cognitive' },
  { id: 'immune', label: 'Immune' },
  { id: 'sexual-health', label: 'Sexual Health' },
  { id: 'weight-loss', label: 'Weight Loss' },
];

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const highlights = useBodyHighlights(peptides, selectedPeptideId, selectedRegion);

  const activePathways = useMemo(() => {
    if (!activePathwayPeptideId) return [];
    return getPathwaysForPeptide(activePathwayPeptideId);
  }, [activePathwayPeptideId]);

  const regionPeptides = useMemo(() => {
    if (!selectedRegion) return [];
    return peptides.filter((p) =>
      p.affectedRegions.some((r) => r.regionId === selectedRegion)
    );
  }, [peptides, selectedRegion]);

  const selectedPeptide = useMemo(() => {
    if (!selectedPeptideId) return null;
    return peptides.find((p) => p.id === selectedPeptideId) ?? null;
  }, [peptides, selectedPeptideId]);

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
    <div className="flex flex-1 min-h-0 relative overflow-hidden">
      {/* Left Sidebar - Filters */}
      <motion.div
        initial={false}
        animate={{ width: sidebarCollapsed ? 40 : 220 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="shrink-0 glass-bright flex flex-col z-20 overflow-hidden border-r border-white/[0.06]"
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center h-10 border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors text-text-secondary hover:text-foreground"
        >
          <svg
            className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
          </svg>
        </button>

        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Categories */}
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-text-secondary mb-2 font-semibold">
                Categories
              </h3>
              <div className="space-y-0.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-all duration-150 ${
                      activeCategory === cat.id
                        ? 'text-neon-cyan bg-neon-cyan/10 shadow-[0_0_8px_rgba(0,212,255,0.1)]'
                        : 'text-text-secondary hover:text-foreground hover:bg-white/[0.04]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Body Regions quick nav */}
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-text-secondary mb-2 font-semibold">
                Regions
              </h3>
              <div className="space-y-0.5">
                {bodyRegions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => handleRegionClick(region.id as RegionId)}
                    onMouseEnter={() => setHoveredRegion(region.id as RegionId)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-all duration-150 flex items-center gap-2 ${
                      selectedRegion === region.id
                        ? 'text-neon-green bg-neon-green/10'
                        : hoveredRegion === region.id
                          ? 'text-foreground bg-white/[0.06]'
                          : 'text-text-secondary hover:text-foreground hover:bg-white/[0.04]'
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          selectedRegion === region.id
                            ? '#00ff88'
                            : highlights.has(region.id as RegionId)
                              ? '#ff6b35'
                              : '#00d4ff',
                        opacity: selectedRegion === region.id || highlights.has(region.id as RegionId) ? 1 : 0.4,
                        boxShadow:
                          selectedRegion === region.id
                            ? '0 0 6px rgba(0,255,136,0.5)'
                            : highlights.has(region.id as RegionId)
                              ? '0 0 6px rgba(255,107,53,0.5)'
                              : 'none',
                      }}
                    />
                    {region.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Center - Body Map */}
      <div className="flex-1 flex flex-col items-center justify-center relative grid-bg overflow-hidden">
        {/* Subtle instruction text */}
        {!selectedRegion && !selectedPeptideId && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
            <p className="text-xs text-text-secondary opacity-60">
              Click a marker to explore peptide targets
            </p>
          </div>
        )}

        {/* Active filter indicator */}
        {selectedPeptideId && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
            <span className="text-xs text-text-secondary">Showing:</span>
            <Tag
              variant="accent"
              size="sm"
              onClick={() => selectPeptide(null)}
            >
              {selectedPeptide?.name} x
            </Tag>
          </div>
        )}

        {/* SVG Body */}
        <div className="relative w-full max-w-[450px] h-full flex items-center justify-center p-4">
          <BodySvg
            hoveredRegion={hoveredRegion}
            selectedRegion={selectedRegion}
            highlightedRegions={highlights}
            activePathways={activePathways}
            showPathways={showPathways}
            onRegionHover={setHoveredRegion}
            onRegionClick={handleRegionClick}
            className="w-full h-auto max-h-full"
          />
        </div>

        {/* Bottom legend bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 glass rounded-full px-4 py-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00d4ff] shadow-[0_0_6px_rgba(0,212,255,0.5)]" />
            <span className="text-[10px] text-text-secondary">Default</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff6b35] shadow-[0_0_6px_rgba(255,107,53,0.5)]" />
            <span className="text-[10px] text-text-secondary">Highlighted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_6px_rgba(0,255,136,0.5)]" />
            <span className="text-[10px] text-text-secondary">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
            <span className="text-[10px] text-text-secondary">Hover</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Slides in */}
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
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary mb-2">
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
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary mb-2">
                Dosing
              </h4>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 text-sm space-y-1">
                <div><span className="font-medium text-neon-cyan">Route:</span> <span className="text-text-secondary">{selectedPeptide.dosing.route}</span></div>
                <div><span className="font-medium text-neon-cyan">Dose:</span> <span className="text-text-secondary">{selectedPeptide.dosing.typicalDose}</span></div>
                <div><span className="font-medium text-neon-cyan">Frequency:</span> <span className="text-text-secondary">{selectedPeptide.dosing.frequency}</span></div>
                <div><span className="font-medium text-neon-cyan">Cycle:</span> <span className="text-text-secondary">{selectedPeptide.dosing.cycleLength}</span></div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary mb-2">
                Timeline
              </h4>
              <div className="space-y-2">
                {selectedPeptide.timeline.map((phase, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 text-xs font-medium text-neon-cyan">
                      Week {phase.weekStart}-{phase.weekEnd}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{phase.label}</div>
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
              className="text-sm text-neon-cyan hover:text-neon-cyan/80 font-medium transition-colors"
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
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary mb-3">
                Peptides affecting this region ({regionPeptides.length})
              </h4>
              {selectedRegionInfo && regionPeptides.length > 0 && (
                <RegionSuggestion
                  regionId={selectedRegion!}
                  peptideIds={regionPeptides.slice(0, 3).map((p) => p.id)}
                />
              )}
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
