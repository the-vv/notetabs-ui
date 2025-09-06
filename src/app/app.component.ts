import { ChangeDetectionStrategy, Component, computed, effect, inject, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Note, NoteComponent } from './note/note';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToolbarComponent } from './toolbar.component';

@Component({
  selector: 'app-root',
  imports: [NoteComponent, DragDropModule, ToolbarComponent], // Import NoteComponent and DragDropModule
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="toolbar-container">
          <app-toolbar (insertTimestamp)="insertTimestamp()" (goToBottom)="goToBottom()" (deleteNote)="deleteActiveNote()" />
          <div class="auth-controls">
            @if (user(); as currentUser) {
              <button class="auth-button" (click)="logout()">Logout</button>
            } @else {
              <button class="auth-button" (click)="login()">Login</button>
            }
          </div>
        </div>
        <div class="tab-bar" cdkDropList cdkDropListOrientation="horizontal" (cdkDropListDropped)="onTabDrop($event)">
          @for (note of notes(); track note.id) {
            <button 
              class="tab-button" 
              [class.active]="note.id === activeNoteId()"
              (click)="selectNote(note.id)"
              cdkDrag
            >
              <span class="tab-text">{{ note.title || 'Untitled Note' }}</span>
              @if (notes().length > 1) {
                <span class="delete-tab-button" (click)="deleteNote(note.id, $event)">&times;</span>
              }
            </button>
          }
          <button class="add-tab-button" (click)="addNote()">+</button>
        </div>
      </header>
      <main class="main-content">
        @if (isLoading()) {
          <div class="loading-placeholder">
            <h2>Loading Notes...</h2>
          </div>
        } @else if (activeNote(); as note) {
          <app-note #noteComponent [note]="note" (noteChange)="onNoteChange($event)" />
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
      display: flex;
      flex-direction: column;
      padding: 0.5rem .5rem 0 .5rem;
      background-color: #1a1a1a; /* Darker header */
      border-bottom: 1px solid #2a2a2a;
    }
    .toolbar-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-bottom: 0.5rem;
    }
    .tab-bar {
      display: flex;
      align-items: center;
      overflow-x: auto;
    }
    .tab-bar::-webkit-scrollbar {
      height: 8px;
    }
    .tab-bar::-webkit-scrollbar-track {
      background: #1a1a1a;
    }
    .tab-bar::-webkit-scrollbar-thumb {
      background-color: #444;
      border-radius: 4px;
    }
    .tab-bar::-webkit-scrollbar-thumb:hover {
      background-color: #555;
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
      max-width: 200px; /* Set a max-width for the tabs */
    }
    .tab-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
      border-radius: 5px 5px 0 0;
    }
    .auth-controls {
      margin-left: 1rem;
    }
    .auth-button {
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
    .no-notes-placeholder, .loading-placeholder {
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
  @ViewChild('noteComponent') noteComponent?: NoteComponent;

  private platformId = inject(PLATFORM_ID);
  public authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
  
  user = toSignal(this.authService.user$);

  notes = signal<Note[]>([]);
  activeNoteId = signal<number | null>(null);
  isLoading = signal<boolean>(false);

  activeNote = computed(() => {
    const id = this.activeNoteId();
    return id === null ? null : this.notes().find(note => note.id === id) ?? null;
  });

  constructor() {
    // Initial data loading effect
    effect(() => {
        if (isPlatformBrowser(this.platformId)) {
            const currentUser = this.user();
            // Wait until user state is resolved
            if(currentUser === undefined) return;

            if (currentUser) {
                this.loadNotesFromFirestore(currentUser.uid);
            } else {
                this.loadNotesFromLocalStorage();
            }
        }
    }, { allowSignalWrites: true });

    // Data synchronization effect
    effect(() => {
        if (isPlatformBrowser(this.platformId)) {
            const currentUser = this.user();
            // Wait until user state is resolved
            if(currentUser === undefined) return;

            const currentNotes = this.notes();
            const currentActiveNoteId = this.activeNoteId();

            if (currentUser) {
                if(currentNotes.length > 0) { // only sync if there are notes
                    this.firestoreService.syncNotes(currentUser.uid, currentNotes);
                }
            } else {
                localStorage.setItem('notes', JSON.stringify(currentNotes));
                localStorage.setItem('activeNoteId', JSON.stringify(currentActiveNoteId));
            }
        }
    });
  }

  loadNotesFromLocalStorage() {
    this.isLoading.set(false);
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

  async loadNotesFromFirestore(userId: string) {
    this.isLoading.set(true);
    const notes = await this.firestoreService.getNotes(userId);
    if (notes.length > 0) {
      this.notes.set(notes);
      this.activeNoteId.set(notes[0].id);
    } else {
      this.addNote();
    }
    this.isLoading.set(false);
  }

  async login() {
    const userCredential = await this.authService.login();
    const user = userCredential.user;
    const localNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    if (localNotes.length > 0) {
        // Sync local notes to Firestore
        await this.firestoreService.syncNotes(user.uid, localNotes);
    }
    // The effect will handle loading notes from firestore
  }

  logout() {
    this.authService.logout();
    // The effect will handle loading notes from local storage
  }

  addNote(): void {
    const newNote: Note = {
      id: Date.now(),
      title: 'Untitled Note',
      content: '',
    };
    this.notes.update(notes => [...notes, newNote]);
    this.activeNoteId.set(newNote.id);
    const currentUser = this.user();
    if (currentUser) {
      this.firestoreService.addNote(currentUser.uid, newNote);
    }
  }

  selectNote(id: number): void {
    this.activeNoteId.set(id);
  }

  deleteNote(id: number, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
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
            if (noteIndex >= updatedNotes.length) {
                newActiveId = updatedNotes[updatedNotes.length - 1].id;
            } else {
                newActiveId = updatedNotes[noteIndex].id;
            }
        }
        this.activeNoteId.set(newActiveId);
    }

    this.notes.set(updatedNotes);
    const currentUser = this.user();
    if (currentUser) {
      this.firestoreService.deleteNote(currentUser.uid, id);
    }
  }

  deleteActiveNote(): void {
    const activeNoteId = this.activeNoteId();
    if (activeNoteId !== null) {
      this.deleteNote(activeNoteId);
    }
  }

  onNoteChange(updatedNote: Note): void {
    this.notes.update(notes => 
      notes.map(note => (note.id === updatedNote.id ? updatedNote : note))
    );
    const currentUser = this.user();
    if (currentUser) {
      this.firestoreService.updateNote(currentUser.uid, updatedNote);
    }
  }

  onTabDrop(event: CdkDragDrop<Note[]>): void {
    const newNotes = [...this.notes()];
    moveItemInArray(newNotes, event.previousIndex, event.currentIndex);
    this.notes.set(newNotes);
  }

  insertTimestamp(): void {
    const activeNote = this.activeNote();
    if (activeNote) {
      const timestamp = new Date().toLocaleString();
      const updatedNote: Note = { 
        ...activeNote, 
        content: activeNote.content + '\n' + timestamp 
      };
      this.onNoteChange(updatedNote);
    }
  }

  goToBottom(): void {
    setTimeout(() => this.noteComponent?.scrollToBottom(), 0);
  }
}
