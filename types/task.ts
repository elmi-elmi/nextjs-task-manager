export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export type TaskFilter = 'all' | 'completed' | 'incomplete';
export type ColumnKey = 'incomplete' | 'completed';
