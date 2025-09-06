# Notepad Application

## Overview

A simple and intuitive notepad application that allows you to create, edit, and manage multiple notes. The application uses a tabbed interface to switch between notes and automatically saves your work to local storage.

## Implemented Features

- **Tabbed Interface**: Manage multiple notes in a tabbed layout.
- **Add and Delete Notes**: Easily create new notes and delete unwanted ones.
- **Active Note Display**: The selected note is displayed in the main content area.
- **Local Storage**: Notes and the active tab are saved to local storage.
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

