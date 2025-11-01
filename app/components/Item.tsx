'use client';

import { Task } from '@/types/task';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteForever from '@mui/icons-material/DeleteForever';
import {
  Alert,
  Box,
  Checkbox,
  Paper,
  Snackbar,
  Typography,
  IconButton,
} from '@mui/material';
import { useTaskItem } from '@/app/hooks/useTaskItem';

export interface TaskItemProps {
  task: Task;
}

export default function Item({ task }: TaskItemProps) {
  const {
    open,
    setOpen,
    attributes,
    listeners,
    setNodeRef,
    style,
    handleToggle,
    handleDelete,
  } = useTaskItem(task.id);

  return (
    <>
      <Paper
        ref={setNodeRef}
        elevation={style.opacity < 1 ? 6 : 2}
        sx={{
          p: 1.5,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: style.opacity < 1 ? '#f0f0f0' : 'white',
          boxShadow:
            style.opacity < 1 ? '0 4px 12px rgba(0,0,0,0.15)' : undefined,
          ...style,
        }}
      >
        <IconButton
          {...listeners}
          {...attributes}
          sx={{ cursor: 'grab', touchAction: 'none' }}
          aria-label={`Drag task: ${task.title}`}
        >
          <DragIndicatorIcon color="action" />
        </IconButton>

        <Checkbox
          checked={task.completed}
          onChange={handleToggle}
          aria-label={
            task.completed
              ? `Mark ${task.title} as incomplete`
              : `Mark ${task.title} as completed`
          }
        />

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            component="p"
            sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
          >
            {task.title}
          </Typography>
          {task.description && (
            <Typography variant="body2" component="p" color="text.secondary">
              {task.description}
            </Typography>
          )}
        </Box>

        <IconButton
          onClick={handleDelete}
          aria-label={`Delete task: ${task.title}`}
        >
          <DeleteForever />
        </IconButton>
      </Paper>

      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="info" variant="filled" onClose={() => setOpen(false)}>
          {task.completed ? 'Marked completed' : 'Marked incomplete'}
        </Alert>
      </Snackbar>
    </>
  );
}
