# ISTQB Assistant Frontend

This project is a frontend application for the ISTQB Assistant, designed to help users manage and learn about ISTQB certifications. The app is built with React and TypeScript, and features:

- User authentication and registration
- Chat interface for certification questions
- Certification management and details
- Admin panel for advanced users
- Persistent conversation history
- English-only UI and messages

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd istqb-assistant-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the App
Start the development server:
```bash
npm run dev
# or
yarn dev
```
The app will be available at `http://localhost:5173` by default.

## Project Structure
- `src/components/` — Reusable UI components (ChatInput, ChatHeader, etc.)
- `src/pages/` — Main pages (ChatPage, AuthPage, AdminPage, etc.)
- `src/contexts/` — React context providers (AuthContext, etc.)
- `src/services/` — API service layer
- `src/types/` — TypeScript type definitions
- `public/` — Static assets

## Environment Variables
Create a `.env` file for custom environment variables if needed (e.g., API endpoints).

## Customization
- All UI strings and messages are in English.
- To change branding, update the logo and titles in `ChatHeader.tsx` and `index.html`.

## License
MIT

---
For questions or support, contact the project maintainer.
