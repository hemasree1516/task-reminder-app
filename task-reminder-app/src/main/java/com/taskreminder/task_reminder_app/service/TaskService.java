package com.taskreminder.task_reminder_app.service;

import com.taskreminder.task_reminder_app.model.Task;
import com.taskreminder.task_reminder_app.model.Status;
import com.taskreminder.task_reminder_app.model.Priority;

import java.util.List;

public interface TaskService {

    Task createTask(Task task);

    List<Task> getAllTasks();

    Task getTaskById(Long id);

    List<Task> getTasksByStatus(Status status);

    List<Task> getTasksByPriority(Priority priority);

    Task updateTask(Long id, Task updatedTask);

    void deleteTask(Long id);

    Task markTaskAsDone(Long id);
}
