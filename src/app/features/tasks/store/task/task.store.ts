import { CreateTaskDto, Task, UpdateTaskDto } from '@/app/models/task.model';
import { TaskService } from '@/app/shared/services/task.service';
import { computed, inject, Injectable } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { catchError, of } from 'rxjs';
import { initialTaskState } from './task.state';

export const TaskStore = signalStore(
  { providedIn: 'root' },
  withState(initialTaskState),

  withComputed(({ tasks }) => ({
    completedTasks: computed(() => tasks().filter((t) => t.completed)),
    pendingTasks: computed(() => tasks().filter((t) => !t.completed)),
  })),

  withMethods((store, taskService = inject(TaskService)) => ({
    loadTasks() {
      patchState(store, { loading: true, error: null });

      taskService
        .getTasks()
        .pipe(
          catchError((error) => {
            patchState(store, {
              error: error.message ?? 'Erro ao carregar tarefas',
              loading: false,
            });
            return of([]);
          })
        )
        .subscribe((tasks) => {
          patchState(store, {
            tasks,
            loading: false,
            initialized: true,
          });
        });
    },
    loadTask(id: string) {
      patchState(store, { loading: true, error: null });

      taskService
        .getTaskById(id)
        .pipe(
          catchError((error) => {
            patchState(store, {
              error: error.message ?? 'Erro ao carregar tarefa',
              loading: false,
            });
            return of(null);
          })
        )
        .subscribe((task) => {
          patchState(store, {
            selectedTask: task,
            loading: false,
            initialized: true,
          });
        });
    },

    // loadTask: rxMethod<string>(
    //   pipe(
    //     tap(() => patchState(store, { loading: true, error: null })),
    //     switchMap((id) =>
    //       taskService.getTaskById(id).pipe(
    //         tapResponse(
    //           (task) =>
    //             patchState(store, { selectedTask: task, loading: false }),
    //           (error: Error) =>
    //             patchState(store, { error: error.message, loading: false })
    //         )
    //       )
    //     )
    //   )
    // ),

    createTask(dto: CreateTaskDto) {
      patchState(store, { loading: true, error: null });

      taskService
        .createTask(dto)
        .pipe(
          catchError((error) => {
            patchState(store, {
              error: error.message ?? 'Erro ao criar tarefa',
              loading: false,
            });
            return of(null);
          })
        )
        .subscribe((newTask) => {
          if (newTask) {
            patchState(store, {
              tasks: [newTask, ...store.tasks()],
              loading: false,
            });
          }
        });
    },

    updateTask(id: string, dto: UpdateTaskDto) {
      patchState(store, { loading: true, error: null });

      taskService
        .updateTask(id, dto)
        .pipe(
          catchError((error) => {
            patchState(store, {
              error: error.message ?? 'Erro ao atualizar tarefa',
              loading: false,
            });
            return of(null);
          })
        )
        .subscribe((updated) => {
          if (updated) {
            patchState(store, {
              tasks: store.tasks().map((t) => (t.id === id ? updated : t)),
              loading: false,
            });
          }
        });
    },

    deleteTask(id: string) {
      patchState(store, { loading: true, error: null });

      taskService
        .deleteTask(id)
        .pipe(
          catchError((error) => {
            patchState(store, {
              error: error.message ?? 'Erro ao remover tarefa',
              loading: false,
            });
            return of(null);
          })
        )
        .subscribe(() => {
          patchState(store, {
            tasks: store.tasks().filter((t) => t.id !== id),
            loading: false,
          });
        });
    },

    selectTask(task: Task | null) {
      patchState(store, { selectedTask: task });
    },

    reset() {
      patchState(store, initialTaskState);
    },
  }))
  // withHooks({
  //   onInit(store) {
  //     const taskService = inject(TaskService);
  //     const storageService = inject(StorageService);

  //     effect(() => {
  //       const { tasks, initialized } = getState(store);
  //       if (initialized) {
  //         storageService.set('task_store_cache', JSON.stringify(tasks));
  //       }
  //     });

  //     taskService
  //       .getTasks()
  //       .pipe(
  //         catchError((error) => {
  //           console.error('Erro ao carregar tarefas:', error);
  //           const fallback = storageService.get('task_store_cache');
  //           const tasks = fallback ? JSON.parse(fallback) : [];
  //           return of(tasks);
  //         })
  //       )
  //       .subscribe((tasks) => {
  //         patchState(store, { tasks, initialized: true });
  //       });
  //   },
  // })
);

@Injectable({ providedIn: 'root' })
export class TaskStoreService extends TaskStore {}
