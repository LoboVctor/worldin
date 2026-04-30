import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class Onboarding {
  currentStep = 0;

  steps = [
    {
      icon: 'bi-globe-americas',
      image: 'https://loremflickr.com/600/400/travel,world',
      title: 'Explore o Mundo',
      description: 'Pesquise intercâmbios por país, cidade ou instituição. Encontre a experiência internacional perfeita para você.',
      color: '#cd9672'
    },
    {
      icon: 'bi-map',
      image: 'https://loremflickr.com/600/400/earth,globe',
      title: 'Mapa Interativo 3D',
      description: 'Visualize destinos em um globo 3D interativo. Clique nos marcadores para ver detalhes de cada intercâmbio.',
      color: '#72b5cd'
    },
    {
      icon: 'bi-star-fill',
      image: 'https://loremflickr.com/600/400/student,review',
      title: 'Avaliações Reais',
      description: 'Leia relatos e avaliações de alunos que já viveram a experiência. Notas de 1 a 5 estrelas para ajudar na sua escolha.',
      color: '#ffc107'
    },
    {
      icon: 'bi-rocket-takeoff',
      image: 'https://loremflickr.com/600/400/airplane,fly',
      title: 'Comece Agora!',
      description: 'Você está pronto para descobrir novos horizontes. Vamos começar sua jornada pelo mundo!',
      color: '#cd9672'
    }
  ];

  constructor(private router: Router) {}

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    } else {
      this.finish();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goToStep(index: number) {
    this.currentStep = index;
  }

  finish() {
    localStorage.setItem('worldin_onboarding_done', 'true');
    this.router.navigate(['/home']);
  }

  skip() {
    this.finish();
  }
}
