import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-task-modal',
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.css']
})
export class TaskModalComponent implements OnInit {
  @Input() stageId!: string;
  @Input() availableManagers: User[] = [];
  @Output() taskCreated = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  taskForm: FormGroup;
  showModal = true;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private taskService: TaskService
  ) {
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      // description: [''], // Removed
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      // estimatedHours: [0, [Validators.min(0)]], // Removed
      assignedUserId: [''] // Added
    });
  }

  ngOnInit() {
    // Set default dates
    const today = new Date();
    const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    this.taskForm.patchValue({
      startDate: today.toISOString().split('T')[0],
      endDate: oneWeekLater.toISOString().split('T')[0]
    });
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const taskData = {
        name: formValue.name,
        startDate: new Date(formValue.startDate),
        endDate: new Date(formValue.endDate),
        isCompleted: false,
        status: 'on_track'
      };

      this.projectService.addTaskToStage(this.stageId, taskData)
        .subscribe({
          next: (createdTask) => {
            // If user is selected, assign them
            if (formValue.assignedUserId) {
              this.taskService.assignUserToTask(createdTask.id, formValue.assignedUserId).subscribe({
                next: () => {
                  this.taskCreated.emit();
                  this.closeModal();
                },
                error: (err) => {
                  console.error('Error assigning user to task:', err);
                  // Emit anyway since task was created
                  this.taskCreated.emit();
                  this.closeModal();
                }
              });
            } else {
              this.taskCreated.emit();
              this.closeModal();
            }
          },
          error: (error) => console.error('Error creating task:', error)
        });
    }
  }

  closeModal() {
    this.showModal = false;
    this.modalClosed.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }
}