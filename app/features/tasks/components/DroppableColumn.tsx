import { ColumnKey } from '@/app/features/tasks/hooks/useTaskBoard';
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Paper, Typography, Box } from '@mui/material';

const DroppableColumn = ({
  id,
  title,
  children,
}: {
  id: ColumnKey;
  title: string;
  children: React.ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Paper
      elevation={3}
      sx={{
        flex: 1,
        p: 2,
        borderRadius: 3,
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.2s ease',
        backgroundColor: isOver ? '#eefaff' : '#fafafa',
      }}
    >
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>

      {/* 👇 اینجا ref رو روی container بچه‌ها می‌ذاریم */}
      <Box
        ref={setNodeRef}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

export default DroppableColumn;
