# CodeKumbh Tech Stack

## Frontend

The frontend is built as a Single Page Application (SPA) using React and Vite.

### Core Libraries & Frameworks
- **React** (`^19.2.0`): A JavaScript library for building user interfaces.
- **Vite** (`^7.3.1`): Next Generation Frontend Tooling for fast development and building.

### Styling & UI
- **Tailwind CSS** (`^4.2.1`): A utility-first CSS framework for rapid UI development.
- **Framer Motion** (`^12.35.2`): A production-ready motion library for React animations.
- **Lucide React** (`^0.577.0`): Beautiful & consistent SVG icons.

### State Management & Routing
- **Zustand** (`^5.0.11`): A small, fast, and scalable bearbones state-management solution for React.
- **React Router DOM** (`^7.13.1`): Declarative routing for React web applications.

### API & Real-time Communication
- **Axios** (`^1.13.6`): Promise based HTTP client for the browser and node.js.
- **Firebase** (`^12.10.0`): Used for backend services (Auth/Firestore) from the client side.
- **Socket.IO Client** (`^4.8.3`): Used for real-time bidirectional event-based communication.

---

## Backend

The backend provides a REST API with WebSocket support for real-time features, built using Python and Flask.

### Core Framework
- **Flask** (`3.0.2`): A lightweight WSGI web application framework.
- **Werkzeug** (`3.0.1`): A comprehensive WSGI web application library.

### Real-time Communication
- **Flask-SocketIO** (`5.3.6`): Gives Flask applications access to low latency bi-directional communications between the clients and the server.

### Security & Integrations
- **Flask-Cors** (`4.0.0`): A Flask extension for handling Cross Origin Resource Sharing (CORS), making cross-origin AJAX possible.
- **Firebase Admin SDK** (`6.5.0`): Firebase admin SDK for managing Auth and Firestore DB securely from the server.
- **Python-dotenv** (`1.0.1`): Reads key-value pairs from a `.env` file and sets them as environment variables.
