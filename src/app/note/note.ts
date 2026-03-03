import { ChangeDetectionStrategy, Component, ElementRef, input, output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Define the shape of a note
export interface Note {
  id: number;
  title: string;
  content: string;
}

@Component({
  selector: 'app-note',
  imports: [FormsModule], // Import FormsModule for ngModel
  template: `
    <div class="note-container">
      <textarea #textarea
        placeholder="Your note..."
        class="note-content-textarea"
        [ngModel]="note().content"
        (ngModelChange)="updateContent($event)"
      ></textarea>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .note-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .note-content-textarea {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      background-color: #1a1a1a;
      color: #f1f1f1;
      border: none;
      padding: 1rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 1rem;
      line-height: 1.5;
      resize: none;
      overflow-y: auto; /* Ensure vertical scrolling */
    }
    .note-content-textarea:focus {
      outline: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteComponent {
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;
  // Use input() for the note data. It's required.
  note = input.required<Note>();

  // Use output() to emit changes to the note
  noteChange = output<Note>();

  // Method to update the content and derive the title
  updateContent(newContent: string): void {
    const firstLine = newContent.split('\n')[0];
    const newTitle = firstLine.substring(0, 30) || 'Untitled Note';
    this.noteChange.emit({ ...this.note(), title: newTitle, content: newContent });
  }

  scrollToBottom(): void {
    if (this.textarea) {
      this.textarea.nativeElement.scrollTop = this.textarea.nativeElement.scrollHeight;
    }
  }

  scrollToBottomAndMoveCursor(): void {
    if (this.textarea) {
      const element = this.textarea.nativeElement;
      element.scrollTop = element.scrollHeight;
      // Move cursor to the end
      const length = element.value.length;
      element.setSelectionRange(length, length);
      element.focus();
    }
  }

  insertTimestampAtCursor(): void {
    if (this.textarea) {
      const element = this.textarea.nativeElement;
      const timestamp = new Date().toLocaleString();
      const start = element.selectionStart;
      const end = element.selectionEnd;
      const currentContent = this.note().content;
      const newContent = currentContent.substring(0, start) + timestamp + currentContent.substring(end);
      
      // Update the content
      const firstLine = newContent.split('\n')[0];
      const newTitle = firstLine.substring(0, 30) || 'Untitled Note';
      this.noteChange.emit({ ...this.note(), title: newTitle, content: newContent });
      
      // Set cursor position after the timestamp
      setTimeout(() => {
        const newCursorPos = start + timestamp.length;
        element.setSelectionRange(newCursorPos, newCursorPos);
        element.focus();
      }, 0);
    }
  }
}
