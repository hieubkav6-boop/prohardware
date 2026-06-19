'use client';

import React from 'react';
import type { Id } from '@/convex/_generated/dataModel';
import { KanbanMiniApp } from './kanban/KanbanMiniApp';
import { CVBuilderMiniApp } from './cv-builder/CVBuilderMiniApp';
import { PokemonChampionsMiniApp } from './pokemon-champions/PokemonChampionsMiniApp';

export type MiniAppHostProps = {
  appConfig?: Record<string, unknown>;
  appId?: Id<'miniApps'>;
  appName?: string;
  appType: string;
  editable?: boolean;
  standalone?: boolean;
  userId?: Id<'users'> | null;
};

export function MiniAppHost({
  appConfig,
  appId,
  appName,
  appType,
  editable = false,
  standalone = false,
  userId,
}: MiniAppHostProps) {
  if (appType === 'kanban') {
    return (
      <KanbanMiniApp
        appName={appName}
        editable={editable}
        standalone={standalone}
        userId={userId}
      />
    );
  }

  if (appType === 'cv-builder') {
    return (
      <CVBuilderMiniApp
        appName={appName}
        editable={editable}
        standalone={standalone}
        userId={userId}
      />
    );
  }

  if (appType === 'pokemon-champions') {
    return (
      <PokemonChampionsMiniApp
        appConfig={appConfig}
        appId={appId}
        appName={appName}
        editable={editable}
        standalone={standalone}
      />
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
      Mini app type <span className="font-mono">{appType}</span> chưa có renderer.
    </div>
  );
}
