import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  viewMode: 'map' | 'cards' = 'cards';
  map: L.Map | undefined;

  intercambios: any[] = [];
  filteredIntercambios: any[] = [];
  isGerente: boolean = false;
  userName: string = '';

  // Filters
  searchQuery: string = '';
  priceRange: string = '';

  private apiUrl = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.isGerente = this.authService.isGerente();
    this.userName = user?.nome || 'Usuário';
    this.loadIntercambios();
  }

  loadIntercambios() {
    console.log('Loading intercambios from:', `${this.apiUrl}/intercambios`);
    this.http.get<any>(`${this.apiUrl}/intercambios`).subscribe({
      next: (data) => {
        console.log('Intercambios loaded:', data);
        const rawList = Array.isArray(data) ? data : (data?.value || []);
        
        this.intercambios = rawList.map((item: any) => ({
          ...item,
          mediaNotas: this.calcMediaNotas(item.avaliacoes),
          totalAvaliacoes: item.avaliacoes?.length || 0
        }));
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading intercambios:', err);
        this.intercambios = [];
        this.filteredIntercambios = [];
        this.cdr.detectChanges();
      }
    });
  }

  calcMediaNotas(avaliacoes: any[]): number {
    if (!avaliacoes || !Array.isArray(avaliacoes) || avaliacoes.length === 0) return 0;
    const sum = avaliacoes.reduce((acc: number, av: any) => acc + Number(av.nota), 0);
    return Math.round((sum / avaliacoes.length) * 10) / 10;
  }

  applyFilters() {
    let result = [...this.intercambios];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(item =>
        item.pais?.toLowerCase().includes(query) ||
        item.cidade?.toLowerCase().includes(query) ||
        item.titulo?.toLowerCase().includes(query) ||
        item.instituicao?.toLowerCase().includes(query)
      );
    }

    if (this.priceRange) {
      switch (this.priceRange) {
        case '1':
          result = result.filter(item => item.preco <= 10000);
          break;
        case '2':
          result = result.filter(item => item.preco > 10000 && item.preco <= 20000);
          break;
        case '3':
          result = result.filter(item => item.preco > 20000);
          break;
      }
    }

    this.filteredIntercambios = result;
  }

  clearFilters() {
    this.searchQuery = '';
    this.priceRange = '';
    this.filteredIntercambios = [...this.intercambios];
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => {
      if (i < Math.floor(rating)) return 1; // full star
      if (i < rating) return 0.5; // half star
      return 0; // empty star
    });
  }

  toggleView(mode: 'map' | 'cards') {
    this.viewMode = mode;
    if (mode === 'map') {
      setTimeout(() => this.initMap(), 100);
    }
  }

  initMap() {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map').setView([48.8566, 2.3522], 4);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(this.map);

    const customIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    this.filteredIntercambios.forEach(item => {
      if (this.map && item.latitude && item.longitude) {
        const stars = '★'.repeat(Math.round(item.mediaNotas)) + '☆'.repeat(5 - Math.round(item.mediaNotas));
        L.marker([item.latitude, item.longitude], { icon: customIcon })
          .addTo(this.map!)
          .bindPopup(`
            <div style="text-align: center;">
              <h6 style="margin-bottom: 5px; font-weight: bold;">${item.titulo}</h6>
              <p style="margin-bottom: 5px; color: #cd9672;">${stars}</p>
              <p style="margin-bottom: 10px;">R$ ${item.preco}</p>
              <a href="/intercambio/${item.id_intercambio}" class="btn btn-sm btn-primary" style="background-color: #cd9672; border: none; color: black; font-weight: bold;">Ver Detalhes</a>
            </div>
          `);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
