'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { Gamepad2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';

export default function CreatePokemonChampionsHomeComponentPage() {
  const router = useRouter();
  const syncHomeComponent = useMutation(api.pokemonChampions.syncHomeComponent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnable = async () => {
    setIsSubmitting(true);
    try {
      await syncHomeComponent({
        enabled: true,
        config: {
          maxItems: 8,
          routeUrl: '/pokemon-champions',
          style: 'featured',
        },
      });
      toast.success('Đã bật Pokemon Champions home-component.');
      router.push('/admin/mini-apps/pokemon-champions?tab=home');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể bật home-component.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pokemon Champions Home Component</h1>
        <Link href="/admin/home-components/create" className="text-sm text-blue-600 hover:underline">
          ← Quay lại chọn component
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gamepad2 className="h-5 w-5" />
            Cấu hình nằm trong Mini App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Component này là singleton và được đồng bộ từ sidebar Pokemon Champions để giữ dữ liệu, giao diện và preview cùng một chỗ.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleEnable} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gamepad2 className="mr-2 h-4 w-4" />}
              Bật và mở cấu hình
            </Button>
            <Link href="/admin/mini-apps/pokemon-champions?tab=home">
              <Button type="button" variant="outline">Mở Mini App</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
