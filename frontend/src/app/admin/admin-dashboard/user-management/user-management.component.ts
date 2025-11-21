import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User, UserRole } from '../../../shared/models/user.model';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  showUserModal = false;
  userForm: FormGroup;
  isEditing = false;
  editingUserId: string | null = null;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      avatar: ['']
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  openCreateUserModal() {
    this.isEditing = false;
    this.editingUserId = null;
    this.userForm.reset();
    this.showUserModal = true;
  }

  openEditUserModal(user: User) {
    this.isEditing = true;
    this.editingUserId = user.id;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    });
    this.showUserModal = true;
  }

  closeUserModal() {
    this.showUserModal = false;
    this.userForm.reset();
  }

  onSubmitUser() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;

      if (this.isEditing && this.editingUserId) {
        this.userService.updateUser(this.editingUserId, userData).subscribe({
          next: (updatedUser) => {
            const index = this.users.findIndex(u => u.id === updatedUser.id);
            if (index !== -1) {
              this.users[index] = updatedUser;
            }
            this.closeUserModal();
          },
          error: (error) => console.error('Error updating user:', error)
        });
      } else {
        this.userService.createUser(userData).subscribe({
          next: (newUser) => {
            this.users.unshift(newUser);
            this.closeUserModal();
          },
          error: (error) => console.error('Error creating user:', error)
        });
      }
    }
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
        },
        error: (error) => console.error('Error deleting user:', error)
      });
    }
  }

  getRoleDisplayName(role: UserRole): string {
    const roleNames = {
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.PROJECT_MANAGER]: 'Project Manager',
      [UserRole.LEAD_DESIGNER]: 'Lead Designer',
      [UserRole.RESEARCH_ASSOCIATE]: 'Research Associate',
      [UserRole.LEAD_DEVELOPER]: 'Lead Developer',
      [UserRole.QA_ENGINEER]: 'QA Engineer',
      [UserRole.CONTENT_STRATEGIST]: 'Content Strategist',
      [UserRole.JR_DEVELOPER]: 'Junior Developer',
      [UserRole.EDITOR]: 'Editor',
      [UserRole.ANIMATOR]: 'Animator'
    };
    return roleNames[role] || role;
  }

  getAllRoles(): UserRole[] {
    return [
      UserRole.PROJECT_MANAGER,
      UserRole.LEAD_DESIGNER,
      UserRole.LEAD_DEVELOPER,
      UserRole.QA_ENGINEER,
      UserRole.CONTENT_STRATEGIST
    ];
  }
}