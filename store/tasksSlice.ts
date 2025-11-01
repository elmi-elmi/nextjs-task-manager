import { RootState } from './rootReducer';
import { Task, TaskFilter } from '@/types/task';
import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

interface TasksState {
  tasks: Task[];
  filter: TaskFilter;
}

const initialState: TasksState = {
  tasks: [],
  filter: 'all',
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },

    toggleComplete: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find((t) => t.id === action.payload);
      if (task) task.completed = !task.completed;
    },

    setFilter: (state, action: PayloadAction<TaskFilter>) => {
      state.filter = action.payload;
    },

    reorderTasks: (
      state,
      action: PayloadAction<{
        sourceIndex: number;
        destinationIndex: number;
        column: 'incomplete' | 'completed';
      }>,
    ) => {
      const { sourceIndex, destinationIndex, column } = action.payload;

      const columnTasks = state.tasks.filter((t) =>
        column === 'completed' ? t.completed : !t.completed,
      );

      if (
        sourceIndex < 0 ||
        destinationIndex < 0 ||
        sourceIndex >= columnTasks.length ||
        destinationIndex >= columnTasks.length
      )
        return;

      const [moved] = columnTasks.splice(sourceIndex, 1);
      columnTasks.splice(destinationIndex, 0, moved);

      const otherTasks = state.tasks.filter((t) =>
        column === 'completed' ? !t.completed : t.completed,
      );

      state.tasks =
        column === 'completed'
          ? [...otherTasks, ...columnTasks]
          : [...columnTasks, ...otherTasks];
    },

    moveTaskAcrossColumns: (
      state,
      action: PayloadAction<{
        taskId: string;
        toColumn: 'incomplete' | 'completed';
        destinationIndex: number;
      }>,
    ) => {
      const { taskId, toColumn, destinationIndex } = action.payload;

      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return;

      const fromColumn: 'incomplete' | 'completed' = task.completed
        ? 'completed'
        : 'incomplete';
      if (fromColumn === toColumn) return;

      const incompleteTasks = state.tasks.filter((t) => !t.completed);
      const completedTasks = state.tasks.filter((t) => t.completed);

      if (fromColumn === 'incomplete') {
        const idx = incompleteTasks.findIndex((t) => t.id === taskId);
        if (idx === -1) return;
        incompleteTasks.splice(idx, 1);
      } else {
        const idx = completedTasks.findIndex((t) => t.id === taskId);
        if (idx === -1) return;
        completedTasks.splice(idx, 1);
      }

      const movedTask: Task = { ...task, completed: toColumn === 'completed' };
      if (toColumn === 'completed') {
        const insertIndex = Math.max(
          0,
          Math.min(destinationIndex, completedTasks.length),
        );
        completedTasks.splice(insertIndex, 0, movedTask);
      } else {
        const insertIndex = Math.max(
          0,
          Math.min(destinationIndex, incompleteTasks.length),
        );
        incompleteTasks.splice(insertIndex, 0, movedTask);
      }

      state.tasks = [...incompleteTasks, ...completedTasks];
    },

    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },

    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  addTask,
  toggleComplete,
  setFilter,
  reorderTasks,
  moveTaskAcrossColumns,
  setTasks,
  deleteTask,
} = tasksSlice.actions;

export const selectTasks = (state: RootState) => state.tasks.tasks;

export const selectFilter = (state: RootState) => state.tasks.filter;

export const selectFilteredTasks = createSelector(
  [selectTasks, selectFilter],
  (tasks, filter) => {
    switch (filter) {
      case 'completed':
        return tasks.filter((t) => t.completed);
      case 'incomplete':
        return tasks.filter((t) => !t.completed);
      default:
        return tasks;
    }
  },
);

export default tasksSlice.reducer;
