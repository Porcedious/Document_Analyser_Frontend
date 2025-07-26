import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIService, ChatMessage } from '../../services/ai.service';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-panel">
      <div class="chat-header">
        <h3>Chat with AI</h3>
        <p>Ask questions about your document</p>
      </div>
      
      <div class="chat-messages" #messagesContainer>
        <div *ngFor="let message of chatMessages" 
             class="message" 
             [class.user-message]="message.isUser"
             [class.ai-message]="!message.isUser">
          <div class="message-content">
            <p>{{ message.message }}</p>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
        </div>
        
        <div *ngIf="isTyping" class="message ai-message typing">
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chat-input">
        <div class="input-group">
          <input type="text" 
                 [(ngModel)]="currentMessage"
                 (keydown.enter)="sendMessage()"
                 placeholder="Ask a question about your document..."
                 [disabled]="isTyping">
          <button class="send-btn" 
                  (click)="sendMessage()"
                  [disabled]="!currentMessage.trim() || isTyping">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22,2 15,22 11,13 2,9"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./chat-panel.component.css']
})
export class ChatPanelComponent {
  @Input() documentId: string = '';
  
  chatMessages: ChatMessage[] = [];
  currentMessage: string = '';
  isTyping: boolean = false;

  constructor(private aiService: AIService) {
    // Add welcome message
    this.chatMessages.push({
      id: '1',
      message: 'Hello! I\'m ready to answer questions about your uploaded document. What would you like to know?',
      timestamp: new Date(),
      isUser: false
    });
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isTyping) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: this.currentMessage,
      timestamp: new Date(),
      isUser: true
    };
    
    this.chatMessages.push(userMessage);
    const messageToSend = this.currentMessage;
    this.currentMessage = '';
    this.isTyping = true;

    // Scroll to bottom
    setTimeout(() => this.scrollToBottom(), 100);

    // Send to AI service
    this.aiService.sendChatMessage(messageToSend).subscribe({
      next: (response) => {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: response,
          timestamp: new Date(),
          isUser: false
        };
        
        this.chatMessages.push(aiMessage);
        this.isTyping = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isTyping = false;
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
          isUser: false
        };
        
        this.chatMessages.push(errorMessage);
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    const container = document.querySelector('.chat-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}