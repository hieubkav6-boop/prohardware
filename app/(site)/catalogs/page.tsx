import { api } from '@/convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';
import { Metadata } from 'next';
import { CatalogsClientView } from '@/components/site/CatalogsClientView';

export const metadata: Metadata = {
  title: 'Catalog - Tài liệu sản phẩm',
  description: 'Khám phá các catalog và tài liệu sản phẩm mới nhất.',
};

export default async function CatalogsPage() {
  // Query toàn bộ danh sách đã resolve URL qua 1 query duy nhất
  const catalogs = await fetchQuery(api.catalogs.listPublishedWithUrls) || [];

  // Query cài đặt tiêu đề và mô tả giới thiệu
  const titleSetting = await fetchQuery(api.admin.modules.getModuleSetting, { moduleKey: 'catalogs', settingKey: 'catalogsTitle' });
  const subtitleSetting = await fetchQuery(api.admin.modules.getModuleSetting, { moduleKey: 'catalogs', settingKey: 'catalogsSubtitle' });

  const initialTitle = titleSetting?.value ?? 'Catalog & Tài Liệu';
  const initialSubtitle = subtitleSetting?.value ?? 'Chúng tôi Chuyên Phân Phối các dòng Thiết Bị Vệ Sinh uy tín như: van, vòi hồ, sen tắm, vòi sen, vòi lavabo... với thiết kế hiện đại, độ bền cao, đáp ứng mọi nhu cầu từ hộ gia đình đến công trình lớn.';

  return (
    <CatalogsClientView 
      initialCatalogs={catalogs} 
      initialTitle={initialTitle}
      initialSubtitle={initialSubtitle}
    />
  );
}

