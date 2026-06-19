import { PanelsTopLeft, Shield } from 'lucide-react';
import { defineModuleWithRuntime } from '../define-module';

export const miniAppsModule = defineModuleWithRuntime({
  key: 'miniApps',
  name: 'Mini Apps',
  description: 'Nền tảng chạy các app nhỏ tách khỏi module core',
  icon: PanelsTopLeft,
  color: 'indigo',

  features: [
    {
      key: 'enableAdminWorkspace',
      label: 'Admin Mini Apps',
      icon: Shield,
      description: 'Bật/tắt khu vực /admin/mini-apps cho admin. Không ảnh hưởng route public như /apps hoặc /kanban.',
      enabled: true,
    },
  ],

  settings: [
    {
      key: 'defaultVisibility',
      label: 'Visibility mặc định',
      type: 'select',
      default: 'private',
      options: [
        { value: 'private', label: 'Private' },
        { value: 'public', label: 'Public' },
      ],
    },
  ],

  conventionNote: 'Mini app chỉ quản registry và route; code từng app nằm trong features/mini-apps để không làm loãng hệ thống.',

  runtimeConfig: {
    fields: [
      { enabled: true, fieldKey: 'name', isSystem: true, name: 'Tên mini app', order: 0, required: true, type: 'text' },
      { enabled: true, fieldKey: 'type', isSystem: true, name: 'Adapter type', order: 1, required: true, type: 'text' },
      { enabled: true, fieldKey: 'routeSlug', isSystem: true, name: 'Route slug', order: 2, required: false, type: 'text' },
      { enabled: true, fieldKey: 'visibility', isSystem: true, name: 'Visibility', order: 3, required: true, type: 'select' },
      { enabled: true, fieldKey: 'config', isSystem: false, name: 'Config JSON', order: 4, required: false, type: 'json' },
    ],
  },

  tabs: ['config'],
});
