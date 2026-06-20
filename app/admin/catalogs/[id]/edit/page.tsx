'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { ModuleGuard } from '../../../components/ModuleGuard';
import { CatalogForm } from '../../components/CatalogForm';
import { Loader2 } from 'lucide-react';

export default function CatalogEditPage() {
  return (
    <ModuleGuard moduleKey="catalogs">
      <CatalogEditContent />
    </ModuleGuard>
  );
}

function CatalogEditContent() {
  const params = useParams();
  const id = params.id as Id<'catalogs'>;
  
  const catalog = useQuery(api.catalogs.get, { id });

  if (catalog === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (catalog === null) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-lg font-medium text-gray-900">Không tìm thấy catalog</p>
        <p className="text-gray-500">Catalog này có thể đã bị xóa hoặc không tồn tại.</p>
      </div>
    );
  }

  return <CatalogForm initialData={catalog} />;
}
