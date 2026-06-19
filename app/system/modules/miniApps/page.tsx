'use client';

import { useEffect } from 'react';
import { useMutation } from 'convex/react';
import { ModuleConfigPage } from '@/components/modules/ModuleConfigPage';
import { api } from '@/convex/_generated/api';
import { miniAppsModule } from '@/lib/modules/configs/mini-apps.config';

export default function MiniAppsModuleConfigPage() {
  const ensureDefaults = useMutation(api.miniApps.ensureDefaults);
  const syncModuleConfig = useMutation(api.admin.modules.syncModuleConfigFromDefinition);

  useEffect(() => {
    void ensureDefaults();
    void syncModuleConfig({ moduleKey: 'miniApps' });
  }, [ensureDefaults, syncModuleConfig]);

  return (
    <ModuleConfigPage config={miniAppsModule} />
  );
}
