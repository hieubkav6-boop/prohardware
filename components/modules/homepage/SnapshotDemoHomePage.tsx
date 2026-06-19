'use client';

import React from 'react';
import { HomeComponentRenderer } from '@/components/site/home/HomeComponentRenderer';
import type { SnapshotDemoPayload } from './snapshot-demo-types';
import { useSnapshotDocumentTheme, useSnapshotTheme } from './snapshot-theme';

export function SnapshotDemoHomePage({
  applyThemeBoundary = true,
  payload,
}: {
  applyThemeBoundary?: boolean;
  payload: SnapshotDemoPayload;
}) {
  const components = [...payload.components]
    .filter((component) => component.active)
    .sort((a, b) => a.order - b.order);
  const themeMode = payload.bundle.settings.site.site_dark_mode ?? 'light';
  const [theme] = useSnapshotTheme(themeMode);
  useSnapshotDocumentTheme(theme, applyThemeBoundary);

  const content = (
    <>
      {components.map((component) => (
        <HomeComponentRenderer
          key={component._id}
          component={component}
          snapshotComponentKey={component._id}
        />
      ))}
    </>
  );

  if (!applyThemeBoundary) {
    return content;
  }

  return (
    <div className={theme === 'dark' ? 'dark' : undefined} data-snapshot-demo-root data-theme={theme} style={{ colorScheme: theme }}>
      {content}
    </div>
  );
}
