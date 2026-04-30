import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-intercambio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './intercambio.html',
  styleUrl: './intercambio.css',
})
export class Intercambio implements OnInit {
  isNew: boolean = false;
  isEditing: boolean = false;
  intercambioForm: FormGroup;
  avaliacaoForm: FormGroup;

  intercambioId: string | null = null;
  intercambioDetail: any = null;
  avaliacoes: any[] = [];
  mediaNotas: number = 0;
  isGerente: boolean = false;
  isLoading: boolean = false;

  // Toast
  showToast: boolean = false;
  toastMessage: string = '';

  // Star rating
  hoverRating: number = 0;
  selectedRating: number = 5;

  // Map Modal
  showMapModal = false;
  pickerMap: L.Map | undefined;
  pickerMarker: L.Marker | undefined;
  tempLat: number | null = null;
  tempLng: number | null = null;

  private apiUrl = 'http://localhost:3000';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.intercambioForm = this.fb.group({
      titulo: ['', Validators.required],
      pais: ['', Validators.required],
      cidade: ['', Validators.required],
      instituicao: ['', Validators.required],
      preco: [null, [Validators.required, Validators.min(0)]],
      descricao: ['', Validators.required],
      link_compra: [''],
      imagem: ['', Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required]
    });

    this.avaliacaoForm = this.fb.group({
      titulo: ['', Validators.required],
      descricao: ['', Validators.required],
      nota: [5, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  ngOnInit() {
    this.isGerente = this.authService.isGerente();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isNew = false;
        this.intercambioId = params['id'];
        this.loadDetails();
      } else {
        this.isNew = true;
      }
    });
  }

  loadDetails() {
    if (!this.intercambioId) return;
    this.isLoading = true;
    console.log('Loading detail for ID:', this.intercambioId);

    this.http.get<any>(`${this.apiUrl}/intercambios/${this.intercambioId}`).subscribe({
      next: (data) => {
        console.log('Detail loaded:', data);
        this.intercambioDetail = data?.value || data;
        this.avaliacoes = this.intercambioDetail.avaliacoes || [];
        this.calcMedia();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading details:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/home']);
      }
    });
  }

  calcMedia() {
    if (!this.avaliacoes || !Array.isArray(this.avaliacoes) || this.avaliacoes.length === 0) {
      this.mediaNotas = 0;
      return;
    }
    const sum = this.avaliacoes.reduce((acc, av) => acc + Number(av.nota), 0);
    this.mediaNotas = Math.round((sum / this.avaliacoes.length) * 10) / 10;
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => {
      if (i < Math.floor(rating)) return 1;
      if (i < rating) return 0.5;
      return 0;
    });
  }

  setRating(rating: number) {
    this.selectedRating = rating;
    this.avaliacaoForm.patchValue({ nota: rating });
  }

  setHoverRating(rating: number) {
    this.hoverRating = rating;
  }

  clearHoverRating() {
    this.hoverRating = 0;
  }

  onSubmitIntercambio() {
    if (this.intercambioForm.valid) {
      this.isLoading = true;
      const user = this.authService.getCurrentUser();
      const body = {
        ...this.intercambioForm.value,
        id_usuario: user?.cpf
      };

      if (this.isEditing && this.intercambioId) {
        this.http.put(`${this.apiUrl}/intercambios/${this.intercambioId}`, body).subscribe({
          next: () => {
            this.isLoading = false;
            this.showToastMessage('Intercâmbio atualizado com sucesso!');
            this.router.navigate(['/home']);
          },
          error: () => {
            this.isLoading = false;
            this.showToastMessage('Erro ao atualizar intercâmbio.');
          }
        });
      } else {
        this.http.post(`${this.apiUrl}/intercambios`, body).subscribe({
          next: () => {
            this.isLoading = false;
            this.showToastMessage('Intercâmbio criado com sucesso!');
            setTimeout(() => this.router.navigate(['/home']), 3000);
          },
          error: () => {
            this.isLoading = false;
            this.showToastMessage('Erro ao criar intercâmbio.');
          }
        });
      }
    }
  }

  onSubmitAvaliacao() {
    if (this.avaliacaoForm.valid && this.intercambioId) {
      const user = this.authService.getCurrentUser();
      const body = {
        ...this.avaliacaoForm.value,
        nota: this.selectedRating,
        id_intercambio: parseInt(this.intercambioId),
        id_usuario: user?.cpf
      };

      this.http.post(`${this.apiUrl}/avaliacoes`, body).subscribe({
        next: (avaliacao: any) => {
          this.avaliacoes.unshift({
            ...avaliacao,
            usuario: { nome: user?.nome || 'Você' }
          });
          this.calcMedia();
          this.avaliacaoForm.reset({ nota: 5 });
          this.selectedRating = 5;
          this.showToastMessage('Avaliação publicada com sucesso!');
        },
        error: () => {
          this.showToastMessage('Erro ao publicar avaliação.');
        }
      });
    }
  }

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  goToCompra() {
    if (this.intercambioDetail?.link_compra) {
      window.open(this.intercambioDetail.link_compra, '_blank');
    }
  }

  deleteIntercambio() {
    if (this.intercambioId && confirm('Tem certeza que deseja excluir este intercâmbio?')) {
      this.http.delete(`${this.apiUrl}/intercambios/${this.intercambioId}`).subscribe({
        next: () => {
          this.showToastMessage('Intercâmbio excluído com sucesso!');
          setTimeout(() => this.router.navigate(['/home']), 1500);
        },
        error: () => {
          this.showToastMessage('Erro ao excluir intercâmbio.');
        }
      });
    }
  }

  editIntercambio() {
    this.isNew = true;
    this.isEditing = true;
    this.intercambioForm.patchValue({
      titulo: this.intercambioDetail.titulo,
      pais: this.intercambioDetail.pais,
      cidade: this.intercambioDetail.cidade,
      instituicao: this.intercambioDetail.instituicao,
      preco: this.intercambioDetail.preco,
      descricao: this.intercambioDetail.descricao,
      link_compra: this.intercambioDetail.link_compra,
      imagem: this.intercambioDetail.imagem,
      latitude: this.intercambioDetail.latitude,
      longitude: this.intercambioDetail.longitude
    });
  }

  cancelar() {
    if (this.isEditing) {
      this.isNew = false;
      this.isEditing = false;
    } else {
      this.router.navigate(['/home']);
    }
  }

  blockComma(event: KeyboardEvent) {
    if (event.key === ',') event.preventDefault();
  }

  openMapModal() {
    this.showMapModal = true;
    setTimeout(() => {
      this.pickerMap = L.map('picker-map').setView([0, 0], 2);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
      }).addTo(this.pickerMap);

      this.pickerMap.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        this.tempLat = lat;
        this.tempLng = lng;
        if (this.pickerMarker) {
          this.pickerMarker.setLatLng([lat, lng]);
        } else {
          this.pickerMarker = L.marker([lat, lng]).addTo(this.pickerMap!);
        }
      });
    }, 200);
  }

  confirmMapLocation() {
    if (this.tempLat !== null && this.tempLng !== null) {
      this.intercambioForm.patchValue({
        latitude: this.tempLat.toFixed(6),
        longitude: this.tempLng.toFixed(6)
      });
    }
    this.closeMapModal();
  }

  closeMapModal() {
    this.showMapModal = false;
    if (this.pickerMap) {
      this.pickerMap.remove();
      this.pickerMap = undefined;
      this.pickerMarker = undefined;
    }
  }

  logout() {
    this.authService.logout();
  }
}
