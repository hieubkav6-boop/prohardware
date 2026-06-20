'use client';
import React from 'react';
import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { catalogsModule } from '@/lib/modules/configs/catalogs.config';

export default function CatalogsModuleConfigPage() {
  return (
    <ModuleConfigPage 
      config={catalogsModule}
    />
  );
}
