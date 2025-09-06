# Notepad Application

## Overview

A simple and intuitive notepad application that allows you to create, edit, and manage multiple notes. The application uses a tabbed interface to switch between notes and provides both offline and cloud-based storage options.

## Implemented Features

- **Tabbed Interface**: Manage multiple notes in a tabbed layout.
- **Add and Delete Notes**: Easily create new notes and delete unwanted ones.
- **Active Note Display**: The selected note is displayed in the main content area.
- **Optional Firebase Login**: Users can choose to log in with their Google account to sync their notes across devices.
- **Local Storage**: When not logged in, notes are saved to the browser's local storage.
- **Firestore Integration**: When logged in, notes are saved to a Firestore database.
- **Automatic Data Sync**: When a user logs in, any notes created while offline are automatically synced to their Firestore account.
- **Component-Based Architecture**: The application is structured with a main `app` component and a reusable `note` component.
- **Signal-Based State Management**: The application uses Angular signals for efficient and reactive state management.
- **Modern Styling**: The application has a clean and modern user interface.
- **Draggable Tabs**: Reorder tabs using drag-and-drop functionality.
- **Confirmation on Delete**: A confirmation dialog is shown before deleting a note.
- **Animations**: Subtle animations are used to enhance the user experience.
- **Automatic Titling**: Note titles are automatically generated from the content.
- **Minimalist UI**: The UI has been streamlined for a more focused writing experience.
- **Dark Theme**: The application uses a dark theme for a modern look.

## Bug Fixes

- **Tab Close Functionality**: Resolved a persistent bug where closing a tab would cause a race condition, leading to unpredictable active tab behavior. The state update logic is now robust and ensures the correct tab is selected after a deletion.
- **Invalid Firebase Domain**: Corrected the Firebase configuration to use the correct `authDomain`, resolving the login button issue.

## Project Setup

- **Firebase Project**: Created a new Firebase project with the ID `notetabs-vv`.
- **Firestore**: Configured Firestore for the project.
- **Web App**: Created a web app to obtain the correct Firebase SDK configuration.
