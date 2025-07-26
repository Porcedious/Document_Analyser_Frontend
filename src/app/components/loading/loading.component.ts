import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay" *ngIf="isVisible">
      <div class="loading-content">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        
        <div class="progress-steps">
          <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
            <div class="step-number">1</div>
            <span>Processing document</span>
          </div>
          <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
            <div class="step-number">2</div>
            <span>AI analysis</span>
          </div>
          <div class="step" [class.active]="currentStep >= 3" [class.completed]="currentStep > 3">
            <div class="step-number">3</div>
            <span>Generating response</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent {
  @Input() isVisible: boolean = false;
  @Input() title: string = 'Processing Document';
  @Input() message: string = 'Please wait while our AI analyzes your document...';
  
  currentStep: number = 1;

  ngOnInit(): void {
    if (this.isVisible) {
      this.startProgressSimulation();
    }
  }

  ngOnChanges(): void {
    if (this.isVisible) {
      this.currentStep = 1;
      this.startProgressSimulation();
    }
  }

  private startProgressSimulation(): void {
    // Simulate progress steps
    setTimeout(() => this.currentStep = 2, 1000);
    setTimeout(() => this.currentStep = 3, 2000);
  }
}