import { Component, OnInit, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ApiService } from '../../../services/service-api.service';
import { StoreService } from '../../../services/store.service';
import { format } from 'date-fns';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../services/modal-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { futureDateValidator } from './future-date-validator';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  formType: string = 'Task';
  listid: number = 0;
  isUpdateValue: boolean = false;

  @Input() currentId: number = 0;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private storeService: StoreService,
    private modalService: ModalService,
    private snackBar: MatSnackBar
  ) {
    this.taskForm = this.fb.group({
      Title: ['', Validators.required],
      Categorie: ['', Validators.required],
      Description: ['', Validators.required],
      dueDate: ['', [Validators.required, futureDateValidator()]]
    });
  }

  ngOnInit(): void {
    this.storeService.taskId$.subscribe((taskId: number | null) => {
      if (taskId !== null) {
        this.currentId = taskId;
      } else {
        console.log('TaskId is null');
      }
    });

    this.storeService.listId$.subscribe((listId: number | null) => {
      if (listId !== null) {
        this.listid = listId;
      } else {
        console.log('ListId is null');
      }
    });

    this.isUpdateValue = this.storeService.isUpdate;
  }

  // Add other methods (edit, submit, etc.) here

 


  edit(formType: string) {
    const formattedDueDate = format(
      this.taskForm.value.dueDate,
      "yyyy-MM-dd'T'00:00:00"
    );
    // Create a payload with the form values and add the id as a key
    const payload = {
      ...this.taskForm.value,
      dueDate: formattedDueDate,
      id: this.currentId,
      listid: this.listid, // Add the id to the payload
    };

    console.log(payload);

    this.apiService.update(this.currentId, payload, formType).subscribe({
      next: (task) => {
        if (task !== null) {
          this.taskForm.patchValue(task);
          console.log('Task details fetched for editing:', task);
        } else {
          console.log('Task is null');
        }
        // Emit the taskCreated event immediately after handling the response
        this.apiService.taskCreated();
      },
    });
  }

  submit() {
    if (this.taskForm.valid) {
      const payload = {
        ...this.taskForm.value,
        listId: this.currentId, // Add the projectId field with currentId value
      };
      console.log('Payload:', payload);
      this.apiService.post(payload, this.formType).subscribe({
        next: (response) => {
          console.log('Success:', response);
          this.apiService.taskCreated();
          this.modalService.close();
          this.snackBar.open('Task created successfully!', 'Close', {
            duration: 3000,
            panelClass: ['custom-snackbar'], // Duration in milliseconds after which the snack-bar will be automatically dismissed.
          }); //// Emit the task creation event
        },
        error: (error) => console.error('Error:', error),
      });
    }
  }
}
