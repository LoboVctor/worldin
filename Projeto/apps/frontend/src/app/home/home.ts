import { Component, OnInit, ChangeDetectorRef, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { ThemeService } from '../theme.service';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  viewMode: 'globe' | 'map' | 'cards' = 'globe';
  private globe: any;
  map: L.Map | undefined;

  intercambios: any[] = [];
  filteredIntercambios: any[] = [];
  searchTags: string[] = [];
  tagInput: string = '';
  isGerente: boolean = false;
  userName: string = '';

  // Price Range Slider
  priceMin: number = 0;
  priceMax: number = 50000;
  priceMinValue: number = 0;
  priceMaxValue: number = 50000;

  // Theme
  isDarkMode: boolean = true;
  private themeSub: Subscription | undefined;

  // Globe tooltip
  hoveredItem: any = null;
  tooltipStyle: any = {};

  private apiUrl = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.isGerente = this.authService.isGerente();
    this.userName = user?.nome || 'Usuário';
    this.loadIntercambios();
    if (this.viewMode === 'globe') {
      setTimeout(() => this.initGlobe(), 300);
    } else if (this.viewMode === 'map') {
      setTimeout(() => this.initMap(), 100);
    }
    this.themeSub = this.themeService.isDarkMode$.subscribe(val => {
      this.isDarkMode = val;
    });
  }

  ngOnDestroy() {
    this.themeSub?.unsubscribe();
    if (this.globe) {
      this.globe.pauseAnimation();
      // Clean up globe
      const container = document.getElementById('globe-container');
      if (container) container.innerHTML = '';
    }
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  loadIntercambios() {
    this.http.get<any>(`${this.apiUrl}/intercambios`).subscribe({
      next: (data) => {
        const rawList = Array.isArray(data) ? data : (data?.value || []);
        
        this.intercambios = rawList.map((item: any) => ({
          ...item,
          mediaNotas: this.calcMediaNotas(item.avaliacoes),
          totalAvaliacoes: item.avaliacoes?.length || 0
        }));

        // Calculate max price for slider
        if (this.intercambios.length > 0) {
          const maxP = Math.max(...this.intercambios.map((i: any) => Number(i.preco) || 0));
          this.priceMax = Math.ceil(maxP / 1000) * 1000 || 50000;
          this.priceMaxValue = this.priceMax;
        }

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

      const price = Number(item.preco) || 0;
      const matchesPrice = price >= this.priceMinValue && price <= this.priceMaxValue;

      return matchesTags && matchesPrice;
    });

    if (this.viewMode === 'globe') {
      if (this.globe) {
        this.updateGlobeData();
      } else {
        setTimeout(() => this.initGlobe(), 200);
      }
    } else if (this.viewMode === 'map') {
      this.initMap();
    }
  }

  updateGlobeData() {
    if (!this.globe) return;
    const pointsData = this.getGlobePointsData();
    this.globe.pointsData(pointsData);
    this.globe.htmlElementsData(pointsData);
    this.globe.ringsData(pointsData);
  }

  getGlobePointsData() {
    return this.filteredIntercambios
      .filter((item: any) => item.latitude && item.longitude)
      .map((item: any) => ({
        lat: Number(item.latitude),
        lng: Number(item.longitude),
        size: 1.5,
        color: '#cd9672',
        id: item.id_intercambio,
        titulo: item.titulo,
        cidade: item.cidade,
        pais: item.pais,
        preco: item.preco,
        mediaNotas: item.mediaNotas
      }));
  }

  onPriceMinChange(event: any) {
    const val = Number(event.target.value);
    if (val <= this.priceMaxValue) {
      this.priceMinValue = val;
    } else {
      this.priceMinValue = this.priceMaxValue;
    }
    this.applyFilters();
  }

  onPriceMaxChange(event: any) {
    const val = Number(event.target.value);
    if (val >= this.priceMinValue) {
      this.priceMaxValue = val;
    } else {
      this.priceMaxValue = this.priceMinValue;
    }
    this.applyFilters();
  }

  get sliderMinPercent(): number {
    return (this.priceMinValue / this.priceMax) * 100;
  }

  get sliderMaxPercent(): number {
    return (this.priceMaxValue / this.priceMax) * 100;
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
    this.priceMinValue = 0;
    this.priceMaxValue = this.priceMax;
    this.filteredIntercambios = [...this.intercambios];
    if (this.viewMode === 'globe') {
      if (this.globe) this.updateGlobeData();
      else setTimeout(() => this.initGlobe(), 200);
    } else if (this.viewMode === 'map') {
      this.initMap();
    }
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => {
      if (i < Math.floor(rating)) return 1;
      if (i < rating) return 0.5;
      return 0;
    });
  }

  toggleView(mode: 'globe' | 'map' | 'cards') {
    this.viewMode = mode;
    if (mode === 'globe') {
      setTimeout(() => this.initGlobe(), 300);
    } else if (mode === 'map') {
      setTimeout(() => this.initMap(), 100);
    }
  }

  initMap() {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map').setView([20, 0], 2);

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

  async initGlobe() {
    const container = document.getElementById('globe-container');
    if (!container) return;

    // Clean up previous globe
    container.innerHTML = '';

    const Globe = (await import('globe.gl')).default;

    const pointsData = this.getGlobePointsData();

    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    this.globe = new Globe(container)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .width(width)
      .height(height)
      .pointsData(pointsData)
      .pointLat('lat')
      .pointLng('lng')
      .pointAltitude(0.01)
      .pointRadius('size')
      .pointColor('color')
      .ringsData(pointsData)
      .ringColor(() => '#cd9672')
      .ringMaxRadius('size')
      .ringPropagationSpeed(2)
      .ringRepeatPeriod(800)
      .atmosphereColor('#cd9672')
      .atmosphereAltitude(0.2)
      .onPointClick((point: any) => {
        this.ngZone.run(() => {
          this.router.navigate(['/intercambio', point.id]);
        });
      });

    // Auto rotate
    if (this.globe) {
      this.globe.controls().autoRotate = true;
      this.globe.controls().autoRotateSpeed = 0.2; // Reduzido conforme feedback
      this.globe.controls().enableZoom = true;

      // Add HTML labels for points
      this.globe
        .htmlElementsData(pointsData)
        .htmlLat('lat')
        .htmlLng('lng')
        .htmlAltitude(0.02)
        .htmlElement((d: any) => {
          const el = document.createElement('div');
          el.style.cssText = `
            color: white;
            font-size: 10px;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            background: rgba(0,0,0,0.7);
            padding: 3px 8px;
            border-radius: 10px;
            border: 1px solid rgba(205,150,114,0.5);
            white-space: nowrap;
            pointer-events: auto;
            cursor: pointer;
            transition: all 0.2s;
          `;
          el.innerHTML = `${d.titulo}`;
          el.onclick = () => {
            this.ngZone.run(() => {
              this.router.navigate(['/intercambio', d.id]);
            });
          };
          el.onmouseenter = () => {
            el.style.background = 'rgba(205,150,114,0.9)';
            el.style.color = 'black';
            el.style.transform = 'scale(1.1)';
          };
          el.onmouseleave = () => {
            el.style.background = 'rgba(0,0,0,0.7)';
            el.style.color = 'white';
            el.style.transform = 'scale(1)';
          };
          return el;
        });
    }
  }

  logout() {
    this.authService.logout();
  }
}
