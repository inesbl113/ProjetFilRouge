import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ApiService } from '../../services/service-api.service';
import { StoreService } from '../../services/store.service';
import { CommonModule } from '@angular/common';
import { Comments } from '../../models/comment';
import { FrenchDatePipe } from '../../pipes/french-date.pipe';
import { ModalService } from '../../services/modal-service.service';
import { Subscription } from 'rxjs';
import { CommentComponent } from '../../comments/comment/comment.component';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FrenchDatePipe,
    CommentComponent,
    MatIconModule,
  ],
  standalone: true,
})
export class TaskCardComponent implements OnInit {
  @Input() taskId: number = 0;
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() comments: Comments[] = [];
  @Input() Listid: number = 0;
  @Input() dueDate: string = '';
  @Input() projectid: number = 0;
  @Input() taskCategorie: string = '';

  isVisible: boolean = false;
  showAddCommentButton: boolean = true;
  showComments: boolean = false;
  commentForm: FormGroup;
  editCommentForms: { [key: number]: FormControl } = {}; 
  formType: string = 'Comment';
  editCommentMode: boolean = false;
  editingCommentId: number | null = null;
  private modalSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private storeService: StoreService,
    private modalService: ModalService
  ) {
    this.commentForm = this.fb.group({
      text: ['', Validators.required],
      // You can add more fields here as needed
    });
    this.modalSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.modalSubscription = this.modalService.watch().subscribe((status) => {
      console.log(`Modal status: ${status}`);
    });

    this.initializeEditCommentForms();
  }

  initializeEditCommentForms(): void {
    this.comments.forEach(comment => {
      this.editCommentForms[comment.id] = new FormControl(comment.text);
    });
  }

  getBackgroundColor(categorie: string): string {
    switch (categorie) {
      case 'Marketing':
        return '#F26619';
      case 'Design':
        return '#335F8A';
      case 'Informatique':
        return '#FED440';
      case 'Event':
         return '#55D5E0';
      default:
        return '#2F4558'; 
    }
  }

  editTask(id: number): void {
    this.storeService.taskId = id;
    this.storeService.listId = this.Listid;
    console.log(`Editing task with id: ${id}`);
    this.storeService.isUpdate = true;
    this.toggleModal('taskform', id, this.storeService.taskId);
  }

  deleteTask(id: number): void {
    console.log('Taskid: ', this.taskId);
    this.apiService.delete(id, 'task').subscribe(() => {
      this.apiService.taskCreated();
    });
  }

  startEditing(commentId: number): void {
    this.editingCommentId = commentId;
  }

  editComment(id: number, text: string | null): void {
    if (text === null) {
      console.error('Text is null');
      return;
    }
    console.log(`Editing comment with id: ${id} and text: ${text}`); 
    const payload = {
      ...this.commentForm.value,
      Text: text,
      author: 'user modified',
      id: id,
      taskId: this.taskId,
    };
    this.apiService.update(id, payload, 'comment').subscribe({
      next: (response) => {
        console.log('Success:', response);
        this.apiService.commentCreated();
      },
    });
  }

  toggleEditCommentMode(): void {
    this.editCommentMode = !this.editCommentMode;
  }

  deleteComment(id: number): void {
    this.apiService.delete(id, 'comment').subscribe({
      next: (response) => {
        console.log('Success:', response);
        this.apiService.commentCreated();
      },
    });
  }

  toggleModal(action: string, projectId: number, data: any): void {
    this.modalService.open(action, projectId, data);
  }

  toggleComments(): void {
    this.showComments = !this.showComments;
    this.showAddCommentButton = !this.showComments;
  }

  showCommentsList(): void {
    this.isVisible = !this.isVisible;
  }

  submitComment(): void {
    if (this.commentForm.valid) {
      const payload = {
        ...this.commentForm.value,
        taskId: this.taskId,
        author: 'Anonymous',
      };
      console.log('Comment Payload:', payload);
      this.apiService.post(payload, this.formType).subscribe({
        next: (response) => {
          console.log('Comment Success:', response);
          this.apiService.commentCreated();
        },
        error: (error) => console.error('Comment Error:', error),
      });
    }
  }
}