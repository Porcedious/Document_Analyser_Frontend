import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface UploadRequest {
  file: File;
  prompt?: string;
}

export interface AIResponse {
  id: string;
  content: string;
  timestamp: Date;
  status: 'processing' | 'completed' | 'error';
}

export interface ChatMessage {
  id: string;
  message: string;
  response?: string;
  timestamp: Date;
  isUser: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private apiUrl = 'https://api.example.com'; // Replace with your actual API URL
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private responseSubject = new BehaviorSubject<AIResponse | null>(null);

  public loading$ = this.loadingSubject.asObservable();
  public response$ = this.responseSubject.asObservable();

  constructor(private http: HttpClient) {}

  uploadDocument(request: UploadRequest): Observable<any> {
    const formData = new FormData();
    formData.append('file', request.file);
    if (request.prompt) {
      formData.append('prompt', request.prompt);
    }

    this.loadingSubject.next(true);

    // Simulate API call - replace with actual endpoint
    return new Observable(observer => {
      setTimeout(() => {
        const mockResponse: AIResponse = {
          id: Date.now().toString(),
          content: `AI Analysis of ${request.file.name}:\n\nThis is a simulated AI response based on your uploaded document. The content has been processed and analyzed according to your prompt: "${request.prompt || 'No specific prompt provided'}".\n\nKey insights:\n• Document type: ${request.file.type}\n• File size: ${(request.file.size / 1024).toFixed(2)} KB\n• Processing completed successfully\n\nYou can now edit this response, copy it, or download it as needed.`,
          timestamp: new Date(),
          status: 'completed'
        };
        
        this.responseSubject.next(mockResponse);
        this.loadingSubject.next(false);
        observer.next(mockResponse);
        observer.complete();
      }, 3000); // Simulate 3 second processing time
    });
  }

  sendChatMessage(message: string): Observable<string> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    // Simulate chat API call
    return new Observable(observer => {
      setTimeout(() => {
        const responses = [
          "I understand your question. Let me provide more details about that aspect of the document.",
          "Based on the document analysis, here's what I can tell you about that topic.",
          "That's an interesting point. The document suggests several approaches to this.",
          "Let me elaborate on that section of the document for you.",
          "Here's additional context from the document that might help clarify your question."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        observer.next(randomResponse);
        observer.complete();
      }, 1500);
    });
  }

  regenerateResponse(editedContent: string): Observable<AIResponse> {
    this.loadingSubject.next(true);

    return new Observable(observer => {
      setTimeout(() => {
        const regeneratedResponse: AIResponse = {
          id: Date.now().toString(),
          content: `Regenerated Response:\n\n${editedContent}\n\n[Additional AI processing based on your edits]\n\nThis response has been enhanced and refined based on your modifications. The AI has incorporated your changes and provided additional context where relevant.`,
          timestamp: new Date(),
          status: 'completed'
        };
        
        this.responseSubject.next(regeneratedResponse);
        this.loadingSubject.next(false);
        observer.next(regeneratedResponse);
        observer.complete();
      }, 2000);
    });
  }

  downloadResponse(content: string, filename: string = 'ai-response.txt'): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  copyToClipboard(content: string): Promise<boolean> {
    try {
      return navigator.clipboard.writeText(content).then(() => true);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve(successful);
    }
  }
}