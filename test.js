import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { CommentService } from '../../services/comment.service';
import { Task } from '../../models/task.model';
import { Comment } from '../../models/comment.model';
import { Observable } from 'rxjs';
import { TaskBoardComponent } from '../task-board/task-board.component';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
  providers: [TaskService, CommentService, TaskBoardComponent]
})
export class TaskComponent implements OnInit {
  //tasks$: Observable<Task[]>;
  selectedTask: any;
  newTask: Task = { id: 0, name: '', tag: '', comments: [] };
  newComment: Comment = { id: 0, content: '', user: '', taskId: 0 };

  constructor(private taskService: TaskService, private commentService: CommentService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    const listingId = 1; // Assurez-vous d'utiliser le listingId approprié
    this.tasks$ = this.taskService.getTasks(listingId);
  }

  selectTask(task: Task): void {
    this.selectedTask = task;
    this.loadComments(task.id);
  }

  addTask(): void {
    this.taskService.addTask(this.newTask).subscribe(() => {
      this.loadTasks();
      this.newTask = { id: 0, name: '', tag: '', comments: [] };
    });
  }

  updateTask(): void {
    if (this.selectedTask) {
      this.taskService.updateTask(this.selectedTask.id, this.selectedTask).subscribe(() => {
        this.loadTasks();
        this.selectedTask = null;
      });
    }
  }


  }
}