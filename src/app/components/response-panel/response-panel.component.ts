import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIService, AIResponse } from '../../services/ai.service';

@Component({
  selector: 'app-response-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="response-panel">
      <div class="response-header">
        <div class="header-title">
          <h3>AI Response</h3>
          <p *ngIf="response">Generated {{ formatTime(response.timestamp) }}</p>
        </div>
        
        <div class="action-buttons">
          <button class="btn btn-secondary" 
                  (click)="toggleEdit()"
                  [class.active]="isEditing">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            {{ isEditing ? 'View' : 'Edit' }}
          </button>
          
          <button class="btn btn-secondary" 
                  (click)="copyResponse()"
                  [disabled]="!response">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy
          </button>
          
          <button class="btn btn-primary" 
                  (click)="downloadResponse()"
                  [disabled]="!response || (isEditing && hasUnsavedChanges)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-15"></path>
              <polyline points="7,10 12,15 17,10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download
          </button>
          
          <button *ngIf="isEditing && hasUnsavedChanges" 
                  class="btn btn-success" 
                  (click)="regenerateResponse()"
                  [disabled]="isRegenerating">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23,4 23,10 17,10"></polyline>
              <polyline points="1,20 1,14 7,14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            {{ isRegenerating ? 'Regenerating...' : 'Regenerate' }}
          </button>
        </div>
      </div>
      
      <div class="response-content">
        <div *ngIf="!isEditing" class="response-display">
          <div class="content" [innerHTML]="formattedContent"></div>
        </div>
        
        <div *ngIf="isEditing" class="response-edit">
          <textarea [(ngModel)]="editableContent" 
                    (ngModelChange)="onContentChange()"
                    placeholder="Edit the AI response..."
                    rows="20"></textarea>
          
          <div class="edit-actions">
            <div class="edit-info">
              <span [class.unsaved]="hasUnsavedChanges">
                {{ hasUnsavedChanges ? 'Unsaved changes' : 'No changes' }}
              </span>
            </div>
            
            <div class="edit-buttons">
              <button class="btn btn-outline" (click)="discardChanges()">Discard</button>
              <button class="btn btn-primary" 
                      (click)="saveChanges()"
                      [disabled]="!hasUnsavedChanges">Save</button>
            </div>
          </div>
        </div>
        
        <div *ngIf="!response" class="empty-state">
          <div class="empty-icon">📄</div>
          <h4>No response yet</h4>
          <p>Upload a document to see the AI response here</p>
        </div>
      </div>
      
      <!-- Notification Toast -->
      <div *ngIf="notification" 
           class="notification" 
           [class]="notification.type">
        {{ notification.message }}
      </div>
    </div>
  `,
  styleUrls: ['./response-panel.component.css']
})
export class ResponsePanelComponent {
  @Input() response: AIResponse | null = null;
  @Output() responseUpdated = new EventEmitter<AIResponse>();
  
  isEditing: boolean = false;
  editableContent: string = '';
  originalContent: string = '';
  hasUnsavedChanges: boolean = false;
  isRegenerating: boolean = false;
  notification: { message: string; type: string } | null = null;

  constructor(private aiService: AIService) {}

  ngOnChanges(): void {
    if (this.response) {
      this.originalContent = this.response.content;
      this.editableContent = this.response.content;
      this.hasUnsavedChanges = false;
    }
  }

  get formattedContent(): string {
    return this.response?.content?.replace(/\n/g, '<br>') || '';
  }

  toggleEdit(): void {
    if (this.isEditing && this.hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Do you want to discard them?')) {
        this.discardChanges();
        this.isEditing = false;
      }
    } else {
      this.isEditing = !this.isEditing;
      if (this.isEditing) {
        this.editableContent = this.originalContent;
      }
    }
  }

  onContentChange(): void {
    this.hasUnsavedChanges = this.editableContent !== this.originalContent;
  }

  saveChanges(): void {
    this.originalContent = this.editableContent;
    this.hasUnsavedChanges = false;
    
    if (this.response) {
      this.response.content = this.editableContent;
      this.responseUpdated.emit(this.response);
    }
    
    this.showNotification('Changes saved successfully', 'success');
  }

  discardChanges(): void {
    this.editableContent = this.originalContent;
    this.hasUnsavedChanges = false;
  }

  regenerateResponse(): void {
    if (!this.hasUnsavedChanges) return;
    
    this.isRegenerating = true;
    
    this.aiService.regenerateResponse(this.editableContent).subscribe({
      next: (newResponse) => {
        this.response = newResponse;
        this.originalContent = newResponse.content;
        this.editableContent = newResponse.content;
        this.hasUnsavedChanges = false;
        this.isRegenerating = false;
        this.responseUpdated.emit(newResponse);
        this.showNotification('Response regenerated successfully', 'success');
      },
      error: (error) => {
        console.error('Error regenerating response:', error);
        this.isRegenerating = false;
        this.showNotification('Error regenerating response', 'error');
      }
    });
  }

  copyResponse(): void {
    if (!this.response) return;
    
    const contentToCopy = this.isEditing ? this.editableContent : this.response.content;
    
    this.aiService.copyToClipboard(contentToCopy).then(success => {
      if (success) {
        this.showNotification('Response copied to clipboard', 'success');
      } else {
        this.showNotification('Failed to copy response', 'error');
      }
    });
  }

  downloadResponse(): void {
    if (!this.response) return;
    
    const contentToDownload = this.isEditing ? this.editableContent : this.response.content;
    const filename = `ai-response-${new Date().toISOString().split('T')[0]}.txt`;
    
    this.aiService.downloadResponse(contentToDownload, filename);
    this.showNotification('Response downloaded', 'success');
  }

  formatTime(date: Date): string {
    return date.toLocaleString();
  }

  private showNotification(message: string, type: string): void {
    this.notification = { message, type };
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }
}