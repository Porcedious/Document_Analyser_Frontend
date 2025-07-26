import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';

import { AIService, AIResponse } from './app/services/ai.service';
import { FileUploadComponent, FileUploadData } from './app/components/file-upload/file-upload.component';
import { LoadingComponent } from './app/components/loading/loading.component';
import { ChatPanelComponent } from './app/components/chat-panel/chat-panel.component';
import { ResponsePanelComponent } from './app/components/response-panel/response-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadComponent,
    LoadingComponent,
    ChatPanelComponent,
    ResponsePanelComponent
  ],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <div class="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
            <h1>AI Document Analyzer</h1>
          </div>
          
          <div class="header-info">
            <span class="status-badge" [class]="getStatusClass()">
              {{ getStatusText() }}
            </span>
          </div>
        </div>
      </header>

      <main class="app-main" [class.split-view]="currentResponse">
        <!-- Upload Interface -->
        <div class="upload-section" [class.minimized]="currentResponse">
          <app-file-upload 
            (fileUploaded)="onFileUploaded($event)"
            *ngIf="!isLoading">
          </app-file-upload>
        </div>

        <!-- Split Interface -->
        <div class="split-interface" *ngIf="currentResponse" [@slideDown]>
          <div class="split-container">
            <div class="left-panel">
              <app-chat-panel [documentId]="currentResponse.id"></app-chat-panel>
            </div>
            
            <div class="right-panel">
              <app-response-panel 
                [response]="currentResponse"
                (responseUpdated)="onResponseUpdated($event)">
              </app-response-panel>
            </div>
          </div>
        </div>
      </main>

      <!-- Loading Overlay -->
      <app-loading 
        [isVisible]="isLoading"
        title="Processing Your Document"
        message="Our AI is analyzing your document and generating a comprehensive response...">
      </app-loading>

      <!-- Footer -->
      <footer class="app-footer" *ngIf="!currentResponse">
        <div class="footer-content">
          <p>&copy; 2025 AI Document Analyzer. Powered by advanced AI technology.</p>
          <div class="footer-links">
            <a href="#" target="_blank">Privacy Policy</a>
            <a href="#" target="_blank">Terms of Service</a>
            <a href="#" target="_blank">Support</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styleUrls: ['./app.component.css'],
  animations: [
    // You can add Angular animations here if needed
  ]
})
export class App implements OnInit {
  currentResponse: AIResponse | null = null;
  isLoading: boolean = false;

  constructor(private aiService: AIService) {}

  ngOnInit(): void {
    // Subscribe to loading and response observables
    this.aiService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });

    this.aiService.response$.subscribe(response => {
      this.currentResponse = response;
    });
  }

  onFileUploaded(data: FileUploadData): void {
    this.aiService.uploadDocument({
      file: data.file,
      prompt: data.prompt
    }).subscribe({
      next: (response) => {
        // Response is handled by the service observables
      },
      error: (error) => {
        console.error('Upload error:', error);
        alert('There was an error processing your document. Please try again.');
      }
    });
  }

  onResponseUpdated(response: AIResponse): void {
    this.currentResponse = response;
  }

  getStatusText(): string {
    if (this.isLoading) return 'Processing';
    if (this.currentResponse) return 'Ready';
    return 'Waiting';
  }

  getStatusClass(): string {
    if (this.isLoading) return 'processing';
    if (this.currentResponse) return 'ready';
    return 'waiting';
  }
}

bootstrapApplication(App, {
  providers: [
    provideHttpClient()
  ]
});