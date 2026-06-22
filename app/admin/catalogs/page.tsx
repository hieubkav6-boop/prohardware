'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { BookOpen, ChevronDown, Copy, Edit, ExternalLink, Loader2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Badge, Button, Card, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui';
import { ModuleGuard } from '../components/ModuleGuard';
import { usePersistedPageSize } from '../components/usePersistedPageSize';
import { AdminDragHandle, buildOrderUpdates, BulkActionBar, generatePaginationItems, getReorderedItems, SelectCheckbox, SortableTableRow, useAdminDndSensors } from '../components/TableUtilities';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const STATUS_LABEL: Record<string, string> = {
  Published: 'Hiện',
  Draft: 'Ẩn',
  Archived: 'Lưu trữ',
};

type CatalogStatus = '' | 'Published' | 'Draft' | 'Archived';

export default function CatalogsListPage() {
  return (
    <ModuleGuard moduleKey="catalogs">
      <CatalogsContent />
    </ModuleGuard>
  );
}

function CatalogsContent() {
  const settingsData = useQuery(api.admin.modules.listModuleSettings, { moduleKey: 'catalogs' });
  const deleteCatalog = useMutation(api.catalogs.remove);
  const duplicateCatalog = useMutation(api.catalogs.duplicate);
  const reorderCatalogs = useMutation(api.catalogs.reorder);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<CatalogStatus>('');
  const [manualSelectedIds, setManualSelectedIds] = useState<Id<'catalogs'>[]>([]);
  const [selectionMode, setSelectionMode] = useState<'manual' | 'all'>('manual');
  const [currentPage, setCurrentPage] = useState(1);
  const [cloningCatalogId, setCloningCatalogId] = useState<Id<'catalogs'> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const dndSensors = useAdminDndSensors();
  const isSelectAllActive = selectionMode === 'all';

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const catalogsPerPage = useMemo(() => {
    const setting = settingsData?.find((item) => item.settingKey === 'catalogsPerPage');
    return (setting?.value as number) || 12;
  }, [settingsData]);
  const [resolvedCatalogsPerPage, setPageSizeOverride] = usePersistedPageSize('admin_catalogs_page_size', catalogsPerPage);
  const offset = (currentPage - 1) * resolvedCatalogsPerPage;

  const catalogsData = useQuery(api.catalogs.listAdminWithOffset, {
    limit: resolvedCatalogsPerPage,
    offset,
    search: debouncedSearchTerm.trim() || undefined,
    status: filterStatus || undefined,
  });
  const totalCountData = useQuery(api.catalogs.countAdmin, {
    search: debouncedSearchTerm.trim() || undefined,
    status: filterStatus || undefined,
  });

  const selectAllData = useQuery(
    api.catalogs.listAdminIds,
    isSelectAllActive
      ? {
          search: debouncedSearchTerm.trim() || undefined,
          status: filterStatus || undefined,
        }
      : 'skip'
  );

  const isLoading = catalogsData === undefined || totalCountData === undefined;
  const catalogs = catalogsData ?? [];
  const isReorderEnabled = !debouncedSearchTerm.trim() && !filterStatus;
  const totalCount = totalCountData?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / resolvedCatalogsPerPage));
  const isSelectingAll = isSelectAllActive && selectAllData === undefined;
  const selectedIds = isSelectAllActive && selectAllData ? selectAllData.ids : manualSelectedIds;

  const toggleSelection = (id: Id<'catalogs'>) => {
    if (isSelectAllActive) {
      setSelectionMode('manual');
      if (selectAllData) {
        setManualSelectedIds(selectAllData.ids.filter((selectedId: Id<'catalogs'>) => selectedId !== id));
      }
      return;
    }
    setManualSelectedIds((prev) => (prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (isSelectAllActive || manualSelectedIds.length > 0) {
      setSelectionMode('manual');
      setManualSelectedIds([]);
    } else {
      setSelectionMode('all');
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} catalog đã chọn?`)) return;
    setIsDeleting(true);
    try {
      await Promise.all(selectedIds.map((id: Id<'catalogs'>) => deleteCatalog({ id })));
      toast.success(`Đã xóa ${selectedIds.length} catalog.`);
      setSelectionMode('manual');
      setManualSelectedIds([]);
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      toast.error('Lỗi khi xóa catalog.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (id: Id<'catalogs'>) => {
    setCloningCatalogId(id);
    try {
      await duplicateCatalog({ id });
      toast.success('Đã nhân bản catalog. Bản sao được lưu ở trạng thái Ẩn.');
    } catch (error) {
      console.error('Lỗi khi nhân bản:', error);
      toast.error('Có lỗi xảy ra khi nhân bản.');
    } finally {
      setCloningCatalogId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const reordered = getReorderedItems(catalogs, active.id as string, over.id as string, (c: any) => c._id);
    if (!reordered) return;
    const updates = buildOrderUpdates(reordered, catalogs.map((c: any) => c.order ?? 0), (c: any) => c._id, (c: any, idx) => totalCount - (offset + idx));

    try {
      await reorderCatalogs({ updates });
      toast.success('Đã cập nhật thứ tự');
    } catch (error) {
      console.error('Lỗi khi sắp xếp:', error);
      toast.error('Không thể lưu thứ tự mới');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilterStatus('');
    setCurrentPage(1);
    setSelectionMode('manual');
    setManualSelectedIds([]);
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Quản lý Catalog
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các tài liệu catalog PDF flipbook.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/catalogs/create">
            <Button variant="accent">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Catalog
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-4 bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['', 'Published', 'Draft', 'Archived'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status as CatalogStatus);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filterStatus === status
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {status === '' ? 'Tất cả' : STATUS_LABEL[status]}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative">
        <BulkActionBar
          entityLabel="catalog"
          selectedCount={selectedIds.length}
          onDelete={handleDeleteSelected}
          onClearSelection={() => {
            setSelectionMode('manual');
            setManualSelectedIds([]);
          }}
          isLoading={isDeleting}
        />

        <div className="overflow-x-auto">
          <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                <TableRow className="border-gray-200 dark:border-gray-700">
                  <TableHead className="w-12 text-center relative px-2">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isSelectingAll ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <SelectCheckbox checked={isSelectAllActive || (manualSelectedIds.length > 0 && manualSelectedIds.length === catalogs.length)} indeterminate={!isSelectAllActive && manualSelectedIds.length > 0 && manualSelectedIds.length < catalogs.length} onChange={toggleSelectAll} />}
                    </div>
                  </TableHead>
                  <TableHead className="w-12 text-center">Thứ tự</TableHead>
                  <TableHead className="w-[100px]">Thumbnail</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead className="w-[150px]">Lượt xem</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[100px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <span>Đang tải...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : catalogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                        <span>Không tìm thấy catalog nào.</span>
                        {(searchTerm || filterStatus) && (
                          <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                            Xóa bộ lọc
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <SortableContext items={catalogs.map((c: any) => c._id)} strategy={verticalListSortingStrategy}>
                    {catalogs.map((catalog: any) => {
                      const isSelected = isSelectAllActive || manualSelectedIds.includes(catalog._id);
                      return (
                        <SortableTableRow key={catalog._id} id={catalog._id} disabled={!isReorderEnabled}>
                          <TableCell className="w-12 text-center p-0">
                            <div className="h-full w-full flex items-center justify-center">
                              <SelectCheckbox checked={isSelected} onChange={() => toggleSelection(catalog._id)} />
                            </div>
                          </TableCell>
                          <TableCell className="w-12 text-center">
                            <AdminDragHandle disabled={!isReorderEnabled} />
                          </TableCell>
                          <TableCell>
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                              <img src={catalog.thumbnail} alt={catalog.title} className="w-full h-full object-cover" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 dark:text-white line-clamp-1">{catalog.title}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">/{catalog.slug}</span>
                              {catalog.featured && (
                                <span className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 w-fit">
                                  Nổi bật
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{catalog.views.toLocaleString()}</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={catalog.status === 'Published' ? 'success' : catalog.status === 'Draft' ? 'secondary' : 'default'}
                              className={
                                catalog.status === 'Published'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0'
                                  : catalog.status === 'Draft'
                                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-0'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0'
                              }
                            >
                              {STATUS_LABEL[catalog.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {catalog.status === 'Published' && (
                                <Link href={`/catalogs/${catalog.slug}`} target="_blank">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" title="Xem trên website">
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </Link>
                              )}
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" title="Nhân bản" onClick={() => handleDuplicate(catalog._id)} disabled={cloningCatalogId === catalog._id}>
                                {cloningCatalogId === catalog._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                              </Button>
                              <Link href={`/admin/catalogs/${catalog._id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" title="Chỉnh sửa">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </SortableTableRow>
                      );
                    })}
                  </SortableContext>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Hiển thị <span className="font-medium">{Math.min(offset + 1, totalCount)}</span> - <span className="font-medium">{Math.min(offset + resolvedCatalogsPerPage, totalCount)}</span> trong tổng số <span className="font-medium">{totalCount}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Số dòng:</span>
                <div className="relative">
                  <select
                    value={resolvedCatalogsPerPage}
                    onChange={(e) => {
                      setPageSizeOverride(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm rounded-md py-1 pl-2 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {[12, 24, 48, 96].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8">
                  Trước
                </Button>
                {generatePaginationItems(currentPage, totalPages).map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <Button key={item} variant={currentPage === item ? 'accent' : 'outline'} size="sm" onClick={() => setCurrentPage(item as number)} className="h-8 w-8 p-0">
                      {item}
                    </Button>
                  )
                )}
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8">
                  Sau
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
