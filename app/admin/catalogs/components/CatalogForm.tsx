'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { BookOpen, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../../components/ui';
import { ImageUploader } from '../../components/ImageUploader';
import * as pdfjsLib from 'pdfjs-dist';

function generateSlug(text: string) {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Config PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

type CatalogStatus = 'Draft' | 'Published' | 'Archived';

interface CatalogFormProps {
  initialData?: {
    _id: Id<'catalogs'>;
    title: string;
    slug: string;
    description?: string;
    pdfStorageId?: Id<'_storage'> | null;
    pdfUrl?: string | null;
    embedUrl?: string;
    pageImages?: (Id<'_storage'> | null)[];
    totalPages?: number;
    thumbnail?: string;
    thumbnailStorageId?: Id<'_storage'> | null;
    status: CatalogStatus;
    order: number;
    featured?: boolean;
    metaTitle?: string;
    metaDescription?: string;
  };
}

export function CatalogForm({ initialData }: CatalogFormProps) {
  const router = useRouter();
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl); 
  
  const createCatalog = useMutation(api.catalogs.create);
  const updateCatalog = useMutation(api.catalogs.update);
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: 'catalogs' });

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<CatalogStatus>(initialData?.status || 'Draft');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [order, _setOrder] = useState<number>(initialData?.order || 0);
  
  // PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfStorageId, _setPdfStorageId] = useState<Id<'_storage'> | undefined>(initialData?.pdfStorageId || undefined);
  const [totalPages, _setTotalPages] = useState<number | undefined>(initialData?.totalPages);
  const [pageImages, _setPageImages] = useState<(Id<'_storage'> | null)[]>((initialData?.pageImages as (Id<'_storage'> | null)[]) || []);
  
  // Heyzine embed
  const [embedUrl, setEmbedUrl] = useState(initialData?.embedUrl || '');
  
  // Thumbnail
  const [thumbnail, setThumbnail] = useState<string | undefined>(initialData?.thumbnail);
  const [thumbnailStorageId, setThumbnailStorageId] = useState<Id<'_storage'> | undefined>(initialData?.thumbnailStorageId || undefined);
  
  // SEO
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('');

  const isEdit = !!initialData;

  useEffect(() => {
    if (!isEdit && settingsData) {
      const defaultStatus = settingsData.find((s) => s.settingKey === 'defaultStatus')?.value;
      if (defaultStatus === 'published') setStatus('Published');
    }
  }, [settingsData, isEdit]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isEdit) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        toast.error('Vui lòng chọn file PDF');
        return;
      }
      setPdfFile(file);
    }
  };

  const renderPageToBlob = async (pdfDoc: any, pageNum: number, scale = 1.5): Promise<Blob> => {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    
    await page.render({ canvasContext: ctx, viewport }).promise;
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.85);
    });
  };

  const processAndUploadPdf = async (): Promise<{ pdfId: Id<'_storage'>, imgIds: (Id<'_storage'> | null)[], pages: number } | null> => {
    if (!pdfFile) return null;

    try {
      setUploadStep('Đang tải PDF gốc lên server...');
      setUploadProgress(10);
      
      const uploadUrl = await generateUploadUrl();
      const pdfUploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": pdfFile.type },
        body: pdfFile,
      });
      
      if (!pdfUploadRes.ok) throw new Error("Lỗi khi tải PDF lên");
      const { storageId: pdfId } = await pdfUploadRes.json();
      
      setUploadStep('Đang đọc PDF để trích xuất ảnh...');
      setUploadProgress(30);
      
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pagesCount = pdfDoc.numPages;
      
      const imgIds: (Id<'_storage'> | null)[] = [];
      
      for (let i = 1; i <= pagesCount; i++) {
        setUploadStep(`Đang xử lý và tải lên trang ${i}/${pagesCount}...`);
        setUploadProgress(30 + Math.floor((i / pagesCount) * 60));
        
        try {
          const blob = await renderPageToBlob(pdfDoc, i, 1.5);
          const imgUploadUrl = await generateUploadUrl();
          const imgUploadRes = await fetch(imgUploadUrl, {
            method: "POST",
            headers: { "Content-Type": "image/jpeg" },
            body: blob,
          });
          
          if (!imgUploadRes.ok) throw new Error(`Lỗi upload ảnh trang ${i}`);
          const { storageId: imgId } = await imgUploadRes.json();
          imgIds.push(imgId);
        } catch (err) {
          console.error(`Failed to process page ${i}`, err);
          imgIds.push(null);
        }
      }
      
      setUploadStep('Hoàn tất tải lên!');
      setUploadProgress(100);
      
      return { pdfId, imgIds, pages: pagesCount };
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi xử lý PDF');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      toast.error('Vui lòng nhập tiêu đề và đường dẫn (slug)');
      return;
    }

    if (!isEdit && !pdfFile && !embedUrl) {
      toast.error('Vui lòng chọn file PDF hoặc nhập link nhúng Heyzine để tạo catalog');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalPdfStorageId = pdfStorageId;
      let finalPageImages = pageImages;
      let finalTotalPages = totalPages;

      if (pdfFile) {
        const result = await processAndUploadPdf();
        if (result) {
          finalPdfStorageId = result.pdfId;
          finalPageImages = result.imgIds;
          finalTotalPages = result.pages;
        }
      }

      if (!finalPdfStorageId && !embedUrl) {
        throw new Error("Không có PDF ID và cũng không có Link nhúng");
      }

      const payload = {
        title,
        slug,
        description,
        status,
        featured,
        order: isEdit ? order : (Date.now() / 1000), // temp order for new
        pdfStorageId: finalPdfStorageId || undefined,
        embedUrl: embedUrl || undefined,
        pageImages: finalPageImages,
        totalPages: finalTotalPages,
        thumbnail,
        thumbnailStorageId,
        metaTitle,
        metaDescription,
      };

      if (isEdit) {
        await updateCatalog({ id: initialData._id, ...payload, order });
        toast.success('Đã cập nhật catalog thành công!');
        router.push('/admin/catalogs');
      } else {
        await createCatalog({ ...payload, order: 0 }); // order will be auto-set if needed, or 0
        toast.success('Đã tạo catalog mới thành công!');
        router.push('/admin/catalogs');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Có lỗi xảy ra khi lưu catalog');
    } finally {
      setIsSubmitting(false);
      setUploadStep('');
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            {isEdit ? 'Chỉnh sửa Catalog' : 'Tạo Catalog Mới'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/catalogs')}>Hủy</Button>
          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tiêu đề *</Label>
                <Input value={title} onChange={handleTitleChange} placeholder="Nhập tiêu đề catalog..." required />
              </div>
              
              <div>
                <Label>Đường dẫn (Slug) *</Label>
                <Input value={slug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)} placeholder="duong-dan-catalog" required />
              </div>

              <div>
                <Label>Đường dẫn nhúng Heyzine (Embed URL)</Label>
                <Input value={embedUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmbedUrl(e.target.value)} placeholder="Ví dụ: https://heyzine.com/flip-book/e3752e0430.html" />
                <p className="text-xs text-gray-500 mt-1">Dán link sách lật Heyzine của bạn để hiển thị trực quan (Khuyên dùng).</p>
              </div>

              <div>
                <Label>Mô tả ngắn</Label>
                <textarea className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300" value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} placeholder="Mô tả ngắn gọn về catalog..." rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>File PDF Catalog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEdit && !pdfFile && (
                <div className="p-4 bg-gray-50 border rounded flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-5 h-5 text-red-500" />
                    <span>Đã tải lên file PDF ({totalPages} trang)</span>
                  </div>
                </div>
              )}
              
              <div>
                <Label>{isEdit ? 'Thay đổi file PDF (tùy chọn)' : 'Tải lên file PDF (Tùy chọn)'}</Label>
                <Input type="file" accept="application/pdf" onChange={handlePdfChange} />
                <p className="text-xs text-gray-500 mt-1">Đính kèm file PDF gốc để người dùng tải về.</p>
              </div>

              {isSubmitting && uploadProgress > 0 && (
                <div className="mt-4 p-4 border rounded bg-blue-50/50">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-blue-700">{uploadStep}</span>
                    <span className="text-blue-700">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tiêu đề SEO (Meta Title)</Label>
                <Input value={metaTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetaTitle(e.target.value)} placeholder="Mặc định sẽ lấy tiêu đề catalog" />
              </div>
              <div>
                <Label>Mô tả SEO (Meta Description)</Label>
                <textarea className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300" value={metaDescription} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMetaDescription(e.target.value)} placeholder="Mặc định sẽ lấy mô tả ngắn" rows={2} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Trạng thái hiển thị</Label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as CatalogStatus)}
                  className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Published">Đã xuất bản (Hiện)</option>
                  <option value="Draft">Bản nháp (Ẩn)</option>
                  <option value="Archived">Lưu trữ</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="featured" 
                  checked={featured} 
                  onChange={(e) => setFeatured(e.target.checked)} 
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                />
                <Label htmlFor="featured">Đánh dấu nổi bật</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ảnh đại diện (Thumbnail)</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader
                value={thumbnail}
                storageId={thumbnailStorageId}
                onChange={(url: string | undefined, id?: Id<'_storage'>) => {
                  setThumbnail(url);
                  setThumbnailStorageId(id);
                }}
                aspectRatio="auto"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
