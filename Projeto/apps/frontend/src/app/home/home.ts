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
  viewMode: 'map' | 'cards' = 'map';
  map: L.Map | undefined;

  intercambios: any[] = [];
  filteredIntercambios: any[] = [];
  searchTags: string[] = [];
  tagInput: string = '';
  isGerente: boolean = false;
  userName: string = '';

  // Filters
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
    if (this.viewMode === 'map') {
      setTimeout(() => this.initMap(), 100);
    }
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
    this.filteredIntercambios = this.intercambios.filter(item => {
      const searchStr = `${item.titulo} ${item.pais} ${item.cidade} ${item.instituicao}`.toLowerCase();
      
      let matchesTags = true;
      if (this.searchTags.length > 0) {
        matchesTags = this.searchTags.some(tag => searchStr.includes(tag));
      }

      let matchesPrice = true;
      if (this.priceRange === '1') matchesPrice = item.preco <= 10000;
      if (this.priceRange === '2') matchesPrice = item.preco > 10000 && item.preco <= 20000;
      if (this.priceRange === '3') matchesPrice = item.preco > 20000;

      return matchesTags && matchesPrice;
    });

    if (this.viewMode === 'map') {
      this.initMap();
    }
  }

  addSearchTag(event: any) {
    const val = this.tagInput.trim();
    if (val && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      if (!this.searchTags.includes(val.toLowerCase())) {
        this.searchTags.push(val.toLowerCase());
      }
      this.tagInput = '';
      this.applyFilters();
    }
  }

  removeSearchTag(tag: string) {
    this.searchTags = this.searchTags.filter(t => t !== tag);
    this.applyFilters();
  }

  clearFilters() {
    this.searchTags = [];
    this.tagInput = '';
    this.priceRange = '';
    this.filteredIntercambios = [...this.intercambios];
    if (this.viewMode === 'map') {
      this.initMap();
    }
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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
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
