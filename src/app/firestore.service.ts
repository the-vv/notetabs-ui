import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDocs, writeBatch, query, where, deleteDoc, updateDoc, setDoc } from '@angular/fire/firestore';
import { Note } from './note/note';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore: Firestore = inject(Firestore);

  async getNotes(userId: string): Promise<Note[]> {
    const notesCollection = collection(this.firestore, `users/${userId}/notes`);
    const q = query(notesCollection);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Note);
  }

  async syncNotes(userId: string, notes: Note[]): Promise<void> {
    const batch = writeBatch(this.firestore);
    const notesCollection = collection(this.firestore, `users/${userId}/notes`);

    for (const note of notes) {
      const noteRef = doc(notesCollection, note.id.toString());
      batch.set(noteRef, note);
    }

    return batch.commit();
  }

  async addNote(userId: string, note: Note): Promise<void> {
    const noteRef = doc(collection(this.firestore, `users/${userId}/notes`), note.id.toString());
    return setDoc(noteRef, note);
  }

  async updateNote(userId: string, note: Note): Promise<void> {
    const noteRef = doc(collection(this.firestore, `users/${userId}/notes`), note.id.toString());
    return updateDoc(noteRef, { ...note });
  }

  async deleteNote(userId: string, noteId: number): Promise<void> {
    const noteRef = doc(collection(this.firestore, `users/${userId}/notes`), noteId.toString());
    return deleteDoc(noteRef);
  }
}
