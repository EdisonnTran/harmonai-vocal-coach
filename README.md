# Vocal Coach

This repository contains the frontend application for a Vocal Coach platform, designed to help users analyze and improve their vocal performance. The application allows users to record their voice, analyze pitch, and provides feedback, potentially through a pitch-matching game.

## Features

- **Voice Recording**: Record audio directly within the application.
- **Pitch Analysis**: Analyze recorded audio for pitch accuracy and vocal patterns.
- **Pitch Game**: (Potentially) An interactive game to practice and improve pitch.
- **Results Page**: View detailed analysis and feedback on vocal performance.
- **Audio Upload**: Upload existing audio files for analysis.

## Technologies Used

### Frontend (Web App)

- Vue.js (as indicated by `.vue` files)
- Vite (for development server and build, indicated by `vite.config.js`)
- JavaScript/ES Modules
- `multer` (on the server-side for file uploads)
- `express` (on the server-side for the API)
- `cors` (on the server-side)

### Backend (Server)

- Node.js
- Express.js
- TypeScript (as indicated by `.ts` files)
- `multer` (for handling file uploads)

## Project Structure

- `apps/server/`: Contains the backend API developed with Node.js and Express.
  - `src/controllers/`: Logic for handling API requests.
  - `src/middleware/`: Express middleware.
  - `src/routes/`: API routes (e.g., `/analyze`).
  - `src/services/`: Business logic and data processing.
- `apps/server/`: Contains the backend API developed with Node.js and Express.
  - `src/controllers/`: Logic for handling API requests.
  - `src/middleware/`: Express middleware.
  - `src/routes/`: API routes (e.g., `/analyze`).
  - `src/services/`: Business logic and data processing.
  - `src/types/`: TypeScript type definitions.
- `apps/web-app/`: Contains the Vue.js frontend application.
  - `public/`: Static assets.
  - `src/components/`: Reusable Vue components.
  - `src/pages/`: Vue components for different application views (e.g., Record, PitchGame, ResultsPage).
  - `src/router/`: Vue Router configuration.
  - `src/utils/`: Utility functions (e.g., `UploadAudio.js`).
- `uploads/`: Directory for storing uploaded audio files.
- `package.json`: Defines project metadata and dependencies for the monorepo root.
- `vite.config.js`: Configuration for Vite, used by the frontend.
- `tsconfig.json`: TypeScript configuration.
- `jsconfig.json`: JavaScript language service configuration.

## Setup and Installation

To get this project up and running on your local machine, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/vocal-coach-frontend.git
    cd vocal-coach-frontend
    ```

2.  **Install dependencies:**
    This project uses a monorepo structure. Install dependencies at the root level.

    ```bash
    npm install
    ```

3.  **Start the development servers:**
    From the root directory, run the following command to start both the backend server and the frontend application in development mode.

    ```bash
    npm run dev
    ```

    The backend server should start on `http://localhost:8080` (or the port specified in `apps/server/src/index.ts`).
    The frontend application should now be running, typically on `http://localhost:5173` (or another port as configured by Vite).

## Usage

- Open your web browser and navigate to the address where the frontend is running (e.g., `http://localhost:5173`).
- Use the "Record" page to capture your voice.
- Explore other features like the "Pitch Game" or "Results Page" as they become available.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
