import { redirect } from 'next/navigation';

export default function LegacyKanbanPage() {
  redirect('/admin/mini-apps/kanban');
}
