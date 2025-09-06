import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  template: `
      <button class="toolbar-button" (click)="insertTimestamp.emit()">Insert Timestamp</button>
      <button class="toolbar-button" (click)="goToBottom.emit()">Go to Bottom</button>
      <button class="toolbar-button" (click)="deleteNote.emit()">Delete Note</button>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .toolbar-button {
      background-color: #3c3c3c;
      color: #f1f1f1;
      border: 1px solid #555;
      border-radius: 4px;
      padding: 0.4rem 0.6rem;
      font-size: 0.8rem;
      cursor: pointer;
      transition: background-color 0.2s ease-in-out;
    }
    .toolbar-button:hover {
      background-color: #4a4a4a;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  insertTimestamp = output<void>();
  goToBottom = output<void>();
  deleteNote = output<void>();
}
