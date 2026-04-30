import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit, OnDestroy {
  private slideInterval: any;
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword = false;

  images: string[] = [
    'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1518684079-3c830dcef090?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
  ];
  currentImageIndex = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50), Login.emailDomainValidator]],
      senha: ['', [Validators.required, Validators.maxLength(50)]]
    });
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

  ngOnInit() {
    this.slideInterval = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }, 5000);
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const { email, senha } = this.loginForm.value;

      this.authService.login(email, senha).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          // Se o backend enviar os dados do usuário na resposta (response.user) ou caso fallback pegue do localStorage
          const userCpf = response?.user?.cpf || JSON.parse(localStorage.getItem('worldin_user') || '{}').cpf;
          const onboardingKey = `worldin_onboarding_done_${userCpf}`;
          const onboardingDone = localStorage.getItem(onboardingKey);
          
          if (onboardingDone) {
            this.router.navigate(['/home']);
          } else {
            this.router.navigate(['/onboarding']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'E-mail ou senha inválidos.';
          this.cdr.detectChanges(); // Força a atualização da view
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
