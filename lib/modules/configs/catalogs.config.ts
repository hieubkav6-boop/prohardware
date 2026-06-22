import { BookOpen } from 'lucide-react';
import { defineModuleWithRuntime } from '../define-module';

export const catalogsModule = defineModuleWithRuntime({
  key: 'catalogs',
  name: 'Catalogs',
  description: 'Tài liệu catalog PDF dạng flipbook',
  icon: BookOpen,
  color: 'indigo',

  features: [
  ],

  settings: [
    { key: 'catalogsPerPage', label: 'Số catalog / trang', type: 'number', default: 12 },
  ],

  runtimeConfig: {
    fields: [
      { enabled: true, fieldKey: 'title', isSystem: true, name: 'Tiêu đề', order: 0, required: true, type: 'text' },
      { enabled: true, fieldKey: 'description', isSystem: false, name: 'Mô tả ngắn', order: 1, required: false, type: 'textarea' },
      { enabled: true, fieldKey: 'category', isSystem: false, name: 'Danh mục', order: 2, required: false, type: 'text' },
      { enabled: true, fieldKey: 'pdfStorageId', isSystem: true, name: 'File PDF', order: 3, required: true, type: 'text' },
      { enabled: true, fieldKey: 'featured', isSystem: false, name: 'Nổi bật', order: 4, required: false, type: 'boolean' },
      { enabled: true, fieldKey: 'order', isSystem: true, name: 'Thứ tự', order: 5, required: true, type: 'number' },
      { enabled: true, fieldKey: 'status', isSystem: true, name: 'Trạng thái', order: 6, required: true, type: 'select' },
    ],
  },
});
