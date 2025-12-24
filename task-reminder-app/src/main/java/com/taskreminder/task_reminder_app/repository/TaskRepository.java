package com.taskreminder.task_reminder_app.repository;

import com.taskreminder.task_reminder_app.model.Task;
import com.taskreminder.task_reminder_app.model.Status;
import com.taskreminder.task_reminder_app.model.Priority;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatus(Status status);

    List<Task> findByPriority(Priority priority);
}
