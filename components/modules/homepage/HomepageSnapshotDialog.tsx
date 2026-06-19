'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAction, useMutation, useQuery } from 'convex/react';
import { AlertTriangle, ChevronDown, Download, Edit3, ExternalLink, Eye, EyeOff, FileUp, Globe, Loader2, PackageCheck, Search, Share2, ShieldCheck, Tag, Trash2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Id } from '@/convex/_generated/dataModel';
import { api } from '@/convex/_generated/api';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/app/admin/components/ui';
import {
  parseHomepageSnapshotFile,
} from '@/lib/homepage-snapshot/client';
import type {
  HomepageSnapshotImportReport,
} from '@/lib/homepage-snapshot/types';

type HomepageSnapshotDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function HomepageSnapshotDialog({ open, onOpenChange }: HomepageSnapshotDialogProps) {
  const router = useRouter();
  const savedSnapshots = useQuery(api.homepageSnapshots.listHomepageSnapshots) ?? [];
  const preflightSnapshot = useMutation(api.homepageSnapshots.preflightHomepageSnapshot);
  const importSnapshot = useMutation(api.homepageSnapshots.importHomepageSnapshot);
  const saveImportedSnapshot = useMutation(api.homepageSnapshots.saveImportedHomepageSnapshot);
  const saveCurrentSnapshot = useMutation(api.homepageSnapshots.saveCurrentHomepageSnapshot);
  const applySnapshot = useMutation(api.homepageSnapshots.applyHomepageSnapshot);
  const removeSnapshot = useMutation(api.homepageSnapshots.removeHomepageSnapshot);
  const exportCurrentSnapshotZip = useAction(api.homepageSnapshots.exportCurrentHomepageSnapshotZip);
  const exportSavedSnapshotZip = useAction(api.homepageSnapshots.exportSavedHomepageSnapshotZip);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveImage = useMutation(api.storage.saveImage);
  const cleanupImportedBinOrphans = useMutation(api.storage.cleanupImportedBinOrphans);
  const toggleSnapshotPublic = useMutation(api.homepageSnapshots.toggleSnapshotPublic);
  const updateSnapshotCategory = useMutation(api.homepageSnapshots.updateSnapshotCategory);
  const quickSyncAllSnapshots = useMutation(api.homepageSnapshots.quickSyncAllSnapshots);

  const categories = useQuery(api.snapshotCategories.listSnapshotCategories) ?? [];
  const ensureDefaultCategory = useMutation(api.snapshotCategories.ensureDefaultSnapshotCategory);
  const createCategory = useMutation(api.snapshotCategories.createSnapshotCategory);
  const deleteCategory = useMutation(api.snapshotCategories.deleteSnapshotCategory);

  const getCategoryLabel = (name: string) => categories.find((c) => c.name === name)?.name ?? name;
  const getCategoryColor = (name: string) => categories.find((c) => c.name === name)?.color ?? '#6b7280';

  const [isExporting, setIsExporting] = useState(false);
  const [isExportingSavedId, setIsExportingSavedId] = useState<string | null>(null);
  const [isSharingCurrent, setIsSharingCurrent] = useState(false);
  const [isSharingSavedId, setIsSharingSavedId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportingUrl, setIsImportingUrl] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'snapshot' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplyingId, setIsApplyingId] = useState<string | null>(null);
  const [profileLabel, setProfileLabel] = useState('');
  const [profileCategory, setProfileCategory] = useState<string>('Khác');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [parsedBundle, setParsedBundle] = useState<Awaited<ReturnType<typeof parseHomepageSnapshotFile>> | null>(null);
  const [report, setReport] = useState<HomepageSnapshotImportReport | null>(null);
  const [snapshotQuery, setSnapshotQuery] = useState('');
  const [snapshotImportUrl, setSnapshotImportUrl] = useState('');
  const [isSyncingAllSnapshots, setIsSyncingAllSnapshots] = useState(false);
  useEffect(() => {
    if (!open) return;
    void ensureDefaultCategory({});
  }, [ensureDefaultCategory, open]);

  const parsedIntegrity = useMemo(() => {
    const demoBundle = parsedBundle?.payload.homepage.demoBundle;
    if (!demoBundle || typeof demoBundle !== 'object') {return null;}
    return (demoBundle as { integrity?: { level?: string; requiredMissing?: string[]; warnings?: string[] } }).integrity ?? null;
  }, [parsedBundle]);

  const filteredSnapshots = useMemo(() => {
    const keyword = snapshotQuery.trim().toLowerCase();
    return savedSnapshots.filter((snapshot) => {
      const snapCat = snapshot.category && snapshot.category !== 'other' ? snapshot.category : 'Khác';
      if (categoryFilter !== 'all' && snapCat !== categoryFilter) return false;
      if (!keyword) return true;
      const createdAt = new Date(snapshot.createdAt).toLocaleDateString('vi-VN');
      return [
        snapshot.label,
        snapshot.slug ?? '',
        `${snapshot.componentCount}`,
        createdAt,
      ].some((value) => value.toLowerCase().includes(keyword));
    });
  }, [savedSnapshots, snapshotQuery, categoryFilter]);

  const downloadUrl = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyText = async (value: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const getResponseFileName = (response: Response) => {
    const disposition = response.headers.get('Content-Disposition') ?? '';
    const match = disposition.match(/filename="?([^";]+)"?/i);
    const fileName = match?.[1]?.trim() || 'snapshot-import.zip';
    return fileName.toLowerCase().endsWith('.zip') ? fileName : `${fileName}.zip`;
  };

  const showExportResultToast = (mediaCount: number, warningCount: number) => {
    if (warningCount > 0) {
      toast.warning(`Đã tạo ZIP nhưng ${warningCount}/${mediaCount} media tải lỗi. Import vẫn chạy và dùng URL gốc cho media thiếu.`);
      return;
    }
    toast.success(`Đã export snapshot ZIP${mediaCount > 0 ? ` kèm ${mediaCount} media` : ''}`);
  };

  const copySnapshotShareUrl = async (url: string, mediaCount: number, warningCount: number) => {
    await copyText(url);
    if (warningCount > 0) {
      toast.warning(`Đã copy link share, nhưng ${warningCount}/${mediaCount} media tải lỗi. Media thiếu sẽ dùng URL gốc khi import.`);
      return;
    }
    toast.success(`Đã copy link share snapshot${mediaCount > 0 ? ` kèm ${mediaCount} media` : ''}`);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportCurrentSnapshotZip({
        label: profileLabel.trim() || 'Tạo nhanh snapshot',
      });
      downloadUrl(result.url, result.fileName);
      showExportResultToast(result.mediaCount, result.warningCount);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Export snapshot thất bại');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareCurrentSnapshot = async () => {
    setIsSharingCurrent(true);
    try {
      const result = await exportCurrentSnapshotZip({
        label: profileLabel.trim() || 'Tạo nhanh snapshot',
      });
      await copySnapshotShareUrl(result.url, result.mediaCount, result.warningCount);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo link share snapshot');
    } finally {
      setIsSharingCurrent(false);
    }
  };

  const handleExportSavedProfile = async (snapshotId: string, fallbackLabel: string) => {
    setIsExportingSavedId(snapshotId);
    try {
      const result = await exportSavedSnapshotZip({
        snapshotId: snapshotId as Id<'homeComponentSnapshots'>,
      });
      downloadUrl(result.url, result.fileName || fallbackLabel);
      showExportResultToast(result.mediaCount, result.warningCount);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tải snapshot ZIP');
    } finally {
      setIsExportingSavedId(null);
    }
  };

  const handleShareSavedProfile = async (snapshotId: string) => {
    setIsSharingSavedId(snapshotId);
    try {
      const result = await exportSavedSnapshotZip({
        snapshotId: snapshotId as Id<'homeComponentSnapshots'>,
      });
      await copySnapshotShareUrl(result.url, result.mediaCount, result.warningCount);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo link share snapshot');
    } finally {
      setIsSharingSavedId(null);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await saveCurrentSnapshot({
        category: profileCategory,
        label: profileLabel.trim() || `zip ${savedSnapshots.length + 1}`,
      });
      setProfileLabel('');
      setProfileCategory('Khác');
      toast.success('Đã lưu profile giao diện');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu profile');
    } finally {
      setIsSaving(false);
    }
  };

  const loadSnapshotFile = async (file: File, successMessage?: string) => {
    const parsed = await parseHomepageSnapshotFile(file);
    setParsedBundle(parsed);
    const nextReport = await preflightSnapshot({ payload: parsed.payload }) as HomepageSnapshotImportReport;
    setReport(nextReport);
    if (parsed.missingMediaPaths.length > 0) {
      toast.warning(`ZIP thiếu ${parsed.missingMediaPaths.length} tệp media. Import vẫn chạy và dùng URL gốc cho media thiếu.`);
    } else {
      toast.success(successMessage ?? `Đã tải snapshot: ${parsed.fileName}`);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {return;}
    try {
      await loadSnapshotFile(file);
    } catch (error) {
      setParsedBundle(null);
      setReport(null);
      toast.error(error instanceof Error ? error.message : 'File snapshot không hợp lệ');
    }
  };

  const handleImportFromUrl = async () => {
    const url = snapshotImportUrl.trim();
    if (!url) {
      toast.error('Cần dán link share snapshot trước');
      return;
    }
    setIsImportingUrl(true);
    try {
      const response = await fetch('/api/homepage-snapshot/import-url', {
        body: JSON.stringify({ url }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error || 'Không tải được snapshot từ link');
      }
      const blob = await response.blob();
      const file = new File([blob], getResponseFileName(response), {
        type: 'application/zip',
      });
      await loadSnapshotFile(file, `Đã tải snapshot từ link: ${file.name}`);
    } catch (error) {
      setParsedBundle(null);
      setReport(null);
      toast.error(error instanceof Error ? error.message : 'Không tải được snapshot từ link');
    } finally {
      setIsImportingUrl(false);
    }
  };

  const uploadImportedMedia = async () => {
    if (!parsedBundle) {return {};}
    const uploadedMediaMap: Record<string, { url: string; storageId?: string | null }> = {};
    const mediaIndexByPath = new Map(parsedBundle.payload.index.mediaIndex.map((item) => [item.logicalPath, item]));
    for (const media of parsedBundle.mediaFiles) {
      const uploadUrl = await generateUploadUrl({});
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': media.file.type || 'application/octet-stream' },
        body: media.file,
      });
      if (!response.ok) {
        throw new Error(`Upload media thất bại: ${media.logicalPath}`);
      }
      const body = await response.json() as { storageId: string };
      const saved = await saveImage({
        storageId: body.storageId as Id<'_storage'>,
        filename: media.file.name,
        folder: media.logicalPath.split('/').slice(0, -1).join('/'),
        mimeType: media.file.type || 'application/octet-stream',
        size: media.file.size,
      });
      const uploaded = {
        url: saved.url ?? media.logicalPath,
        storageId: body.storageId,
      };
      uploadedMediaMap[media.logicalPath] = uploaded;
      const originalUrl = mediaIndexByPath.get(media.logicalPath)?.originalUrl;
      if (originalUrl) {
        uploadedMediaMap[originalUrl] = uploaded;
      }
    }
    return uploadedMediaMap;
  };

  const handleImport = async (mode: 'replace' | 'snapshot') => {
    if (!parsedBundle || !report) {
      toast.error('Cần chọn snapshot hợp lệ trước');
      return;
    }
    if (report.summary.blocking > 0) {
      toast.error('Snapshot đang có lỗi blocking');
      return;
    }

    setIsImporting(true);
    setImportMode(mode);
    try {
      const uploadedMediaMap = await uploadImportedMedia();

      if (mode === 'snapshot') {
        const fallbackLabel = parsedBundle.payload.manifest.snapshotLabel?.trim()
          || parsedBundle.fileName.replace(/\.zip$/i, '')
          || `Snapshot ${savedSnapshots.length + 1}`;
        const result = await saveImportedSnapshot({
          category: profileCategory,
          label: profileLabel.trim() || fallbackLabel,
          payload: parsedBundle.payload,
          uploadedMediaMap,
        }) as { report: HomepageSnapshotImportReport; saved: boolean; snapshotId: Id<'homeComponentSnapshots'> | null };

        setReport(result.report);
        if (!result.saved || !result.snapshotId) {
          toast.error('Import snapshot bị chặn');
          return;
        }
        const cleanup = await cleanupImportedBinOrphans({});
        toast.success('Đã nhập thành snapshot mới, không thay thế site thật');
        if (cleanup.deleted > 0) {
          toast.success(`Đã dọn ${cleanup.deleted} file .bin dư`);
        }
        onOpenChange(false);
        router.push(`/admin/home-components/snapshots/${result.snapshotId}/home-components`);
        return;
      }

      const result = await importSnapshot({
        payload: parsedBundle.payload,
        mode: 'replace_all',
        uploadedMediaMap,
      }) as { applied: boolean; created: number; report: HomepageSnapshotImportReport };

      setReport(result.report);
      if (!result.applied) {
        toast.error('Import snapshot bị chặn');
        return;
      }
      const cleanup = await cleanupImportedBinOrphans({});
      toast.success(`Đã replace ${result.created} home-component từ snapshot`);
      if (cleanup.deleted > 0) {
        toast.success(`Đã dọn ${cleanup.deleted} file .bin dư`);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import snapshot thất bại');
    } finally {
      setIsImporting(false);
      setImportMode(null);
    }
  };

  const handleApplySavedProfile = async (snapshotId: string) => {
    setIsApplyingId(snapshotId);
    try {
      const result = await applySnapshot({ snapshotId: snapshotId as Id<'homeComponentSnapshots'>, mode: 'replace_all' }) as { applied: boolean; created: number };
      if (!result.applied) {
        toast.error('Áp dụng profile bị chặn');
        return;
      }
      toast.success(`Đã áp dụng profile với ${result.created} component`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể áp dụng profile');
    } finally {
      setIsApplyingId(null);
    }
  };

  const handleDeleteSavedProfile = async (snapshotId: string) => {
    try {
      await removeSnapshot({ snapshotId: snapshotId as Id<'homeComponentSnapshots'> });
      toast.success('Đã xóa profile');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa profile');
    }
  };

  const handleQuickSyncAllSnapshots = async () => {
    if (confirm(`Bạn có chắc chắn muốn đồng bộ nhanh cho tất cả ${savedSnapshots.length} snapshot? Việc này sẽ chuẩn hóa thiết kế và sắp xếp thứ tự SpeedDial/Footer cho toàn bộ snapshot.`)) {
      setIsSyncingAllSnapshots(true);
      try {
        const result = await quickSyncAllSnapshots({});
        toast.success(`Đã đồng bộ nhanh thành công cho ${result.count} snapshots!`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Đồng bộ nhanh snapshots thất bại');
      } finally {
        setIsSyncingAllSnapshots(false);
      }
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createCategory({ name: newCategoryName.trim() });
      setNewCategoryName('');
      toast.success('Đã thêm danh mục');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lỗi tạo danh mục');
    }
  };

  const handleDeleteCategory = async (id: Id<'snapshotCategories'>) => {
    try {
      await deleteCategory({ categoryId: id });
      toast.success('Đã xóa danh mục');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lỗi xóa danh mục');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:w-[80vw] sm:max-w-[80vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-cyan-500" />
            Quản lý giao diện trang chủ
          </DialogTitle>
          <DialogDescription>
            Lưu, chia sẻ và khôi phục bố cục trang chủ. Hỗ trợ xuất/nhập file ZIP có đính kèm media.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ── Section 1: Ảnh chụp hiện tại ── */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Ảnh chụp hiện tại</div>
            <div className="text-xs text-slate-500">
              Chỉ đọc dữ liệu khi bấm tải/lưu để giảm DB bandwidth. ZIP sẽ tự đính kèm media và phụ thuộc.
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="success">Tự chứa dữ liệu</Badge>
              <Badge variant="info">Đính kèm media</Badge>
              <Badge variant="outline">Tải qua cache ZIP</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="accent" size="sm" onClick={() => { void handleExport(); }} disabled={isExporting}>
                {isExporting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                Tải ZIP
              </Button>
              <Button variant="outline" size="sm" onClick={() => { void handleShareCurrentSnapshot(); }} disabled={isSharingCurrent}>
                {isSharingCurrent ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Share2 className="mr-1.5 h-3.5 w-3.5" />}
                Copy link
              </Button>
              <div className="flex flex-1 min-w-[200px] gap-2 flex-wrap">
                <input
                  value={profileLabel}
                  onChange={(event) => setProfileLabel(event.target.value)}
                  placeholder="Đặt tên, VD: Giao diện mùa hè"
                  className="flex-1 min-w-[140px] rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <div className="relative">
                  <select
                    value={profileCategory}
                    onChange={(e) => setProfileCategory(e.target.value)}
                    className="h-8 rounded-md border border-slate-200 bg-white pl-7 pr-2 text-xs dark:border-slate-700 dark:bg-slate-900 appearance-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <Tag className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                </div>
                <Button variant="outline" size="sm" onClick={() => { void handleSaveProfile(); }} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                  Lưu
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Đã lưu ({savedSnapshots.length})</div>
            {savedSnapshots.length === 0 ? (
              <div className="text-xs text-slate-500">Chưa lưu giao diện nào.</div>
            ) : (
              <div className="space-y-3">
                {/* Search + Category filter */}
                <div className="flex gap-2 flex-wrap items-center">
                  <div className="relative flex-1 min-w-[160px]">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={snapshotQuery}
                      onChange={(event) => setSnapshotQuery(event.target.value)}
                      placeholder="Gõ để tìm snapshot..."
                      className="pl-8"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="h-9 rounded-md border border-slate-200 bg-white pl-7 pr-6 text-xs dark:border-slate-700 dark:bg-slate-900 appearance-none cursor-pointer"
                    >
                      <option value="all">Tất cả danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    <Tag className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                    <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsManagingCategories(!isManagingCategories)}>
                    Quản lý danh mục
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    onClick={() => { void handleQuickSyncAllSnapshots(); }}
                    disabled={isSyncingAllSnapshots || savedSnapshots.length === 0}
                  >
                    {isSyncingAllSnapshots ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="h-3.5 w-3.5" />
                    )}
                    Đồng bộ nhanh tất cả ({savedSnapshots.length})
                  </Button>
                </div>

                {isManagingCategories && (
                  <div className="rounded border border-slate-200 bg-slate-50 p-3 space-y-3 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Danh sách danh mục</div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <div key={cat._id} className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-1 text-xs dark:bg-slate-800 dark:border-slate-700">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || '#6b7280' }} />
                          {cat.name}
                          {!cat.isSystem && (
                            <button onClick={() => { void handleDeleteCategory(cat._id); }} className="ml-1 text-slate-400 hover:text-red-500">
                              &times;
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        size={1}
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Tên danh mục mới"
                        className="h-8 max-w-[200px] text-xs"
                        onKeyDown={(e) => { if (e.key === 'Enter') void handleCreateCategory(); }}
                      />
                      <Button size="sm" className="h-8" onClick={() => { void handleCreateCategory(); }}>Thêm</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-[260px] overflow-y-auto">
                  {filteredSnapshots.length === 0 ? (
                    <div className="px-2 py-3 text-xs text-slate-500">Không tìm thấy snapshot phù hợp.</div>
                  ) : null}
                  {filteredSnapshots.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col gap-2 rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{item.label}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {/* Category badge + inline select */}
                          <div className="relative group/cat">
                            <span
                              className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium cursor-pointer select-none"
                              style={{ background: `${getCategoryColor(item.category && item.category !== 'other' ? item.category : 'Khác')}20`, color: getCategoryColor(item.category && item.category !== 'other' ? item.category : 'Khác') }}
                            >
                              <Tag className="h-2.5 w-2.5" />
                              {getCategoryLabel(item.category && item.category !== 'other' ? item.category : 'Khác')}
                            </span>
                            <select
                              className="absolute inset-0 opacity-0 cursor-pointer w-full"
                              value={item.category && item.category !== 'other' ? item.category : 'Khác'}
                              onChange={(e) => { void updateSnapshotCategory({ snapshotId: item._id, category: e.target.value }); }}
                            >
                              {categories.map((cat) => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                          <span className="text-[11px] text-slate-500 truncate">
                            {item.componentCount} thành phần · {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                            {item.slug ? <span className="ml-1 text-slate-400">· /demo/{item.slug}</span> : null}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <Button
                          variant={item.publicEnabled ? 'default' : 'outline'}
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => { void toggleSnapshotPublic({ snapshotId: item._id, enabled: !item.publicEnabled }); }}
                          title={item.publicEnabled ? 'Đang công khai — bấm để ẩn' : 'Đang ẩn — bấm để công khai'}
                        >
                          {item.publicEnabled ? <Globe className="mr-1 h-3 w-3" /> : <EyeOff className="mr-1 h-3 w-3" />}
                          {item.publicEnabled ? 'Công khai' : 'Riêng tư'}
                        </Button>
                        {item.slug && item.publicEnabled ? (
                          <Link href={`/demo/${item.slug}`} target="_blank">
                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              Xem
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/admin/home-components/snapshots/${item._id}/demo`} target="_blank">
                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                              <Eye className="mr-1 h-3 w-3" />
                              Xem thử
                            </Button>
                          </Link>
                        )}
                        <Link href={`/admin/home-components/snapshots/${item._id}/home-components`} onClick={() => onOpenChange(false)}>
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                            <Edit3 className="mr-1 h-3 w-3" />
                            Sửa
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => { void handleExportSavedProfile(item._id, item.label); }}
                          disabled={Boolean(isExportingSavedId)}
                          title="Tải snapshot ZIP"
                        >
                          {isExportingSavedId === item._id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Download className="mr-1 h-3 w-3" />}
                          Tải
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => { void handleShareSavedProfile(item._id); }}
                          disabled={Boolean(isSharingSavedId)}
                          title="Copy link share snapshot"
                        >
                          {isSharingSavedId === item._id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Share2 className="mr-1 h-3 w-3" />}
                          Share
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => { void handleApplySavedProfile(item._id); }} disabled={isApplyingId === item._id}>
                          {isApplyingId === item._id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                          Áp dụng
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { void handleDeleteSavedProfile(item._id); }}>
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Section 2.5: Link to template gallery ── */}
          {savedSnapshots.length > 0 && (
            <div className="flex items-center gap-2 px-1">
              <Link href="/admin/home-components/templates" onClick={() => onOpenChange(false)}>
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs gap-1.5">
                  <Eye className="h-3 w-3" />
                  Kho giao diện (Admin)
                </Button>
              </Link>
              <Link href="/theme-gallery" target="_blank">
                <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs gap-1.5">
                  <ExternalLink className="h-3 w-3" />
                  Trang khách hàng
                </Button>
              </Link>
            </div>
          )}

          {/* ── Section 3: Nhập từ link hoặc ZIP ── */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Nhập từ link hoặc file ZIP</div>
            <div className="text-xs text-slate-500">
              Dán link share để hệ thống tự tải ZIP, hoặc chọn file ZIP thủ công.
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={snapshotImportUrl}
                onChange={(event) => setSnapshotImportUrl(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') void handleImportFromUrl(); }}
                placeholder="Dán link share snapshot..."
                className="text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { void handleImportFromUrl(); }}
                disabled={isImportingUrl || !snapshotImportUrl.trim()}
                className="sm:w-auto"
              >
                {isImportingUrl ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Share2 className="mr-1.5 h-3.5 w-3.5" />}
                Nhập link
              </Button>
            </div>
            <label className="inline-flex">
              <input type="file" accept=".zip,application/zip" className="hidden" onChange={(event) => { void handleFileChange(event); }} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(event) => {
                  const input = event.currentTarget.parentElement?.querySelector('input[type=file]') as HTMLInputElement | null;
                  input?.click();
                }}
              >
                <FileUp className="mr-1.5 h-3.5 w-3.5" />
                Chọn file ZIP
              </Button>
            </label>

            {parsedBundle ? (
              <div className="space-y-2 rounded-md bg-slate-50 dark:bg-slate-900 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{parsedBundle.fileName}</span>
                </div>
                <div className="text-xs text-slate-500">
                  {parsedBundle.payload.homepage.components.length} thành phần · {parsedBundle.mediaFiles.length} tệp media
                </div>
                {report ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {report.summary.blocking > 0 ? (
                        <Badge variant="destructive">Lỗi chặn: {report.summary.blocking}</Badge>
                      ) : (
                        <Badge variant="success">Sẵn sàng nhập</Badge>
                      )}
                      {report.summary.warnings > 0 ? (
                        <Badge variant="warning">Cảnh báo: {report.summary.warnings}</Badge>
                      ) : null}
                    </div>
                    {parsedIntegrity ? (
                      <div className="rounded-md border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-900 dark:text-slate-100">
                          {parsedIntegrity.requiredMissing?.length ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          ) : (
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                          Tính toàn vẹn dữ liệu
                        </div>
                        {parsedIntegrity.requiredMissing?.length ? (
                          <ul className="list-disc pl-5 text-xs text-red-500 space-y-0.5">
                            {parsedIntegrity.requiredMissing.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-xs text-slate-500">Dữ liệu đầy đủ, không thiếu thành phần quan trọng.</div>
                        )}
                        {parsedIntegrity.warnings?.length ? (
                          <ul className="list-disc pl-5 text-xs text-amber-600 space-y-0.5">
                            {parsedIntegrity.warnings.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
          <Button
            variant="outline"
            onClick={() => { void handleImport('snapshot'); }}
            disabled={!parsedBundle || !report || isImporting || report.summary.blocking > 0}
          >
            {importMode === 'snapshot' ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            Nhập thành snapshot mới
          </Button>
          <Button onClick={() => { void handleImport('replace'); }} disabled={!parsedBundle || !report || isImporting || report.summary.blocking > 0}>
            {importMode === 'replace' ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            Nhập và thay thế
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
