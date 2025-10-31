'use client';

import labels from '@/constants/labels';
import { useTaskForm } from '@/app/features/tasks/hooks/useTaskForm';
import {
  Alert,
  Button,
  Paper,
  Snackbar,
  Stack,
  TextField,
} from '@mui/material';

export default function TaskForm() {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    toast,
    closeToast,
  } = useTaskForm();

  return (
    <Paper
      elevation={3}
      sx={{ p: 3, borderRadius: 3, backgroundColor: '#fafafa' }}
      component="section"
      aria-labelledby="task-form-title"
    >
      {/* Hidden heading for screen readers */}
      <h2
        id="task-form-title"
        style={{ position: 'absolute', left: '-9999px' }}
      >
        Create a new task
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} aria-label="Create task form">
        <Stack spacing={2}>
          <TextField
            id="task-title"
            label={labels.taskTitle || 'Task Title'}
            variant="outlined"
            fullWidth
            {...register('title')}
            error={!!errors.title}
            helperText={errors.title?.message}
            inputProps={{ 'aria-required': true }}
          />
          <TextField
            id="task-description"
            label={labels.taskDescription || 'Task Description'}
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? labels.addingTask : labels.addTask}
          </Button>
        </Stack>
      </form>

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={closeToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} variant="filled" onClose={closeToast}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
