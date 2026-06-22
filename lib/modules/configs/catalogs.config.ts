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
    { key: 'catalogsTitle', label: 'Tiêu đề trang', type: 'text', default: 'Catalog & Tài Liệu' },
    { key: 'catalogsSubtitle', label: 'Mô tả ngắn trang', type: 'text', default: 'Chúng tôi Chuyên Phân Phối các dòng Thiết Bị Vệ Sinh uy tín như: van, vòi hồ, sen tắm, vòi sen, vòi lavabo... với thiết kế hiện đại, độ bền cao, đáp ứng mọi nhu cầu từ hộ gia đình đến công trình lớn.' },
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
