
import { ChangeDetectionStrategy, Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Note, NoteComponent } from './note/note';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-root',
  imports: [NoteComponent, DragDropModule], // Import NoteComponent and DragDropModule
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="tab-bar" cdkDropList cdkDropListOrientation="horizontal" (cdkDropListDropped)="onTabDrop($event)">
          @for (note of notes(); track note.id) {
            <button 
              class="tab-button" 
              [class.active]="note.id === activeNoteId()"
              (click)="selectNote(note.id)"
              cdkDrag
            >
              {{ note.title || 'Untitled Note' }}
              @if (notes().length > 1) {
                <span class="delete-tab-button" (click)="deleteNote(note.id, $event)">&times;</span>
              }
            </button>
          }
          <button class="add-tab-button" (click)="addNote()">+</button>
        </div>
      </header>
      <main class="main-content">
        @if (activeNote(); as note) {
          <app-note [note]="note" (noteChange)="onNoteChange($event)" />
        } @else {
          <div class="no-notes-placeholder">
            <h2>No open notes</h2>
            <p>Click the '+' button to create a new note.</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #121212; /* Darker background */
      color: #d4d4d4;
    }
    .app-header {
      padding: 0.5rem;
      background-color: #1a1a1a; /* Darker header */
      border-bottom: 1px solid #2a2a2a;
    }
    .tab-bar {
      display: flex;
      align-items: center;
      overflow-x: auto;
    }
    .tab-button {
      padding: 0.5rem 1rem;
      border: none;
      background-color: #2a2a2a; /* Darker tab */
      color: #ccc;
      cursor: pointer;
      margin-right: 5px;
      border-radius: 5px 5px 0 0;
      display: flex;
      align-items: center;
      transition: background-color 0.2s;
    }
    .tab-button.active {
      background-color: #121212; /* Active tab matches background */
      color: #fff;
    }
    .delete-tab-button {
      margin-left: 0.5rem;
      cursor: pointer;
      font-weight: bold;
    }
    .add-tab-button {
      padding: 0.5rem 1rem;
      border: none;
      background-color: #2a2a2a;
      color: #ccc;
      cursor: pointer;
      border-radius: 5px;
    }
    .main-content {
      flex-grow: 1;
    }
    .no-notes-placeholder {
      text-align: center;
      margin-top: 2rem;
    }
    /* Drag and Drop styles */
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }
    .cdk-drag-placeholder {
      opacity: 0;
    }
    .cdk-drop-list-dragging .cdk-drag {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private platformId = inject(PLATFORM_ID);

  notes = signal<Note[]>([]);
  activeNoteId = signal<number | null>(null);

  activeNote = computed(() => {
    const id = this.activeNoteId();
    return id === null ? null : this.notes().find(note => note.id === id) ?? null;
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedNotes = localStorage.getItem('notes');
      if (savedNotes) {
        this.notes.set(JSON.parse(savedNotes));
        const savedActiveId = localStorage.getItem('activeNoteId');
        if (savedActiveId) {
          this.activeNoteId.set(JSON.parse(savedActiveId));
        }
      } else {
        this.addNote();
      }
    }

    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('notes', JSON.stringify(this.notes()));
        localStorage.setItem('activeNoteId', JSON.stringify(this.activeNoteId()));
      }
    });
  }

  addNote(): void {
    const newNote: Note = {
      id: Date.now(),
      title: 'Untitled Note',
      content: '',
    };
    this.notes.update(notes => [...notes, newNote]);
    this.activeNoteId.set(newNote.id);
  }

  selectNote(id: number): void {
    this.activeNoteId.set(id);
  }

  deleteNote(id: number, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }

    const currentNotes = this.notes();
    const noteIndex = currentNotes.findIndex(note => note.id === id);

    if (noteIndex === -1) {
        return; // Note not found
    }

    const updatedNotes = currentNotes.filter(note => note.id !== id);

    if (this.activeNoteId() === id) {
        let newActiveId: number | null = null;
        if (updatedNotes.length > 0) {
            // If the deleted note was the last in the list, select the new last note
            if (noteIndex >= updatedNotes.length) {
                newActiveId = updatedNotes[updatedNotes.length - 1].id;
            } else {
                // Otherwise, select the note that took the deleted note's place
                newActiveId = updatedNotes[noteIndex].id;
            }
        }
        this.activeNoteId.set(newActiveId);
    }

    this.notes.set(updatedNotes);
  }

  onNoteChange(updatedNote: Note): void {
    this.notes.update(notes => 
      notes.map(note => (note.id === updatedNote.id ? updatedNote : note))
    );
  }

  onTabDrop(event: CdkDragDrop<Note[]>): void {
    const newNotes = [...this.notes()];
    moveItemInArray(newNotes, event.previousIndex, event.currentIndex);
    this.notes.set(newNotes);
  }
}
