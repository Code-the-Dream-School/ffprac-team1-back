# DevConnexion: Back-End Repository

Welcome to the back-end repository for **DevConnexion** — a platform created specifically for aspiring developers, web designers, and testers, among others. Here, at the intersection of technology and creativity, you embark on your exciting journey into professional development.

This repository contains the **Node.js/Express server** code for our application, interfacing with our [Frontend Repository](https://github.com/Code-the-Dream-School/ffprac-team1-front/).

## Table of Contents

1. [Swagger Documentation](#swagger-documentation)
2. [Key Features](#key-features)
3. [Technologies Used](#technologies-used)
4. [Quick Start](#quick-start)
5. [Authors](#authors)

---

## Swagger Documentation

[Swagger Documentation Link](https://dev-connexion-g6sv.onrender.com/api-docs/)

## Key Features

### User Authentication and Management

- **User Registration and Login**: Secure user authentication using JSON Web Tokens (JWT), complete with cookie management for maintaining sessions.
- - **Password Management**:
  - Features like password reset and secure handling through encryption using bcrypt.
  - Offers a password reset functionality, where users can request to reset their password, and the system generates a secure reset token. The reset token is time-sensitive, enhancing security and minimizing potential abuse.
- **Session Management**: Secure logout capabilities ensuring user sessions are safely terminated.

### Profile Management

- **User Profiles**: View and update user profiles, including support for uploading profile pictures and cover photos via Cloudinary.
- **Personalized User Experience**: Each user can manage their own projects, favourite projects list, and application status on their profile.

### Project Management

- **Project Creation and Editing**: Users can create, edit, and delete projects, with the control over project details including technologies used and project visibility.
- **Image Management**: Integrated support for uploading project images and managing them through Cloudinary.

### Advanced Search Functionality

- **Text-based Search and Dynamic Filtering**: Allows users to search for projects using sophisticated querying capabilities. Users can input search terms to dynamically filter projects based on various criteria such as project titles, descriptions, technologies used, and roles needed.
- **Sorting and Pagination**: Search results can be sorted by relevance using MongoDB's text search score, ensuring the most relevant results are displayed first. The system also supports pagination, allowing users to navigate through search results efficiently, with options to specify the number of results per page.
- **Missing Words Analysis**: After retrieving the search results, the system calculates and returns any search words not found in the project descriptions, providing additional insights to the user on the relevance of the search results.
- **Access Control**: Results are filtered based on user permissions, ensuring sensitive data such as project applicants and participants are only visible to authorized users.

- **Real-time Project Updates**: Apply to participate in projects, approve or reject applicants, and manage project participants.

### Interactivity and Engagement

- **Project Likes**: Users can put a like on projects, with a real-time update on like counts.
- **Role-based Applications**: Apply for specific roles within projects ensuring users are matched to suitable positions based on their skills.
- **Collaborative Opportunities**: Platform fosters collaboration by allowing users to join projects as per their expertise and interest.

## Technologies Used

This application utilizes a variety of technologies and middleware for optimal performance and security:

- **Core Technologies:**
  - `express` - Framework for handling server-side logic
  - `dotenv` - Manages environment variables
- **Security Packages:**
  - `cors` - Handles cross-origin resource sharing
  - `helmet` - Secures app by setting various HTTP headers
  - `cookie-parser` - Parses cookies attached to the client request object
  - `express-rate-limit` - Limits repeated requests to public APIs within a timeframe
  - `express-mongo-sanitize` - Prevents MongoDB operator injection
  - `xss-clean` - Middleware to sanitize user input to prevent XSS attacks
- **Additional Utilities:**
  - `morgan` - HTTP request logger middleware for node.js
  - `express-favicon` - Middleware to serve a favicon
  - `cloudinary` - Cloud service for storing images
- **Database and Routes:**
  - `connectDB` - Connects to MongoDB database
  - Routes for user, projects, and profiles management

## Quick Start

### Port Configuration

- **Back-end Server:** Runs on port `8000`.
- **Front-end App:** Operates on port `3000`.

### Concurrent Running

- **Simultaneous Operation:** Both the back-end server and the front-end app must be run at the same time to enable full functionality testing.

### Local Development Setup

1. **Repository Setup:** Create a folder to house both the front-end and back-end repositories.
2. **Clone Repository:** Clone this back-end repository into the designated folder.
3. **Install Dependencies:** Run `npm install` to install necessary dependencies.
4. **Update Repository:** Regularly pull the latest version of the `main` branch.
5. **Environment Variables:** Create a `.env` file in the root directory with the necessary environment variables:
   - `MONGODB_URI` - URI for MongoDB connection.
   - `JWT_SECRET` - Secret key for JSON Web Tokens.
   - `JWT_LIFETIME` - Lifetime of JWT.
   - `JWT_RESET_PASSWORD_EXPIRES_IN` - Expiration time for JWT used in password reset.
   - `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET` - Credentials for cloud services.
6. **Start Server:** Execute `npm run dev` to start the development server.
7. **API Testing:** Open `http://localhost:8000/api/v1/` in your browser to test API endpoints.
8. **Running Front-End:** After ensuring the back-end server is up, proceed to run the front-end application.

---

## Authors

- [Aigul Yedigeyeva](https://github.com/AigulY)
- [Anna Solovykh](https://github.com/AnnaSolovykh)
- [Daria Sidorko](https://github.com/DariaSidorko)
- [Maria Doronkina](https://github.com/mariyador)
- [Yelena Japarova](https://github.com/DYA13)
