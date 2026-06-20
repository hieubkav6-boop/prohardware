import { BookOpen } from 'lucide-react';
import { defineModule } from '../define-module';

export const catalogsModule = defineModule({
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
});
