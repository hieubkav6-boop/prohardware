'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { BookOpen, Edit, Loader2, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../components/ui';
import { ModuleGuard } from '../components/ModuleGuard';
import { AdminDragHandle, buildOrderUpdates, getReorderedItems, useAdminDndSensors } from '../components/TableUtilities';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LexicalEditor } from '../components/LexicalEditor';

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

type CatalogStatus = 'Published' | 'Draft' | 'Archived';

interface CatalogItem {
  _id: Id<'catalogs'>;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  pdfStorageId?: Id<'_storage'>;
  pdfUrl?: string | null;
  status: CatalogStatus;
  order: number;
  featured?: boolean;
  pageImages?: (string | null)[];
  totalPages?: number;
}

export default function CatalogsModulePage() {
  return (
    <ModuleGuard moduleKey="catalogs">
      <CatalogsCRUDContent />
    </ModuleGuard>
  );
}

function CatalogsCRUDContent() {
  const listQuery = useQuery(api.catalogs.listAdminWithOffset, { limit: 100, offset: 0 });
  const createMutation = useMutation(api.catalogs.create);
  const updateMutation = useMutation(api.catalogs.update);
  const deleteMutation = useMutation(api.catalogs.remove);
  const reorderMutation = useMutation(api.catalogs.reorder);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  // Settings API
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: 'catalogs' });
  const setSettingMutation = useMutation(api.admin.modules.setModuleSetting);

  // States for CRUD
  const [editingCatalog, setEditingCatalog] = useState<CatalogItem | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<CatalogStatus>('Draft');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractionProgress, setExtractionProgress] = useState<{ current: number; total: number } | null>(null);

  // States for Page Config settings
  const [pageTitle, setPageTitle] = useState('Catalog & Tài Liệu');
  const [pageSubtitle, setPageSubtitle] = useState('Chúng tôi Chuyên Phân Phối các dòng Thiết Bị Vệ Sinh uy tín như: van, vòi hồ, sen tắm, vòi sen, vòi lavabo... với thiết kế hiện đại, độ bền cao, đáp ứng mọi nhu cầu từ hộ gia đình đến công trình lớn.');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const dndSensors = useAdminDndSensors();

  const catalogs = useMemo(() => listQuery ?? [], [listQuery]);
  const isLoading = listQuery === undefined;

  // Sync edit data when editingCatalog changes
  useEffect(() => {
    if (editingCatalog) {
      setTitle(editingCatalog.title);
      setSlug(editingCatalog.slug);
      setCategory(editingCatalog.category || '');
      setDescription(editingCatalog.description || '');
      setStatus(editingCatalog.status);
      setPdfFile(null);
    } else {
      setTitle('');
      setSlug('');
      setCategory('');
      setDescription('');
      setStatus('Draft');
      setPdfFile(null);
    }
    setExtractionProgress(null);
  }, [editingCatalog]);

  // Sync settings when loaded
  useEffect(() => {
    if (settingsData && settingsData.length > 0) {
      const titleItem = settingsData.find(s => s.settingKey === 'catalogsTitle');
      const subtitleItem = settingsData.find(s => s.settingKey === 'catalogsSubtitle');
      if (titleItem) setPageTitle(titleItem.value || 'Catalog & Tài Liệu');
      if (subtitleItem) setPageSubtitle(subtitleItem.value || '');
    }
  }, [settingsData]);

  const handleSavePageSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await setSettingMutation({
        moduleKey: 'catalogs',
        settingKey: 'catalogsTitle',
        value: pageTitle.trim(),
      });
      await setSettingMutation({
        moduleKey: 'catalogs',
        settingKey: 'catalogsSubtitle',
        value: pageSubtitle.trim(),
      });
      toast.success('Đã lưu cấu hình trang Catalog thành công!');
    } catch {
      toast.error('Lỗi khi lưu cấu hình trang');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!editingCatalog) {
      setSlug(generateSlug(val));
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

  const handleToggleStatus = async (catalog: CatalogItem) => {
    const newStatus: CatalogStatus = catalog.status === 'Published' ? 'Draft' : 'Published';
    try {
      await updateMutation({
        id: catalog._id,
        status: newStatus,
      });
      toast.success(`Đã chuyển trạng thái sang: ${newStatus === 'Published' ? 'Hiện' : 'Ẩn'}`);
    } catch {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (catalog: CatalogItem) => {
    if (!confirm(`Bạn có chắc muốn xóa catalog "${catalog.title}"?`)) return;
    try {
      await deleteMutation({ id: catalog._id });
      toast.success('Đã xóa catalog thành công');
      if (editingCatalog?._id === catalog._id) {
        setEditingCatalog(null);
      }
    } catch {
      toast.error('Lỗi khi xóa catalog');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const reordered = getReorderedItems(catalogs, active.id as string, over.id as string, (c: any) => c._id);
    if (!reordered) return;
    
    const updates = buildOrderUpdates(
      reordered, 
      catalogs.map((c: any) => c.order ?? 0), 
      (c: any) => c._id, 
      (c: any, idx) => catalogs.length - idx
    );

    try {
      await reorderMutation({ updates });
      toast.success('Đã cập nhật thứ tự');
    } catch {
      toast.error('Không thể lưu thứ tự mới');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng điền tiêu đề');
      return;
    }
    const finalSlug = slug.trim() || generateSlug(title);

    if (!editingCatalog && !pdfFile) {
      toast.error('Vui lòng đính kèm file PDF');
      return;
    }

    setIsSubmitting(true);
    setExtractionProgress(null);
    try {
      let finalPdfStorageId = editingCatalog?.pdfStorageId;
      let finalPageImages = editingCatalog?.pageImages;
      let finalTotalPages = editingCatalog?.totalPages;

      if (pdfFile) {
        // 1. Upload PDF gốc
        const uploadUrl = await generateUploadUrl();
        const pdfUploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": pdfFile.type },
          body: pdfFile,
        });
        if (!pdfUploadRes.ok) throw new Error("Lỗi khi tải file PDF lên hệ thống");
        const { storageId: pdfId } = await pdfUploadRes.json();
        finalPdfStorageId = pdfId;

        // 2. Trích xuất từng trang PDF thành ảnh JPEG và upload lên storage
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdfjs = await import('pdfjs-dist');
        const version = pdfjs.version || '6.0.227';
        
        // Cấu hình CDN worker cho pdfjs-dist
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const total = pdf.numPages;
        finalTotalPages = total;

        const pageIds: string[] = [];
        for (let pageNum = 1; pageNum <= total; pageNum++) {
          setExtractionProgress({ current: pageNum, total });
          
          const page = await pdf.getPage(pageNum);
          // Scale 1.5 mang lại độ phân giải tốt và dung lượng ảnh tối ưu
          const viewport = page.getViewport({ scale: 1.5 });
          
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext('2d');
          if (!context) {
            throw new Error('Không thể khởi tạo môi trường Canvas 2D');
          }
          
          await page.render({
            canvasContext: context,
            viewport: viewport
          } as any).promise;
          
          const blob = await new Promise<Blob | null>((resolve) => {
            // Trích xuất thành WebP để dung lượng ảnh cực kỳ nhẹ và load nhanh hơn JPEG
            canvas.toBlob((b) => resolve(b), 'image/webp', 0.85);
          });
          
          if (!blob) {
            throw new Error(`Lỗi khi trích xuất hình ảnh trang ${pageNum}`);
          }
          
          const uploadUrlPage = await generateUploadUrl();
          const pageUploadRes = await fetch(uploadUrlPage, {
            method: "POST",
            headers: { "Content-Type": "image/webp" },
            body: blob,
          });
          
          if (!pageUploadRes.ok) {
            throw new Error(`Lỗi khi lưu trữ hình ảnh trang ${pageNum}`);
          }
          
          const { storageId: pageImageId } = await pageUploadRes.json();
          pageIds.push(pageImageId);
        }
        
        finalPageImages = pageIds;
      }

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        category: category.trim(),
        description: description.trim(),
        pdfStorageId: finalPdfStorageId!,
        pageImages: finalPageImages ? (finalPageImages.filter((img): img is string => img !== null) as Id<'_storage'>[]) : undefined,
        totalPages: finalTotalPages,
        status,
        featured: false,
        order: editingCatalog ? editingCatalog.order : 0,
      };

      if (editingCatalog) {
        await updateMutation({ id: editingCatalog._id, ...payload });
        toast.success('Đã cập nhật catalog thành công!');
        setEditingCatalog(null);
      } else {
        await createMutation({ ...payload, order: catalogs.length + 1 });
        toast.success('Đã tạo catalog mới thành công!');
      }

      // Reset form
      setTitle('');
      setSlug('');
      setCategory('');
      setDescription('');
      setStatus('Draft');
      setPdfFile(null);
    } catch (err: any) {
      toast.error(err.message || 'Đã có lỗi xảy ra trong quá trình lưu trữ');
    } finally {
      setIsSubmitting(false);
      setExtractionProgress(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#C21A1A] animate-pulse" />
            Quản lý Catalog
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý catalog dưới dạng sách lật SPA, tự động trích xuất các trang từ file PDF (One-Page CRUD).
          </p>
        </div>
      </div>

      {/* Card Cấu hình Trang - Full 12 cột */}
      <Card className="shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-base font-semibold">Cấu hình Giao diện Trang</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSavePageSettings} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pageTitle" className="text-xs font-semibold">Tiêu đề chính trang</Label>
              <Input
                id="pageTitle"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="Ví dụ: Catalog & Tài Liệu"
                disabled={isSavingSettings}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold block">Mô tả giới thiệu trang (RichText)</Label>
              <LexicalEditor 
                onChange={setPageSubtitle} 
                initialContent={pageSubtitle} 
                resetKey={`catalogs-subtitle-${settingsData ? 'loaded' : 'loading'}`}
              />
            </div>
            <div className="pt-2 flex justify-end">
              <Button 
                type="submit" 
                variant="accent" 
                size="sm"
                disabled={isSavingSettings}
              >
                {isSavingSettings ? 'Đang lưu...' : 'Lưu cấu hình'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: Danh sách (Dnd) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-base font-semibold">Danh sách Catalog ({catalogs.length})</CardTitle>
            </CardHeader>
            
            <div className="p-2 sm:p-4">
              {isLoading ? (
                <div className="flex h-48 items-center justify-center text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin text-[#C21A1A] mr-2" />
                  <span>Đang tải danh sách...</span>
                </div>
              ) : catalogs.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-gray-400 gap-2 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                  <BookOpen className="w-8 h-8 text-gray-300" />
                  <span>Chưa có catalog nào được tạo.</span>
                </div>
              ) : (
                <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={catalogs.map((c: any) => c._id)} strategy={verticalListSortingStrategy}>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {catalogs.map((catalog: any) => (
                        <SortableRowItem
                          key={catalog._id}
                          catalog={catalog}
                          isEditing={editingCatalog?._id === catalog._id}
                          onEdit={setEditingCatalog}
                          onDelete={handleDelete}
                          onToggleStatus={handleToggleStatus}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </Card>
        </div>

        {/* Cột phải: Form Inline CRUD */}
        <div className="lg:col-span-5 space-y-6">
          {/* Form Thêm/Cập nhật Catalog */}
          <Card className={`shadow-sm transition-all duration-300 border bg-white dark:bg-gray-900 ${
            editingCatalog 
              ? 'border-[#C21A1A]/50 shadow-[#C21A1A]/5 dark:border-[#C21A1A]/50 bg-red-50/5' 
              : 'border-gray-200 dark:border-gray-800'
          }`}>
            <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                {editingCatalog ? (
                  <>
                    <Edit className="w-4 h-4 text-[#C21A1A]" />
                    Cập nhật Catalog
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-emerald-600" />
                    Thêm Catalog Mới
                  </>
                )}
              </CardTitle>
              {editingCatalog && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setEditingCatalog(null)}
                  title="Hủy chỉnh sửa, quay về thêm mới"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tiêu đề */}
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold">Tiêu đề *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Ví dụ: Catalog Thiết Bị Vệ Sinh 2024"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Danh mục */}
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-semibold">Danh mục phân loại</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ví dụ: Thiết bị vệ sinh, Phụ kiện..."
                    disabled={isSubmitting}
                  />
                </div>

                {/* File PDF */}
                <div className="space-y-1.5">
                  <Label htmlFor="pdf" className="text-xs font-semibold">
                    {editingCatalog ? 'Thay đổi file PDF đính kèm' : 'File PDF đính kèm *'}
                  </Label>
                  <Input
                    id="pdf"
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfChange}
                    required={!editingCatalog}
                    disabled={isSubmitting}
                  />
                  <p className="text-[11px] text-gray-500 leading-normal">
                    {editingCatalog && editingCatalog.pdfStorageId && (
                      <span className="text-emerald-600 block mb-0.5">✓ Đã đính kèm file PDF gốc.</span>
                    )}
                    Hệ thống sẽ tự động chuyển đổi file PDF thành các trang hình ảnh.
                  </p>
                </div>

                {/* Tiến trình trích xuất */}
                {extractionProgress && (
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-600 dark:text-blue-400 space-y-2 animate-pulse">
                    <div className="flex justify-between font-semibold">
                      <span>Đang xử lý trang tài liệu...</span>
                      <span>{Math.round((extractionProgress.current / extractionProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 dark:bg-blue-400 h-full transition-all duration-300"
                        style={{ width: `${(extractionProgress.current / extractionProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Trang {extractionProgress.current} trên {extractionProgress.total}. Vui lòng chờ cho đến khi hoàn thành.
                    </p>
                  </div>
                )}

                {/* Mô tả */}
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-semibold">Mô tả ngắn</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[70px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C21A1A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Trạng thái hiển thị */}
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs font-semibold">Trạng thái hiển thị</Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CatalogStatus)}
                    className="w-full flex h-10 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C21A1A] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    disabled={isSubmitting}
                  >
                    <option value="Published">Đã xuất bản (Hiện)</option>
                    <option value="Draft">Bản nháp (Ẩn)</option>
                    <option value="Archived">Lưu trữ</option>
                  </select>
                </div>

                <div className="pt-3 flex gap-2 justify-end">
                  {editingCatalog && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingCatalog(null)}
                      disabled={isSubmitting}
                    >
                      Hủy sửa
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    variant="accent" 
                    size="sm"
                    className="min-w-[100px] flex items-center justify-center gap-1.5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : editingCatalog ? (
                      'Cập nhật'
                    ) : (
                      'Tạo mới'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Subcomponent for Dnd Row Item
interface SortableRowItemProps {
  catalog: CatalogItem;
  isEditing: boolean;
  onEdit: (catalog: CatalogItem) => void;
  onDelete: (catalog: CatalogItem) => void;
  onToggleStatus: (catalog: CatalogItem) => void;
}

function SortableRowItem({ 
  catalog, 
  isEditing, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: SortableRowItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: catalog._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center justify-between py-3 px-2 rounded-lg transition-colors ${
        isEditing 
          ? 'bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/50' 
          : 'hover:bg-gray-50/70 dark:hover:bg-gray-800/40 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <AdminDragHandle listeners={listeners} attributes={attributes} />
        
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">
              {catalog.title}
            </span>
          </div>
          {catalog.category && (
            <span className="text-xs text-emerald-600 dark:text-emerald-500 block truncate mt-0.5 font-medium">
              Danh mục: {catalog.category}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Toggle Status badge (quick toggle status) */}
        <button 
          type="button"
          onClick={() => onToggleStatus(catalog)}
          className="focus:outline-none"
        >
          <Badge
            variant={catalog.status === 'Published' ? 'success' : 'secondary'}
            className="cursor-pointer select-none text-[10px] py-0.5 px-2 font-medium"
          >
            {catalog.status === 'Published' ? 'Đang hiện' : 'Đang ẩn'}
          </Badge>
        </button>

        {/* Actions buttons */}
        <div className="flex items-center gap-0.5 border-l border-gray-100 dark:border-gray-800 pl-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            onClick={() => onEdit(catalog)}
            title="Sửa"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            onClick={() => onDelete(catalog)}
            title="Xóa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
