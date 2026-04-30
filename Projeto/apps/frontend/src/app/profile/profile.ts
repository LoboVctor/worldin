import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  passwordSuccess: string = '';
  passwordError: string = '';

  showPasswordSection: boolean = false;
  showDeleteModal: boolean = false;
  deletePassword: string = '';
  deleteError: string = '';
  isDeleting: boolean = false;

  showPasswordCriteria: boolean = false;
  userName: string = '';
  userRole: string = '';
  selectedAvatar: string = '';

  showSenhaAtual = false;
  showNovaSenha = false;
  showConfirmarSenha = false;

  avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jude',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Lilly'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
      cpf: [{ value: '', disabled: true }]
    });

    this.passwordForm = this.fb.group({
      senhaAtual: ['', Validators.required],
      novaSenha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50), this.passwordStrengthValidator]],
      confirmarNovaSenha: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const errors: any = {};
    if (!/[A-Z]/.test(value)) errors.noUpperCase = true;
    if (!/[a-z]/.test(value)) errors.noLowerCase = true;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value)) errors.noSpecialChar = true;
    return Object.keys(errors).length ? errors : null;
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('novaSenha')?.value === g.get('confirmarNovaSenha')?.value
      ? null : { mismatch: true };
  }

  get novaSenhaControl() { return this.passwordForm.get('novaSenha'); }
  get hasMinLength(): boolean { return (this.novaSenhaControl?.value?.length || 0) >= 8; }
  get hasMaxLength(): boolean { return (this.novaSenhaControl?.value?.length || 0) <= 50; }
  get hasUpperCase(): boolean { return /[A-Z]/.test(this.novaSenhaControl?.value || ''); }
  get hasLowerCase(): boolean { return /[a-z]/.test(this.novaSenhaControl?.value || ''); }
  get hasSpecialChar(): boolean { return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(this.novaSenhaControl?.value || ''); }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.profileForm.patchValue({
        nome: user.nome,
        email: user.email,
        cpf: user.cpf
      });
      this.userName = user.nome;
      this.userRole = user.role;
      this.selectedAvatar = user.foto_perfil || '';
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';
      const user = this.authService.getCurrentUser();
      if (!user) return;

      const { nome, email } = this.profileForm.value;

      this.authService.updateProfile(user.cpf, { nome, email, foto_perfil: this.selectedAvatar }).subscribe({
        next: () => {
          this.successMessage = 'Dados atualizados com sucesso!';
          this.userName = nome;
          
          // Atualiza usuário localmente também para não perder as infos
          const updatedUser = { ...user, nome, email, foto_perfil: this.selectedAvatar };
          localStorage.setItem('worldin_user', JSON.stringify(updatedUser));
          
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erro ao atualizar dados.';
        }
      });
    }
  }

  selectAvatar(url: string) {
    this.selectedAvatar = url;
  }

  togglePasswordSection() {
    this.showPasswordSection = !this.showPasswordSection;
    this.passwordError = '';
    this.passwordSuccess = '';
    this.passwordForm.reset();
  }

  onChangePassword() {
    if (this.passwordForm.valid) {
      const user = this.authService.getCurrentUser();
      if (!user) return;

      this.passwordError = '';
      this.passwordSuccess = '';

      const { senhaAtual, novaSenha } = this.passwordForm.value;

      this.authService.changePassword(user.cpf, senhaAtual, novaSenha).subscribe({
        next: () => {
          this.passwordSuccess = 'Senha alterada com sucesso!';
          this.passwordForm.reset();
          setTimeout(() => {
            this.showPasswordSection = false;
            this.passwordSuccess = '';
          }, 3000);
        },
        error: (err) => {
          this.passwordError = err.error?.message || 'Erro ao alterar senha.';
        }
      });
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }

  openDeleteModal() {
    this.showDeleteModal = true;
    this.deletePassword = '';
    this.deleteError = '';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deletePassword = '';
    this.deleteError = '';
  }

  confirmDeleteAccount() {
    const user = this.authService.getCurrentUser();
    if (!user || !this.deletePassword) return;

    this.isDeleting = true;
    this.deleteError = '';

    this.authService.deleteAccount(user.cpf, this.deletePassword).subscribe({
      next: () => {
        this.isDeleting = false;
        this.closeDeleteModal();
        this.authService.logout();
      },
      error: (err) => {
        this.isDeleting = false;
        this.deleteError = err.error?.message || 'Senha incorreta.';
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
