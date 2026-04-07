import { AtlasHeader } from '@/components/layout/atlas-header';

export default function AtlasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AtlasHeader />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
