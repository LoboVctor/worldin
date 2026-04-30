import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  showPasswordCriteria: boolean = false;
  showPassword = false;
  showConfirmPassword = false;
  cpfInUse: boolean = false;
  cpfChecking: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.registerForm = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      cpf: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50), Register.emailDomainValidator]],
      role: ['', [Validators.required]],
      senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50), this.passwordStrengthValidator]],
      confirmarSenha: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value);

    const errors: any = {};
    if (!hasUpperCase) errors.noUpperCase = true;
    if (!hasLowerCase) errors.noLowerCase = true;
    if (!hasSpecialChar) errors.noSpecialChar = true;

    return Object.keys(errors).length ? errors : null;
  }

  static emailDomainValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const parts = value.split('@');
    if (parts.length === 2 && parts[1] && !parts[1].includes('.')) {
      return { invalidDomain: true };
    }
    return null;
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('senha')?.value === g.get('confirmarSenha')?.value
      ? null : { mismatch: true };
  }

  get senhaControl() {
    return this.registerForm.get('senha');
  }

  get hasMinLength(): boolean {
    return (this.senhaControl?.value?.length || 0) >= 8;
  }

  get hasMaxLength(): boolean {
    return (this.senhaControl?.value?.length || 0) <= 50;
  }

  get hasUpperCase(): boolean {
    return /[A-Z]/.test(this.senhaControl?.value || '');
  }

  get hasLowerCase(): boolean {
    return /[a-z]/.test(this.senhaControl?.value || '');
  }

  get hasSpecialChar(): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(this.senhaControl?.value || '');
  }

  formatCPF(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    }
    this.registerForm.get('cpf')?.setValue(value, { emitEvent: false });
  }

  togglePassword(field: 'senha' | 'confirmarSenha') {
    if (field === 'senha') this.showPassword = !this.showPassword;
    if (field === 'confirmarSenha') this.showConfirmPassword = !this.showConfirmPassword;
  }

  checkCpfAvailability() {
    const cpfValue = this.registerForm.get('cpf')?.value;
    if (!cpfValue || cpfValue.length < 14) {
      this.cpfInUse = false;
      return;
    }
    const cpfClean = cpfValue.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      this.cpfInUse = false;
      return;
    }
    this.cpfChecking = true;
    this.http.get<{available: boolean}>(`http://localhost:3000/users/check-cpf/${cpfClean}`).subscribe({
      next: (res) => {
        this.cpfInUse = !res.available;
        this.cpfChecking = false;
      },
      error: () => {
        this.cpfInUse = false;
        this.cpfChecking = false;
      }
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      let { nome, cpf, email, senha, role } = this.registerForm.value;
      cpf = cpf.replace(/\D/g, ''); // Remove pontuação antes de enviar

      this.authService.register({ nome, cpf, email, senha, role }).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Cadastro realizado com sucesso! Redirecionando para o login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Erro ao criar conta. Tente novamente.';
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
