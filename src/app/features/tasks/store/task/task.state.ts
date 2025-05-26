import { Task } from '@/app/models/task.model';

export interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

export const initialTaskState: TaskState = {
  tasks: [],
  selectedTask: null,
  loading: false,
  initialized: false,
  error: null,
};
