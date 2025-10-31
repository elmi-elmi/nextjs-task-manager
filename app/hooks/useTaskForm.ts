'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch } from '@/store/hooks';
import { enqueueAction } from '@/sw/syncQueue';
import { addTask } from '@/store/tasksSlice';
import { Task } from '@/types/task';
import { TaskFormData, taskSchema } from '@/lib/validation';

export interface UseTaskFormResult {
  register: ReturnType<typeof useForm<TaskFormData>>['register'];
  handleSubmit: ReturnType<typeof useForm<TaskFormData>>['handleSubmit'];
  errors: ReturnType<typeof useForm<TaskFormData>>['formState']['errors'];
  isSubmitting: boolean;
  onSubmit: (data: TaskFormData) => Promise<void>;
  toast: { open: boolean; message: string; severity: 'success' | 'error' };
  closeToast: () => void;
}

/**
 * useTaskForm encapsulates form state and submit behavior for creating tasks.
 */
export function useTaskForm(): UseTaskFormResult {
  const dispatch = useAppDispatch();
  const form = useForm<TaskFormData>({ resolver: zodResolver(taskSchema) });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const onSubmit = async (data: TaskFormData) => {
    try {
      const task: Task = {
        id: uuidv4(),
        title: data.title.trim(),
        description: data.description?.trim() || '',
        completed: false,
      } as Task;

      if (navigator.onLine) {
        dispatch(addTask(task));
      } else {
        await enqueueAction(addTask(task));
      }
      setToast({ open: true, message: 'Task added', severity: 'success' });
      reset();
    } catch {
      setToast({
        open: true,
        message: 'Failed to add task',
        severity: 'error',
      });
    }
  };

  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    toast,
    closeToast,
  };
}
