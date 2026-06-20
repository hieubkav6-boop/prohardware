'use client';

import React from 'react';
import { ModuleGuard } from '../../components/ModuleGuard';
import { CatalogForm } from '../components/CatalogForm';

export default function CatalogCreatePage() {
  return (
    <ModuleGuard moduleKey="catalogs">
      <CatalogForm />
    </ModuleGuard>
  );
}
