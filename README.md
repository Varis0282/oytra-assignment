# File Manager Application

A modern web application for managing files and user profiles built with Next.js and TypeScript.

## Features

- User Authentication
  - Login with email/password
  - JWT-based authentication
  - Secure session management

- File Management
  - Upload files (PDF, Excel, TXT)
  - View file details
  - Download files
  - File type categorization

- Dashboard
  - Total files overview
  - File type breakdown
  - User statistics

- User Profile
  - Edit username
  - Manage phone number
  - Add/edit multiple addresses

## Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd file-manager
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
JWT_SECRET=your-secret-key
UPLOAD_DIR=uploads
```

4. Create the uploads directory:
```bash
mkdir uploads
```

## Development

Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production

Build the application:
```bash
npm run build
# or
yarn build
```

Start the production server:
```bash
npm start
# or
yarn start
```

## Project Structure

```
file-manager/
├── app/
│   ├── api/           # API routes
│   ├── components/    # React components
│   ├── dashboard/     # Dashboard page
│   ├── files/        # File management page
│   ├── login/        # Login page
│   └── profile/      # User profile page
├── public/           # Static files
├── uploads/          # File upload directory
└── package.json      # Project dependencies
```

## Security Considerations

- All API routes are protected with JWT authentication
- File uploads are validated and stored securely
- Sensitive data is not exposed in client-side code
- HTTP-only cookies are used for token storage

## TODO

- Implement actual database integration
- Add file type validation
- Implement file size limits
- Add user registration
- Add password reset functionality
- Implement file sharing features
- Add file preview functionality

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
