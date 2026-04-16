import { AtlasHeader } from '@/components/layout/atlas-header';
import { AtlasSidebar } from '@/components/layout/atlas-sidebar';

export default function AtlasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AtlasHeader />
      <div className="flex flex-1 overflow-hidden">
        <AtlasSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
