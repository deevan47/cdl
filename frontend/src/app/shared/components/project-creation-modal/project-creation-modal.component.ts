import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectPlatform } from '../../models/project.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-project-creation-modal',
  templateUrl: './project-creation-modal.component.html',
  styleUrls: ['./project-creation-modal.component.css']
})
export class ProjectCreationModalComponent implements OnInit {
  @Input() platform!: ProjectPlatform;
  @Input() availableManagers: User[] = [];
  @Output() projectCreated = new EventEmitter<any>();
  @Output() modalClosed = new EventEmitter<void>();

  projectForm: FormGroup;
  showModal = true;

  constructor(private fb: FormBuilder) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      projectManagerId: ['', Validators.required],
      deadline: ['', Validators.required],
      scenario: ['']
    });
  }

  ngOnInit() {
    // Set default deadline to 30 days from now
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 30);
    this.projectForm.patchValue({
      deadline: defaultDeadline.toISOString().split('T')[0],
      scenario: this.getDefaultScenario()
    });
  }

  getDefaultScenario(): string {
    return this.platform === ProjectPlatform.FLAME
      ? 'Internal Creative Project'
      : 'External Educational Course';
  }

  getPlatformTitle(): string {
    return this.platform === ProjectPlatform.FLAME ? 'FLAME' : 'SWAYAM';
  }

  getStageTemplates(): string[] {
    return this.platform === ProjectPlatform.FLAME
      ? ['Pre-Production', 'Production', 'Post-Production']
      : ['Production', 'Post-Production'];
  }

  onSubmit() {
    console.log('Form submitted, valid:', this.projectForm.valid);
    console.log('Form values:', this.projectForm.value);
    console.log('Form errors:', this.projectForm.errors);

    if (this.projectForm.valid) {
      const projectData = {
        ...this.projectForm.value,
        platform: this.platform
      };
      console.log('Emitting project data:', projectData);
      this.projectCreated.emit(projectData);
    } else {
      console.error('Form is invalid. Errors:', this.projectForm.errors);
      // Mark all fields as touched to show validation errors
      Object.keys(this.projectForm.controls).forEach(key => {
        this.projectForm.get(key)?.markAsTouched();
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

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}