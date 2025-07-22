# Secure Homomorphic Communication System

A demonstration of Fully Homomorphic Encryption (FHE) concepts through a dual-server communication system that processes encrypted data without decryption.

## Features

- Real-time encrypted communication between servers
- Visual demonstration of FHE concepts
- Interactive dashboard for monitoring
- Simulated FHE operations with AES-256-CBC
- WebSocket-based real-time updates

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+
- Git (for cloning the repository)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SecureHomomorphic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
  ```bash
   npm install --save-dev cross-env
  ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following content:
   ```env
   DATABASE_URL="postgres://username:password@localhost:5432/secure_homomorphic"
   SESSION_SECRET="your-secret-key-here"
   ```
   Replace the database credentials with your PostgreSQL username and password.

4. **Set up the database**
   - Create a new PostgreSQL database named `secure_homomorphic`
   - Run database migrations:
     ```bash
     npx drizzle-kit push
     ```

## Running the Application

### Development Mode

1. **Start the development server**
   ```bash
   npm run dev
   ```
   This will start both the backend and frontend in development mode with hot-reloading.

2. **Access the application**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── pages/         # Page components
│   └── index.html         # HTML template
├── server/                # Backend server
│   ├── services/          # Business logic
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data access layer
├── shared/                # Shared code between frontend and backend
│   └── schema.ts          # TypeScript types and schemas
├── .env                  # Environment variables
└── package.json          # Project configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Apply database migrations

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if the database exists and is accessible

### Dependency Issues
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Port Conflicts
- Check if port 3000 is available
- Update the port in `server/index.ts` if needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with TypeScript, React, Express, and PostgreSQL
- Uses Drizzle ORM for database operations
- Styled with Tailwind CSS and shadcn/ui
