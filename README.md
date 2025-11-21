# PetJio - Pet Care App

## Project Code

This directory contains the complete source code for **PetJio**, a
simple and clean pet management application.

### Key Files

-   **App.js** -- Main entry point containing navigation, screens, and
    core logic.
-   **package.json** -- Project dependencies and scripts.

------------------------------------------------------------------------

## 🚀 Steps to Run the App on Android

### **Prerequisites**

-   Install **Node.js**
-   Install **Expo CLI** (automatically used via `npx expo`)

### **1. Install Dependencies**

``` sh
npm install
```

### **2. Start the Expo Server**

``` sh
npx expo start
```

### **3. Run on Android**

-   **Physical Device:**\
    Install **Expo Go** from Play Store → Scan QR from terminal.
-   **Android Emulator:**\
    Press `a` in the terminal to launch the app in an emulator.

------------------------------------------------------------------------

## 📁 Approach & Folder Structure

### **Approach**

-   **Architecture:** React Native + Expo\
-   **State Management:** React Hooks (`useState`, `useEffect`)\
-   **Persistence:** `@react-native-async-storage/async-storage`\
-   **Navigation:** `@react-navigation/native-stack`\
-   **UI/UX:**
    -   Functional components
    -   Clean styling with `StyleSheet`
    -   Floating Action Button (FAB)
    -   Android-specific safe area padding

------------------------------------------------------------------------

## 📂 Folder Structure

    PetJio/
    │
    ├── App.js                 # Entire app logic & navigation
    ├── package.json           # Dependencies
    ├── assets/                # Icons, splash screens

### **Screens in App.js**

-   **PetListScreen** -- Displays all pets
-   **AddPetScreen** -- Form to add a new pet
-   **PetDetailsScreen** -- View pet details & mark favorites
-   **Navigation** -- Stack navigator setup

------------------------------------------------------------------------

## 🖼️ Screenshots (Placeholders)

### **Pet List Screen**

*Shows list of pets with FAB*

### **Add Pet Screen**

*Form with validation*

### **Pet Details Screen**

*Shows details + Favorite toggle*

------------------------------------------------------------------------
