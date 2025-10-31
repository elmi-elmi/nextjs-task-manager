'use client';

import React from 'react';
import {DndContext, DragOverlay, closestCenter, closestCorners} from '@dnd-kit/core';

import { Box } from '@mui/material';
import { useTaskBoard } from '../hooks/useTaskBoard';
import TaskPreview from '@/app/features/tasks/components/TaskPreview';
import Column from '@/app/features/tasks/components/Column';

/**
 * TaskBoard is a container component that renders the tasks DnD board using useTaskBoard hook.
 */
export default function TaskBoard() {
  const {
    columns,
    sensors,
    activeId,
    onDragStart,
    onDragOver,
    onDragEnd,
    getTaskById,
  } = useTaskBoard();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Column
          title={'Incomplete Tasks'}
          list={columns.incomplete}
          id={'incomplete'}
        />
        <Column
          title={'Completed Tasks'}
          list={columns.completed}
          id={'completed'}
        />
      </Box>
      <DragOverlay>
        {activeId ? <TaskPreview task={getTaskById(activeId)} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
