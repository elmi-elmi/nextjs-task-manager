import { Task } from '@/types/task';
import { Box, Checkbox, Paper, Typography } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import React from 'react';

const TaskPreview = ({ task }: { task?: Task }) => {
  if (!task) return null;
  return (
    <Paper
      elevation={6}
      sx={{
        p: 1.5,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        minWidth: 260,
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        opacity: 0.95,
      }}
    >
      <Box sx={{ cursor: 'grab' }}>
        <DragIndicatorIcon color="action" />
      </Box>
      <Checkbox
        checked={task.completed}
        disabled
        sx={{ pointerEvents: 'none' }}
      />
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="subtitle1"
          sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
        >
          {task.title}
        </Typography>
        {task.description && (
          <Typography variant="body2" color="text.secondary">
            {task.description}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default TaskPreview;
