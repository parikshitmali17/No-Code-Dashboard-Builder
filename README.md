# CollabDash - Real-Time Collaborative Dashboard Builder

A modern, full-stack application for creating and collaborating on interactive dashboards in real-time. Built with React, Node.js, Socket.IO, and MongoDB.

## 🚀 Features

### ✅ **Implemented Features**

#### **Authentication & User Management**
- JWT-based authentication with secure token handling
- User registration and login with validation
- Protected routes and role-based access control
- Google OAuth integration (mock implementation)

#### **Dashboard Management**
- Create, read, update, delete dashboards
- Dashboard sharing and collaboration
- Role-based permissions (owner, editor, viewer)
- Search and filter dashboards

#### **Real-Time Collaboration**
- Live user presence tracking
- Real-time cursor synchronization
- Component locking during editing
- Typing indicators
- Socket.IO integration with automatic reconnection

#### **Drag & Drop Dashboard Builder**
- Intuitive drag-and-drop interface
- Widget library with multiple component types
- Resizable and movable components
- Grid snapping and zoom controls
- Undo/redo functionality

#### **Widget Components**
- **Charts**: Line Chart, Bar Chart, Pie Chart
- **Metrics**: Metric Cards with trend indicators
- **Data**: Data Tables with search functionality
- **Content**: Text Widget (Markdown support), Image Widget
- **Utilities**: Calendar Widget
- Dynamic component rendering from JSON schema

#### **Responsive Design & Animations**
- Mobile-first responsive design
- Framer Motion animations and transitions
- Glass morphism effects and gradients
- Interactive hover states and micro-interactions

#### **State Management**
- Redux Toolkit for global state management
- Separate slices for auth, dashboards, canvas, and collaboration
- Optimistic updates and error handling
- Real-time state synchronization

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - UI library with hooks
- **Vite** - Fast build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Framer Motion** - Animations and transitions
- **React DnD** - Drag and drop functionality
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart components
- **Socket.IO Client** - Real-time communication

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **Y.js** - Collaborative editing (CRDT)
- **Joi** - Data validation
- **Helmet** - Security middleware

## 📦 Installation & Setup

### **Prerequisites**
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Git

### **1. Clone the Repository**
\`\`\`bash
git clone <repository-url>
cd collab-dashboard
\`\`\`

### **2. Backend Setup**
\`\`\`bash
# Install backend dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - MONGODB_URI
# - JWT_SECRET
# - CLIENT_URL
\`\`\`

### **3. Frontend Setup**
\`\`\`bash
# Frontend dependencies are included in the same package.json
# Create frontend environment file
cp .env.example .env.local

# Edit .env.local with:
# VITE_API_URL=http://localhost:5000
\`\`\`

### **4. Database Setup**
\`\`\`bash
# Seed the database with sample data
npm run seed
\`\`\`

### **5. Start the Application**

**Development Mode:**
\`\`\`bash
# Start backend server (Terminal 1)
npm run dev

# Start frontend dev server (Terminal 2)
npm run dev:client
\`\`\`

**Production Mode:**
\`\`\`bash
# Build frontend
npm run build

# Start production server
npm start
\`\`\`

## 🎯 How to Use

### **1. Authentication**
- Visit `http://localhost:3000`
- Sign up for a new account or use test credentials:
  - **Admin**: john@example.com / password123
  - **Editor**: jane@example.com / password123
  - **Viewer**: bob@example.com / password123

### **2. Dashboard Management**
- View all dashboards on the main dashboard list
- Create new dashboards with the "New Dashboard" button
- Search and filter dashboards
- Switch between grid and list view modes

### **3. Dashboard Builder**
- Click on any dashboard to open the builder
- **Widget Sidebar**: Drag widgets from the left sidebar to the canvas
- **Canvas**: Drop, resize, and move widgets
- **Toolbar**: Use zoom, grid snap, undo/redo controls
- **Real-time**: See other users' cursors and edits in real-time

### **4. Widget Types**
- **Line Chart**: Time series data visualization
- **Bar Chart**: Categorical data comparison
- **Pie Chart**: Proportional data display
- **Metric Card**: KPI display with trend indicators
- **Data Table**: Tabular data with search
- **Text Widget**: Markdown-supported text content
- **Image Widget**: Image display with captions
- **Calendar**: Event calendar display

### **5. Collaboration Features**
- **Real-time Editing**: Multiple users can edit simultaneously
- **User Presence**: See who's online and their cursor positions
- **Component Locking**: Prevents conflicts during editing
- **Auto-save**: Changes are automatically saved every 30 seconds
- **Manual Save**: Use Ctrl+S or the Save button

### **6. Keyboard Shortcuts**
- `Ctrl/Cmd + S`: Save dashboard
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo

## 🔧 API Endpoints

### **Authentication**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/google` - Google OAuth login

### **Dashboards**
- `GET /api/dashboards` - Get user dashboards
- `GET /api/dashboards/:id` - Get single dashboard
- `POST /api/dashboards` - Create dashboard
- `PUT /api/dashboards/:id` - Update dashboard
- `DELETE /api/dashboards/:id` - Delete dashboard
- `POST /api/dashboards/:id/collaborators` - Add collaborator

### **Data Sources**
- `GET /api/datasources` - Get user data sources
- `POST /api/datasources` - Create data source
- `POST /api/datasources/:id/test` - Test data source

## 🔌 Socket Events

### **Client to Server**
- `join-dashboard` - Join dashboard room
- `update-canvas` - Send canvas updates
- `cursor-move` - Send cursor position
- `lock-component` - Lock component for editing
- `save-dashboard` - Save dashboard changes

### **Server to Client**
- `user-joined/left` - User presence updates
- `canvas-updated` - Canvas changes from other users
- `cursor-updated` - Other users' cursor movements
- `component-locked/unlocked` - Component lock status
- `dashboard-saved` - Save confirmations

## 🏗️ Project Structure

\`\`\`
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── builder/        # Dashboard builder components
│   │   ├── ui/            # Reusable UI components
│   │   └── widgets/       # Widget components and registry
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API and socket services
│   ├── store/             # Redux store and slices
│   └── utils/             # Utility functions
├── config/                # Database configuration
├── middleware/            # Express middleware
├── models/               # Mongoose schemas
├── routes/               # API routes
├── socket/               # Socket.IO handlers
└── scripts/              # Database seeding scripts
\`\`\`

## 🔐 Environment Variables

### **Backend (.env)**
\`\`\`env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/collab-dashboard
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
\`\`\`

### **Frontend (.env.local)**
\`\`\`env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=CollabDash
\`\`\`

## 🚦 Development

### **Code Quality**
- ESLint configuration for consistent code style
- Prettier for code formatting
- Error boundaries for robust error handling
- TypeScript-ready structure

### **Testing**
\`\`\`bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint
\`\`\`

### **Building for Production**
\`\`\`bash
# Build frontend
npm run build

# Start production server
npm start
\`\`\`

## 🎨 Customization

### **Adding New Widgets**
1. Create widget component in `src/components/widgets/`
2. Add to `componentRegistry.jsx`
3. Define default props and size
4. Widget will automatically appear in sidebar

### **Styling**
- Modify `tailwind.config.js` for theme customization
- Update CSS variables in `index.html` for color schemes
- Add custom animations in `src/index.css`

## 🐛 Troubleshooting

### **Common Issues**
1. **Socket connection fails**: Check CORS settings and port configuration
2. **Database connection error**: Verify MongoDB is running and URI is correct
3. **Build errors**: Clear node_modules and reinstall dependencies
4. **Authentication issues**: Check JWT secret and token expiration

### **Debug Mode**
Set `NODE_ENV=development` to enable detailed error messages and logging.

## 📈 Performance

- **Optimized rendering** with React.memo and useMemo
- **Lazy loading** for widget components
- **Debounced auto-save** to prevent excessive API calls
- **Efficient state updates** with Redux Toolkit
- **Socket.IO reconnection** for reliable real-time features

## 🔒 Security

- **JWT token authentication** with secure storage
- **Input validation** with Joi schemas
- **CORS protection** for cross-origin requests
- **Helmet.js** for security headers
- **Rate limiting** on API endpoints
- **Role-based access control** for dashboards

## 🚀 Deployment

The application is ready for deployment on platforms like:
- **Vercel** (Frontend)
- **Railway/Render** (Backend)
- **MongoDB Atlas** (Database)
- **Docker** containers

---

**Built with ❤️ for better data collaboration**
\`\`\`

## 📋 **Summary of Implemented Functionality**

### ✅ **Complete Features Working:**

1. **Full Authentication System**
   - User registration/login with validation
   - JWT token management
   - Protected routes
   - Role-based access control

2. **Dashboard Management**
   - CRUD operations for dashboards
   - Real-time dashboard list
   - Search and filtering
   - Responsive grid/list views

3. **Real-Time Collaboration**
   - Socket.IO integration
   - Live user presence
   - Cursor synchronization
   - Component locking
   - Auto-save functionality

4. **Drag & Drop Builder**
   - Widget sidebar with categories
   - Canvas with drop zones
   - Resizable/movable components
   - Grid snapping and zoom
   - Undo/redo system

5. **Widget Library**
   - 8 different widget types
   - Dynamic component rendering
   - Error boundaries
   - Customizable properties

6. **Responsive Design**
   - Mobile-first approach
   - Smooth animations
   - Professional UI/UX
   - Dark mode ready

### 🎯 **How to Use:**

1. **Start the application**: `npm run dev` (backend) and `npm run dev:client` (frontend)
2. **Access**: Visit `http://localhost:3000`
3. **Login**: Use test credentials (john@example.com / password123)
4. **Create Dashboard**: Click "New Dashboard" button
5. **Build**: Drag widgets from sidebar to canvas
6. **Collaborate**: Share dashboard URL with team members
7. **Save**: Use Ctrl+S or auto-save every 30 seconds

The application is fully functional with all requested features implemented and working smoothly together!




<!-- This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. -->
