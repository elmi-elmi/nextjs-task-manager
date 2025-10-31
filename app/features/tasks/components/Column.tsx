import React from 'react';
import { Task } from '@/types/task';
import { Box, Paper } from '@mui/material';
import TaskItem from '@/app/features/tasks/components/TaskItem';
import { ColumnKey } from '@/app/features/tasks/hooks/useTaskBoard';
import DroppableColumn from '@/app/features/tasks/components/DroppableColumn';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

const Column = ({
  title,
  list,
  id,
}: {
  title: string;
  list: Task[];
  id: ColumnKey;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <DroppableColumn id={id} title={title}>
      <SortableContext
        items={list.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <Box
          ref={setNodeRef}
          sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}
        >
          {list.length === 0 ? (
            <Paper
              sx={{
                p: 2,
                border: '2px dashed #aaa',
                borderRadius: 2,
                color: 'text.secondary',
                backgroundColor: '#fafafa',
                textAlign: 'center',
              }}
              aria-label={`Empty ${title} column, drop tasks here`}
            >
              Drop here
            </Paper>
          ) : (
            list.map((task) => <TaskItem key={task.id} task={task} />)
          )}
        </Box>
      </SortableContext>
    </DroppableColumn>
  );
};

export default Column;
