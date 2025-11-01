'use client';

import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from '@dnd-kit/core';
import { useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useAppDispatch } from '@/store/hooks';
import { enqueueAction } from '@/sw/syncQueue';
import { useSortable } from '@dnd-kit/sortable';
import { deleteTask, toggleComplete } from '@/store/tasksSlice';

export interface UseTaskItemResult {
  open: boolean;
  setOpen: (v: boolean) => void;
  attributes: DraggableAttributes;
  listeners?: DraggableSyntheticListeners;
  setNodeRef: (node: HTMLElement | null) => void;
  style: {
    transform: string | undefined;
    transition: string | undefined;
    opacity: number;
  };
  handleToggle: () => Promise<void>;
  handleDelete: () => Promise<void>;
}

/**
 * useTaskItem encapsulates drag state and completion toggle behavior for a task item.
 */
export function useTaskItem(taskId: string): UseTaskItemResult {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: taskId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const handleToggle = async () => {
    if (navigator.onLine) {
      dispatch(toggleComplete(taskId));
    } else {
      await enqueueAction(toggleComplete(taskId));
    }
    setOpen(true);
  };

  const handleDelete = async () => {
    if (navigator.onLine) {
      dispatch(deleteTask(taskId));
    } else {
      await enqueueAction(deleteTask(taskId));
    }
    setOpen(true);
  };

  return {
    open,
    setOpen,
    attributes,
    listeners,
    setNodeRef,
    style,
    handleToggle,
    handleDelete,
  };
}
