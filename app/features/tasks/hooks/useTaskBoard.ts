'use client';

import {
  DndContextProps,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  moveTaskAcrossColumns,
  reorderTasks,
  selectTasks,
} from '@/store/tasksSlice';
import { enqueueAction, setupOnlineListener } from '@/sw/syncQueue';
import { Task } from '@/types/task';
import type { AppDispatch } from '@/store/store';

export type ColumnKey = 'incomplete' | 'completed';

export interface UseTaskBoardResult {
  columns: Record<ColumnKey, Task[]>;
  sensors: DndContextProps['sensors'];
  activeId: string | null;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => Promise<void>;
  getTaskById: (id?: string | null) => Task | undefined;
}

/**
 * Finds which column a task belongs to.
 */
function findColumnByTaskId(
  columns: Record<ColumnKey, Task[]>,
  id: string,
): ColumnKey | undefined {
  if (columns.incomplete.some((t) => t.id === id)) return 'incomplete';
  if (columns.completed.some((t) => t.id === id)) return 'completed';
  return undefined;
}

/**
 * Builds a fresh snapshot of current tasks split by column.
 */
function buildTaskSnapshot(tasks: Task[]): Record<ColumnKey, Task[]> {
  return {
    incomplete: tasks.filter((t) => !t.completed),
    completed: tasks.filter((t) => t.completed),
  };
}

/**
 * Moves a task from source column to destination column in UI state.
 */
function moveTaskBetweenColumns(
  sourceKey: ColumnKey,
  destKey: ColumnKey,
  activeId: string,
  overId: string,
  prev: Record<ColumnKey, Task[]>,
): Record<ColumnKey, Task[]> {
  const sourceTasks = [...prev[sourceKey]];
  const destTasks = [...prev[destKey]];
  const activeIndex = sourceTasks.findIndex((t) => t.id === activeId);
  const [movedTask] = sourceTasks.splice(activeIndex, 1);
  destTasks.unshift({ ...movedTask, completed: destKey === 'completed' });
  return { ...prev, [sourceKey]: sourceTasks, [destKey]: destTasks };
}

/**
 * Reorders tasks inside the same column visually.
 */
function reorderTasksInColumn(
  columnKey: ColumnKey,
  activeId: string,
  overId: string,
  snapshot: Record<ColumnKey, Task[]>,
  setColumns: React.Dispatch<React.SetStateAction<Record<ColumnKey, Task[]>>>,
): { oldIndex: number; newIndex: number } | undefined {
  const tasks = snapshot[columnKey];
  const oldIndex = tasks.findIndex((t) => t.id === activeId);
  const newIndex = tasks.findIndex((t) => t.id === overId);
  if (newIndex === -1) return;

  const reordered = arrayMove(tasks, oldIndex, newIndex);
  setColumns((prev) => ({ ...prev, [columnKey]: reordered }));

  return { oldIndex, newIndex };
}

/**
 * Dispatches or queues an action depending on network status.
 */
async function commitAction(
  dispatch: AppDispatch,
  action: ReturnType<typeof reorderTasks | typeof moveTaskAcrossColumns>,
) {
  if (navigator.onLine) dispatch(action);
  else await enqueueAction(action);
}

/**
 * Moves a task across columns in state and syncs action.
 */
async function performCrossColumnMove(
  activeId: string,
  overId: string,
  activeContainer: ColumnKey,
  target: ColumnKey,
  snapshot: Record<ColumnKey, Task[]>,
  dispatch: AppDispatch,
  setColumns: React.Dispatch<React.SetStateAction<Record<ColumnKey, Task[]>>>,
  event: DragEndEvent,
): Promise<void> {
  const sourceTasks = [...snapshot[activeContainer]];
  const destTasks = [...snapshot[target]];
  const activeIndex = sourceTasks.findIndex((t) => t.id === activeId);
  const [movedTask] = sourceTasks.splice(activeIndex, 1);

  const overSortable = event.over?.data?.current?.sortable as
    | { index?: number }
    | undefined;
  let destinationIndex =
    typeof overSortable?.index === 'number' ? overSortable.index : -1;

  if (destinationIndex === -1) {
    const fallbackIndex = destTasks.findIndex((t) => t.id === overId);
    destinationIndex = fallbackIndex === -1 ? destTasks.length : fallbackIndex;
  }

  destTasks.splice(destinationIndex, 0, {
    ...movedTask,
    completed: target === 'completed',
  });

  setColumns({
    ...snapshot,
    [activeContainer]: sourceTasks,
    [target]: destTasks,
  });

  const moveAction = moveTaskAcrossColumns({
    taskId: movedTask.id,
    toColumn: target,
    destinationIndex,
  });

  await commitAction(dispatch, moveAction);
}

/**
 * Handles starting of drag.
 */
function onStartDrag(
  event: DragStartEvent,
  columns: Record<ColumnKey, Task[]>,
  setActiveId: (id: string | null) => void,
  setActiveContainer: (key: ColumnKey | null) => void,
): void {
  const id = event.active.id as string;
  setActiveId(id);
  const container = findColumnByTaskId(columns, id);
  setActiveContainer(container ?? null);
}

/**
 * Handles dragging over another droppable area.
 */
function onDragOverColumn(
  event: DragOverEvent,
  columns: Record<ColumnKey, Task[]>,
  setColumns: React.Dispatch<React.SetStateAction<Record<ColumnKey, Task[]>>>,
): void {
  const { active, over } = event;
  if (!over) return;

  const source = findColumnByTaskId(columns, active.id as string);
  const target =
    findColumnByTaskId(columns, over.id as string) || (over.id as ColumnKey);
  if (!source || !target || source === target) return;

  setColumns((prev) =>
    moveTaskBetweenColumns(
      source,
      target,
      active.id as string,
      over.id as string,
      prev,
    ),
  );
}

/**
 * Handles completion of drag (drop).
 */
async function onFinishDrag(
  event: DragEndEvent,
  activeContainer: ColumnKey | null,
  tasks: Task[],
  dispatch: AppDispatch,
  setActiveId: (id: string | null) => void,
  setColumns: React.Dispatch<React.SetStateAction<Record<ColumnKey, Task[]>>>,
): Promise<void> {
  console.log('------2------');

  const { active, over } = event;
  setActiveId(null);
  if (!over || !activeContainer) return;
  console.log('------3------');

  const snapshot = buildTaskSnapshot(tasks);
  const target =
    findColumnByTaskId(snapshot, over.id as string) || (over.id as ColumnKey);
  if (!target) return;
  console.log('------4------');

  if (activeContainer === target) {
    console.log('------5------');
    console.log({activeContainer, target, snapshot, active});

    const indices = reorderTasksInColumn(
      activeContainer,
      active.id as string,
      over.id as string,
      snapshot,
      setColumns,
    );
    if (!indices) return;

    const action = reorderTasks({
      sourceIndex: indices.oldIndex,
      destinationIndex: indices.newIndex,
      column: activeContainer,
    });

    await commitAction(dispatch, action);
  } else {
    console.log('------1------');
    await performCrossColumnMove(
      active.id as string,
      over.id as string,
      activeContainer,
      target,
      snapshot,
      dispatch,
      setColumns,
      event,
    );
  }
}

/**
 * Hook encapsulating DnD state and handlers for the task board.
 */
export function useTaskBoard(): UseTaskBoardResult {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectTasks);

  const [columns, setColumns] = useState<Record<ColumnKey, Task[]>>({
    incomplete: [],
    completed: [],
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeContainer, setActiveContainer] = useState<ColumnKey | null>(
    null,
  );
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    queueMicrotask(() => setColumns(buildTaskSnapshot(tasks)));
  }, [tasks]);

  useEffect(() => {
    setupOnlineListener(dispatch);
  }, [dispatch]);

  const getTaskById = useMemo(
    () => (id?: string | null) => tasks.find((t) => t.id === id),
    [tasks],
  );

  return {
    columns,
    sensors,
    activeId,
    onDragStart: (e) =>
      onStartDrag(e, columns, setActiveId, setActiveContainer),
    onDragOver: (e) => onDragOverColumn(e, columns, setColumns),
    onDragEnd: (e) =>
      onFinishDrag(
        e,
        activeContainer,
        tasks,
        dispatch,
        setActiveId,
        setColumns,
      ),
    getTaskById,
  };
}
