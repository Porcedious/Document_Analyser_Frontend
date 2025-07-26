import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FileUploadData {
  file: File;
  prompt: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="upload-container" [class.drag-over]="isDragOver">
      <div class="upload-area" 
           (click)="fileInput.click()"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)">
        
        <div class="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
        </div>
        
        <h3>Upload Your Document</h3>
        <p>Drop your PDF or DOC file here, or click to browse</p>
        
        <div class="file-types">
          <span class="file-type">PDF</span>
          <span class="file-type">DOC</span>
          <span class="file-type">DOCX</span>
        </div>
        
        <input #fileInput 
               type="file" 
               accept=".pdf,.doc,.docx"
               (change)="onFileSelected($event)"
               style="display: none;">
      </div>
      
      <div class="selected-file" *ngIf="selectedFile">
        <div class="file-info">
          <div class="file-icon">📄</div>
          <div class="file-details">
            <div class="file-name">{{ selectedFile.name }}</div>
            <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
          </div>
          <button class="remove-file" (click)="removeFile()">×</button>
        </div>
      </div>
      
      <div class="prompt-section">
        <label for="prompt">Additional Instructions (Optional)</label>
        <textarea id="prompt" 
                  [(ngModel)]="prompt"
                  placeholder="Provide any specific instructions for AI analysis..."
                  rows="3"></textarea>
      </div>
      
      <div class="upload-actions">
        <button class="btn btn-primary" 
                [disabled]="!selectedFile || isUploading"
                (click)="startUpload()">
          <span *ngIf="!isUploading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Process Document
          </span>
          <span *ngIf="isUploading" class="loading-text">
            <div class="spinner"></div>
            Processing...
          </span>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  @Output() fileUploaded = new EventEmitter<FileUploadData>();
  
  selectedFile: File | null = null;
  prompt: string = '';
  isDragOver: boolean = false;
  isUploading: boolean = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.handleFile(target.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (this.isValidFile(file)) {
      this.selectedFile = file;
    } else {
      alert('Please select a valid PDF, DOC, or DOCX file.');
    }
  }

  private isValidFile(file: File): boolean {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  startUpload(): void {
    if (this.selectedFile) {
      this.isUploading = true;
      this.fileUploaded.emit({
        file: this.selectedFile,
        prompt: this.prompt
      });
    }
  }
}