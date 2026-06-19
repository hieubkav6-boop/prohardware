'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui';

export default function EditPokemonChampionsHomeComponentPage({ params }: { params: Promise<{ id: string }> }) {
  use(params);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pokemon Champions Home Component</h1>
        <Link href="/admin/home-components" className="text-sm text-blue-600 hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gamepad2 className="h-5 w-5" />
            Chỉnh trong Mini App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pokemon Champions dùng sidebar riêng trong mini app để quản lý dữ liệu, cấu hình home-component và preview.
          </p>
          <Link href="/admin/mini-apps/pokemon-champions?tab=home">
            <Button type="button">
              <Gamepad2 className="mr-2 h-4 w-4" />
              Mở cấu hình Pokemon Champions
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
