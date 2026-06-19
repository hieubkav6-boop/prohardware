'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronLeft, Columns, GripVertical, LayoutGrid, ListTodo, Loader2, Menu, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { Button, cn } from '@/app/admin/components/ui';

type KanbanBoard = Doc<'kanbanBoards'>;
type KanbanColumn = Doc<'kanbanColumns'>;
type KanbanTask = Doc<'kanbanTasks'>;

type KanbanMiniAppProps = {
  appName?: string;
  editable?: boolean;
  standalone?: boolean;
  userId?: Id<'users'> | null;
};

const DROP_SUFFIX = ':drop';

const toDropId = (columnId: Id<'kanbanColumns'>) => `${columnId}${DROP_SUFFIX}`;
const fromDropId = (id: string) => id.endsWith(DROP_SUFFIX) ? id.slice(0, -DROP_SUFFIX.length) as Id<'kanbanColumns'> : null;

export function KanbanMiniApp({
  appName = 'Kanban Mini App',
  editable = false,
  standalone = false,
  userId,
}: KanbanMiniAppProps) {
  const boards = useQuery(api.kanban.listBoards);
  const [selectedBoardId, setSelectedBoardId] = useState<Id<'kanbanBoards'> | null>(null);
  const boardData = useQuery(
    api.kanban.getBoard,
    selectedBoardId ? { boardId: selectedBoardId, taskLimit: 500 } : 'skip'
  );

  const createBoard = useMutation(api.kanban.createBoard);
  const updateBoard = useMutation(api.kanban.updateBoard);
  const deleteBoard = useMutation(api.kanban.deleteBoard);
  const createColumn = useMutation(api.kanban.createColumn);
  const updateColumn = useMutation(api.kanban.updateColumn);
  const deleteColumn = useMutation(api.kanban.deleteColumn);
  const reorderColumns = useMutation(api.kanban.reorderColumns);
  const createTask = useMutation(api.kanban.createTask);
  const updateTask = useMutation(api.kanban.updateTask);
  const deleteTask = useMutation(api.kanban.deleteTask);
  const reorderTasks = useMutation(api.kanban.reorderTasks);
  const moveTask = useMutation(api.kanban.moveTask);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isGridLayout, setIsGridLayout] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<Id<'kanbanBoards'> | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<Id<'kanbanColumns'> | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<Id<'kanbanTasks'> | null>(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newTaskTitles, setNewTaskTitles] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 140, tolerance: 8 } })
  );

  useEffect(() => {
    const saved = window.localStorage.getItem('miniapp_kanban_grid_layout');
    setIsGridLayout(saved === 'true');
  }, []);

  useEffect(() => {
    if (!boards?.length) {
      setSelectedBoardId(null);
      return;
    }
    if (!selectedBoardId || !boards.some((board) => board._id === selectedBoardId)) {
      setSelectedBoardId(boards[0]._id);
    }
  }, [boards, selectedBoardId]);

  const columns = useMemo(() => {
    if (!boardData) {
      return [];
    }
    return [...boardData.columns].sort((a, b) => a.order - b.order);
  }, [boardData]);

  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, KanbanTask[]> = {};
    columns.forEach((column) => {
      grouped[column._id] = [];
    });
    boardData?.tasks.forEach((task) => {
      if (!grouped[task.columnId]) {
        grouped[task.columnId] = [];
      }
      grouped[task.columnId].push(task);
    });
    Object.values(grouped).forEach((tasks) => tasks.sort((a, b) => a.order - b.order));
    return grouped;
  }, [boardData, columns]);

  const columnIds = useMemo(() => new Set(columns.map((column) => column._id)), [columns]);

  const ensureCanEdit = () => {
    if (!editable) {
      toast.message('Mini app đang ở chế độ chỉ xem.');
      return false;
    }
    return true;
  };

  const toggleGridLayout = () => {
    const next = !isGridLayout;
    setIsGridLayout(next);
    window.localStorage.setItem('miniapp_kanban_grid_layout', String(next));
  };

  const handleCreateBoard = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!ensureCanEdit()) {
      return;
    }
    const name = newBoardName.trim();
    if (!name) {
      return;
    }
    try {
      const id = await createBoard({ createdBy: userId ?? undefined, includeReview: true, name });
      setSelectedBoardId(id);
      setNewBoardName('');
      toast.success('Đã tạo bảng Kanban.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo bảng.');
    }
  };

  const handleRenameBoard = async (board: KanbanBoard, name: string) => {
    setEditingBoardId(null);
    if (!ensureCanEdit()) {
      return;
    }
    const nextName = name.trim();
    if (!nextName || nextName === board.name) {
      return;
    }
    try {
      await updateBoard({ id: board._id, name: nextName });
      toast.success('Đã đổi tên bảng.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể đổi tên bảng.');
    }
  };

  const handleDeleteBoard = async (boardId: Id<'kanbanBoards'>) => {
    if (!ensureCanEdit()) {
      return;
    }
    try {
      await deleteBoard({ id: boardId });
      toast.success('Đã xóa bảng.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa bảng.');
    }
  };

  const handleCreateColumn = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!ensureCanEdit() || !selectedBoardId) {
      return;
    }
    const title = newColumnName.trim();
    if (!title) {
      return;
    }
    try {
      await createColumn({ boardId: selectedBoardId, color: 'slate', icon: 'CircleDashed', title });
      setNewColumnName('');
      setIsAddingColumn(false);
      toast.success('Đã thêm cột.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể thêm cột.');
    }
  };

  const handleRenameColumn = async (column: KanbanColumn, title: string) => {
    setEditingColumnId(null);
    if (!ensureCanEdit()) {
      return;
    }
    const nextTitle = title.trim();
    if (!nextTitle || nextTitle === column.title) {
      return;
    }
    try {
      await updateColumn({ id: column._id, title: nextTitle });
      toast.success('Đã đổi tên cột.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể đổi tên cột.');
    }
  };

  const handleDeleteColumn = async (column: KanbanColumn) => {
    if (!ensureCanEdit()) {
      return;
    }
    const tasks = tasksByColumn[column._id] ?? [];
    const target = columns.find((item) => item._id !== column._id);
    if (tasks.length > 0 && !target) {
      toast.error('Cần có cột khác để chuyển task trước khi xóa.');
      return;
    }
    try {
      await deleteColumn({ id: column._id, targetColumnId: tasks.length > 0 ? target?._id : undefined });
      toast.success('Đã xóa cột.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa cột.');
    }
  };

  const handleCreateTask = async (columnId: Id<'kanbanColumns'>) => {
    if (!ensureCanEdit() || !selectedBoardId) {
      return;
    }
    const title = newTaskTitles[columnId]?.trim();
    if (!title) {
      return;
    }
    try {
      await createTask({
        boardId: selectedBoardId,
        columnId,
        createdBy: userId ?? undefined,
        description: '',
        priority: 'MEDIUM',
        title,
      });
      setNewTaskTitles((prev) => ({ ...prev, [columnId]: '' }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể thêm task.');
    }
  };

  const handleRenameTask = async (task: KanbanTask, title: string) => {
    setEditingTaskId(null);
    if (!ensureCanEdit()) {
      return;
    }
    const nextTitle = title.trim();
    if (!nextTitle || nextTitle === task.title) {
      return;
    }
    try {
      await updateTask({ id: task._id, title: nextTitle });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể đổi tên task.');
    }
  };

  const handleDeleteTask = async (taskId: Id<'kanbanTasks'>) => {
    if (!ensureCanEdit()) {
      return;
    }
    try {
      await deleteTask({ id: taskId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa task.');
    }
  };

  const findColumnByTask = (taskId: Id<'kanbanTasks'>) => Object.entries(tasksByColumn)
    .find(([, tasks]) => tasks.some((task) => task._id === taskId))?.[0] as Id<'kanbanColumns'> | undefined;

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!editable || !selectedBoardId) {
      return;
    }
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const activeId = String(active.id);
    const overId = String(over.id);

    if (columnIds.has(activeId as Id<'kanbanColumns'>) && columnIds.has(overId as Id<'kanbanColumns'>)) {
      const oldIndex = columns.findIndex((column) => column._id === activeId);
      const newIndex = columns.findIndex((column) => column._id === overId);
      if (oldIndex < 0 || newIndex < 0) {
        return;
      }
      const orderedIds = arrayMove(columns, oldIndex, newIndex).map((column) => column._id);
      await reorderColumns({ boardId: selectedBoardId, orderedIds });
      return;
    }

    const taskId = activeId as Id<'kanbanTasks'>;
    const fromColumnId = findColumnByTask(taskId);
    const dropColumnId = fromDropId(overId);
    const toColumnId = dropColumnId ?? (columnIds.has(overId as Id<'kanbanColumns'>) ? overId as Id<'kanbanColumns'> : findColumnByTask(overId as Id<'kanbanTasks'>));
    if (!fromColumnId || !toColumnId) {
      return;
    }

    const sourceTasks = tasksByColumn[fromColumnId] ?? [];
    const destinationTasks = tasksByColumn[toColumnId] ?? [];

    if (fromColumnId === toColumnId) {
      const oldIndex = sourceTasks.findIndex((task) => task._id === taskId);
      const newIndex = dropColumnId ? sourceTasks.length - 1 : sourceTasks.findIndex((task) => task._id === overId);
      if (oldIndex < 0 || newIndex < 0) {
        return;
      }
      const orderedIds = arrayMove(sourceTasks, oldIndex, newIndex).map((task) => task._id);
      await reorderTasks({ columnId: fromColumnId, orderedIds });
      return;
    }

    const sourceOrderIds = sourceTasks.filter((task) => task._id !== taskId).map((task) => task._id);
    const insertIndex = dropColumnId ? destinationTasks.length : Math.max(0, destinationTasks.findIndex((task) => task._id === overId));
    const destinationOrderIds = destinationTasks.map((task) => task._id);
    destinationOrderIds.splice(insertIndex < 0 ? destinationOrderIds.length : insertIndex, 0, taskId);
    await moveTask({ destinationOrderIds, fromColumnId, sourceOrderIds, taskId, toColumnId });
  };

  const isLoading = boards === undefined || (selectedBoardId && boardData === undefined);

  return (
    <div className={cn(
      'miniapp-kanban flex w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100',
      standalone
        ? 'h-screen min-h-screen rounded-none border-0'
        : 'h-[calc(100vh-7rem)] min-h-[640px] rounded-xl border border-zinc-200 shadow-sm dark:border-slate-800'
    )}>
      <aside className={cn('flex flex-col overflow-hidden border-r border-zinc-200 bg-white transition-all duration-150 dark:border-slate-800 dark:bg-slate-900', sidebarOpen ? 'w-56' : 'w-0')}>
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-200 px-3 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-tight text-zinc-500 dark:text-slate-400">
            <ListTodo className="h-4 w-4" />
            <span>Boards</span>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-slate-800">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {(boards ?? []).map((board) => (
            <BoardItem
              key={board._id}
              board={board}
              editing={editingBoardId === board._id}
              editable={editable}
              selected={selectedBoardId === board._id}
              onDelete={() => handleDeleteBoard(board._id)}
              onRename={(name) => handleRenameBoard(board, name)}
              onSelect={() => setSelectedBoardId(board._id)}
              onStartEdit={() => setEditingBoardId(board._id)}
            />
          ))}
        </div>

        {editable && (
          <form onSubmit={handleCreateBoard} className="border-t border-zinc-200 p-2 dark:border-slate-800">
            <div className="flex items-center gap-1 border border-zinc-200 bg-zinc-50 p-1 dark:border-slate-700 dark:bg-slate-950">
              <input
                value={newBoardName}
                onChange={(event) => setNewBoardName(event.target.value)}
                placeholder="New board..."
                className="w-full bg-transparent px-1 text-xs outline-none placeholder:text-zinc-400"
              />
              <button type="submit" className="rounded p-1 text-zinc-500 hover:bg-white hover:text-zinc-900 dark:hover:bg-slate-800">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        )}
      </aside>

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex min-w-0 items-center gap-2">
            {!sidebarOpen && (
              <button type="button" onClick={() => setSidebarOpen(true)} className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-slate-800">
                <Menu className="h-4 w-4" />
              </button>
            )}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-900 dark:text-slate-100">
                {boardData?.board.name ?? appName}
              </div>
              <div className="text-[11px] text-zinc-400">
                {editable ? 'Editable workspace' : 'Public read-only route'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleGridLayout}
              className={cn(
                'flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition-colors',
                isGridLayout
                  ? 'border-zinc-800 bg-zinc-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
              )}
            >
              {isGridLayout ? <LayoutGrid className="h-3.5 w-3.5" /> : <Columns className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isGridLayout ? 'Lưới' : 'Cuộn ngang'}</span>
            </button>
            {!editable && (
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-500 dark:bg-slate-800 dark:text-slate-300">
                Chỉ xem
              </span>
            )}
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : boardData ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={columns.map((column) => column._id)} strategy={horizontalListSortingStrategy}>
              <div className={cn('flex flex-1 items-start gap-2 overflow-y-hidden p-2', isGridLayout ? 'overflow-x-hidden' : 'overflow-x-auto')}>
                {columns.map((column) => (
                  <KanbanColumnCard
                    key={column._id}
                    column={column}
                    editable={editable}
                    editing={editingColumnId === column._id}
                    gridLayout={isGridLayout}
                    newTaskTitle={newTaskTitles[column._id] ?? ''}
                    tasks={tasksByColumn[column._id] ?? []}
                    onCreateTask={() => handleCreateTask(column._id)}
                    onDeleteColumn={() => handleDeleteColumn(column)}
                    onDeleteTask={handleDeleteTask}
                    onRenameColumn={(title) => handleRenameColumn(column, title)}
                    onRenameTask={handleRenameTask}
                    onSetNewTaskTitle={(value) => setNewTaskTitles((prev) => ({ ...prev, [column._id]: value }))}
                    onStartEditColumn={() => setEditingColumnId(column._id)}
                    onStartEditTask={setEditingTaskId}
                    taskEditingId={editingTaskId}
                  />
                ))}

                {editable && (
                  isAddingColumn ? (
                    <form onSubmit={handleCreateColumn} className="flex w-52 shrink-0 flex-col rounded-sm border border-zinc-200 bg-zinc-100 p-1.5 dark:border-slate-800 dark:bg-slate-900">
                      <input
                        autoFocus
                        value={newColumnName}
                        onChange={(event) => setNewColumnName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Escape') {
                            setNewColumnName('');
                            setIsAddingColumn(false);
                          }
                        }}
                        placeholder="Tên cột..."
                        className="border border-zinc-200 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-400 dark:border-slate-700 dark:bg-slate-950"
                      />
                      <Button type="submit" size="sm" className="mt-1 h-7 rounded-sm text-xs">
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Thêm
                      </Button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingColumn(true)}
                      className="flex h-8 shrink-0 items-center gap-1 rounded-sm bg-zinc-200/70 px-3 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Cột
                    </button>
                  )
                )}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-zinc-50 text-center text-zinc-400 dark:bg-slate-950">
            <span className="text-sm">Chọn hoặc tạo bảng để bắt đầu.</span>
            {editable && (
              <Button type="button" variant="outline" onClick={() => setSidebarOpen(true)}>
                Mở danh sách board
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function BoardItem({
  board,
  editing,
  editable,
  selected,
  onDelete,
  onRename,
  onSelect,
  onStartEdit,
}: {
  board: KanbanBoard;
  editing: boolean;
  editable: boolean;
  selected: boolean;
  onDelete: () => void;
  onRename: (name: string) => void;
  onSelect: () => void;
  onStartEdit: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onSelect();
        }
      }}
      className={cn(
        'group flex cursor-pointer items-center justify-between rounded p-1.5 text-xs',
        selected ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-slate-800 dark:text-slate-100' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-slate-400 dark:hover:bg-slate-800'
      )}
    >
      <div className="mr-1 min-w-0 flex-1 truncate">
        {editing ? (
          <input
            autoFocus
            defaultValue={board.name}
            onBlur={(event) => onRename(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onRename(event.currentTarget.value);
              }
              if (event.key === 'Escape') {
                onRename(board.name);
              }
            }}
            className="w-full border border-zinc-300 bg-white p-0.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-950"
          />
        ) : (
          <span onDoubleClick={(event) => {
            event.stopPropagation();
            if (editable) {
              onStartEdit();
            }
          }}>
            {board.name}
          </span>
        )}
      </div>
      {editable && (
        <button type="button" onClick={(event) => { event.stopPropagation(); onDelete(); }} className="p-0.5 text-zinc-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function KanbanColumnCard({
  column,
  editable,
  editing,
  gridLayout,
  newTaskTitle,
  tasks,
  taskEditingId,
  onCreateTask,
  onDeleteColumn,
  onDeleteTask,
  onRenameColumn,
  onRenameTask,
  onSetNewTaskTitle,
  onStartEditColumn,
  onStartEditTask,
}: {
  column: KanbanColumn;
  editable: boolean;
  editing: boolean;
  gridLayout: boolean;
  newTaskTitle: string;
  tasks: KanbanTask[];
  taskEditingId: Id<'kanbanTasks'> | null;
  onCreateTask: () => void;
  onDeleteColumn: () => void;
  onDeleteTask: (id: Id<'kanbanTasks'>) => void;
  onRenameColumn: (title: string) => void;
  onRenameTask: (task: KanbanTask, title: string) => void;
  onSetNewTaskTitle: (value: string) => void;
  onStartEditColumn: () => void;
  onStartEditTask: (id: Id<'kanbanTasks'> | null) => void;
}) {
  const sortable = useSortable({ disabled: !editable, id: column._id });
  const droppable = useDroppable({ disabled: !editable, id: toDropId(column._id) });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={cn(
        'flex max-h-full flex-col rounded-sm border border-zinc-200 bg-zinc-100/80 transition-all dark:border-slate-800 dark:bg-slate-900/80',
        gridLayout ? 'min-w-[220px] flex-1' : 'w-64 shrink-0',
        sortable.isDragging && 'opacity-70'
      )}
    >
      <div
        {...sortable.attributes}
        {...sortable.listeners}
        className="group flex items-center justify-between border-b border-zinc-200 p-1.5 hover:bg-zinc-200/50 dark:border-slate-800 dark:hover:bg-slate-800"
      >
        <div className="mr-2 flex min-w-0 flex-1 items-center gap-1">
          {editable && <GripVertical className="h-3.5 w-3.5 shrink-0 text-zinc-400" />}
          {editing ? (
            <input
              autoFocus
              defaultValue={column.title}
              onBlur={(event) => onRenameColumn(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onRenameColumn(event.currentTarget.value);
                }
                if (event.key === 'Escape') {
                  onRenameColumn(column.title);
                }
              }}
              className="w-full border border-zinc-300 bg-white p-0.5 text-xs font-medium outline-none dark:border-slate-700 dark:bg-slate-950"
            />
          ) : (
            <span onDoubleClick={() => editable && onStartEditColumn()} className="block truncate text-xs font-semibold text-zinc-700 dark:text-slate-200">
              {column.title}
            </span>
          )}
        </div>
        {editable && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDeleteColumn();
            }}
            className="p-0.5 text-zinc-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <SortableContext items={tasks.map((task) => task._id)} strategy={verticalListSortingStrategy}>
        <div ref={droppable.setNodeRef} className={cn('min-h-[52px] flex-1 space-y-1 overflow-y-auto p-1.5 transition-colors', droppable.isOver && 'bg-zinc-200/50 dark:bg-slate-800/50')}>
          {tasks.map((task) => (
            <KanbanTaskCard
              key={task._id}
              editable={editable}
              editing={taskEditingId === task._id}
              task={task}
              onDelete={() => onDeleteTask(task._id)}
              onRename={(title) => onRenameTask(task, title)}
              onStartEdit={() => onStartEditTask(task._id)}
            />
          ))}
        </div>
      </SortableContext>

      {editable && (
        <div className="border-t border-zinc-200 bg-zinc-50/60 p-1 dark:border-slate-800 dark:bg-slate-950/60">
          <input
            value={newTaskTitle}
            onChange={(event) => onSetNewTaskTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onCreateTask();
              }
            }}
            placeholder="+ Thêm việc..."
            className="w-full border border-zinc-200 bg-white px-2 py-1 text-xs outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
      )}
    </div>
  );
}

function KanbanTaskCard({
  editable,
  editing,
  task,
  onDelete,
  onRename,
  onStartEdit,
}: {
  editable: boolean;
  editing: boolean;
  task: KanbanTask;
  onDelete: () => void;
  onRename: (title: string) => void;
  onStartEdit: () => void;
}) {
  const sortable = useSortable({ disabled: !editable, id: task._id });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      {...sortable.attributes}
      {...sortable.listeners}
      className={cn(
        'group flex items-start justify-between rounded-sm border border-zinc-200 bg-white p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-zinc-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700',
        sortable.isDragging && 'opacity-70'
      )}
    >
      <div className="mr-1.5 min-w-0 flex-1">
        {editing ? (
          <textarea
            autoFocus
            defaultValue={task.title}
            rows={1}
            onBlur={(event) => onRename(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                onRename(event.currentTarget.value);
              }
              if (event.key === 'Escape') {
                onRename(task.title);
              }
            }}
            className="block w-full resize-none border border-zinc-300 bg-white p-1 text-xs leading-relaxed outline-none dark:border-slate-700 dark:bg-slate-950"
          />
        ) : (
          <span onDoubleClick={() => editable && onStartEdit()} className="block cursor-pointer whitespace-normal break-words text-xs leading-relaxed text-zinc-800 dark:text-slate-200">
            {task.title}
          </span>
        )}
      </div>
      {editable && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="p-0.5 text-zinc-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
