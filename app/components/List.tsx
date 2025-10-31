'use client';

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  reorderTasks,
  moveTaskAcrossColumns,
  selectFilteredTasks,
} from '@/store/tasksSlice';
import { enqueueAction, setupOnlineListener } from '@/sw/syncQueue';
import { useEffect, useEffectEvent, useState } from 'react';
import { Box } from '@mui/material';
import { ColumnKey, Task } from '@/types/task';
import RenderColumn from '@/app/components/RenderColumn';
import TaskPreview from '@/app/components/TaskPreview';

export default function List() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectFilteredTasks);

  const [columns, setColumns] = useState<Record<ColumnKey, Task[]>>({
    incomplete: [],
    completed: [],
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeContainer, setActiveContainer] = useState<string | null>(null);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  // // ✅ فقط sync وقتی tasks تغییر می‌کنه، بدون هشدار ESLint
  // useEffect(() => {
  //   // بهتره داخل useEffect از queueMicrotask استفاده کنیم تا از setState در render جلوگیری بشه
  //   queueMicrotask(() => {
  //     setColumns({
  //       incomplete: tasks.filter((t) => !t.completed),
  //       completed: tasks.filter((t) => t.completed),
  //     });
  //   });
  // }, [tasks]);
  // useEffect(() => {
  //   setColumns({
  //     incomplete: tasks.filter((t) => !t.completed),
  //     completed: tasks.filter((t) => t.completed),
  //   });
  // }, [tasks]);
  const updateColumns = useEffectEvent(() => {
    setColumns({
      incomplete: tasks.filter((t) => !t.completed),
      completed: tasks.filter((t) => t.completed),
    });
  });

  useEffect(() => {
    updateColumns(); // وقتی tasks تغییر کرد، ستون‌ها آپدیت می‌شوند
  }, [tasks]);

  useEffect(() => {
    setupOnlineListener(dispatch);
  }, [dispatch]);

  const findContainer = (id: string): ColumnKey | undefined => {
    if (columns.incomplete.some((t) => t.id === id)) return 'incomplete';
    if (columns.completed.some((t) => t.id === id)) return 'completed';
    return undefined;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const activeContainer = findContainer(event.active.id as string);
    setActiveContainer(activeContainer ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer =
      findContainer(over.id as string) || (over.id as ColumnKey);

    if (!activeContainer || !overContainer || activeContainer === overContainer)
      return;

    setColumns((prev) => {
      const sourceTasks = [...prev[activeContainer]];
      const destTasks = [...prev[overContainer]];
      const activeIndex = sourceTasks.findIndex((t) => t.id === active.id);
      const [movedTask] = sourceTasks.splice(activeIndex, 1);
      destTasks.unshift({
        ...movedTask,
        completed: overContainer === 'completed',
      });

      return {
        ...prev,
        [activeContainer]: sourceTasks,
        [overContainer]: destTasks,
      };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    // const activeContainer = findContainer(active.id as string);
    const overContainer =
      findContainer(over.id as string) || (over.id as ColumnKey);

    if (!activeContainer || !overContainer) return;
    const columns = {
      incomplete: tasks.filter((t) => !t.completed),
      completed: tasks.filter((t) => t.completed),
    };

    if (activeContainer === overContainer) {
      const items = columns[activeContainer as ColumnKey];
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (newIndex === -1) return;

      const newItems = arrayMove(items, oldIndex, newIndex);
      setColumns((prev) => ({ ...prev, [activeContainer]: newItems }));
      if (navigator.onLine) {
        dispatch(
          reorderTasks({
            sourceIndex: oldIndex,
            destinationIndex: newIndex,
            column: activeContainer,
          }),
        );
      } else {
        await enqueueAction(
          reorderTasks({
            sourceIndex: oldIndex,
            destinationIndex: newIndex,
            column: activeContainer,
          }),
        );
      }
    } else {
      // 🔹 بین دو ستون
      const sourceTasks = [...columns[activeContainer as ColumnKey]];
      const destTasks = [...columns[overContainer as ColumnKey]];
      const activeIndex = sourceTasks.findIndex((t) => t.id === active.id);
      const [movedTask] = sourceTasks.splice(activeIndex, 1);

      // تعیین ایندکس مقصد با استفاده از dnd-kit sortable.index
      type SortableData = { index: number } | undefined;
      const overCurrent = over.data?.current as
        | { sortable?: SortableData }
        | undefined;
      const overSortable = overCurrent?.sortable;
      let destinationIndex =
        typeof overSortable?.index === 'number' ? overSortable.index : -1;
      if (destinationIndex === -1) {
        const fallbackIndex = destTasks.findIndex(
          (t) => t.id === (over.id as string),
        );
        destinationIndex =
          fallbackIndex === -1 ? destTasks.length : fallbackIndex;
      }

      destTasks.splice(destinationIndex, 0, {
        ...movedTask,
        completed: overContainer === 'completed',
      });

      setColumns({
        ...columns,
        [activeContainer]: sourceTasks,
        [overContainer]: destTasks,
      });

      const moveAction = moveTaskAcrossColumns({
        taskId: movedTask.id,
        toColumn: overContainer,
        destinationIndex,
      });

      if (navigator.onLine) {
        dispatch(moveAction);
      } else {
        await enqueueAction(moveAction);
      }
    }
  };

  const getTaskById = (id?: string | null) => tasks.find((t) => t.id === id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mt: 3,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
          <RenderColumn
            title={'Incomplete Tasks'}
            list={columns.incomplete}
            id={'incomplete'}
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
          <RenderColumn
            title={'Completed Tasks'}
            list={columns.completed}
            id={'completed'}
          />
        </Box>
      </Box>

      <DragOverlay>
        {activeId ? <TaskPreview task={getTaskById(activeId)} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
