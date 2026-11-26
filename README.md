# CourseHub

A full stack course platform built with the MERN stack and TypeScript on the frontend. Visitors can browse courses, students can sign up and buy courses through Razorpay, and admins can add, edit and delete courses, including uploading course thumbnails.

> <img width="1882" height="892" alt="Screenshot 2026-11-24 155956" src="https://github.com/user-attachments/assets/a39b93a2-3a72-4234-808c-b09910455739" />


## Features

**Visitors**
- Browse all courses with search, filters (level, mode, price) and sorting
- Open a course page with description, what you'll learn and a collapsible curriculum

**Students**
- Register and log in (JWT authentication)
- Buy paid courses with Razorpay, or enroll in free courses directly
- "My Courses" page with all purchased courses

**Admins**
- Dashboard with course stats, search and a delete confirmation modal
- Add and edit courses with one reusable form
- Upload course thumbnails from the form (drag and drop, live preview, upload progress)
- Admin-only routes protected on both the frontend and the backend

**File handling (Multer)**
- Thumbnails are uploaded to the server with Multer and stored in `Server/uploads/thumbnails`
- Only JPG, PNG and WebP images are accepted, up to 5 MB
- Upload route is admin-only
- Files get random names, and the file extension comes from the checked image type
- Old images are deleted when a course is updated or deleted, and unused files are cleaned up automatically
- Courses that already use an external image URL keep working

**UI**
- Light and dark theme with saved preference
- Skeleton loaders, error and empty states
- Responsive layout for mobile, tablet and desktop

## Tech stack

| Area | Tools |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS v4, React Router (`createBrowserRouter`), Axios, lucide-react |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| File uploads | Multer (local disk storage) |
| Payments | Razorpay (test mode) |

## Project structure

```
Course-Management/
├── client/                 # React + Vite + TypeScript
│   └── src/
│       ├── api/            # axios instance
│       ├── components/     # Navbar, Footer, CourseCard, route guards...
│       ├── context/        # AuthContext, ThemeContext
│       ├── pages/          # Home, Courses, CourseDetail, Login, admin/...
│       ├── types/
│       └── utils/
└── Server/                 # Express API
    ├── Config/             # db, razorpay and upload path setup
    ├── Controllers/
    ├── Middlewares/        # auth (protect, adminOnly), Multer upload
    ├── Models/             # User, Course, Enrollment, Payment
    ├── Routes/
    ├── uploads/            # uploaded thumbnails (git-ignored)
    └── server.js
```

## Getting started

### Prerequisites

- Node.js 18 or newer
- A MongoDB database (local, or a free MongoDB Atlas cluster)
- A Razorpay account in test mode (only needed for paid courses)

### 1. Clone the repository

```bash
git clone https://github.com/subratcode45-ai/Course-Management.git
cd Course-Management
```

### 2. Set up the backend

```bash
cd Server
npm install
```

Create `Server/.env`:

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
```

Start the server (run it from inside the `Server` folder, because the upload folder path is relative to it):

```bash
npm run dev
```

The `uploads/thumbnails` folder is created automatically on the first run.

### 3. Set up the frontend

```bash
cd ../client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

Start the app:

```bash
npm run dev
```

Open http://localhost:5173.

> Restart the Vite dev server after changing `.env`, because Vite only reads it at startup.

### 4. Create an admin user

New accounts are always created with the `user` role. To make an admin:

1. Register a normal account in the app.
2. Open the `users` collection in MongoDB (Compass or Atlas).
3. Change that user's `role` to `admin` and save.
4. Log out and log in again.

## API overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Log in, returns a JWT |
| GET | `/api/courses` | Public | List all courses |
| GET | `/api/courses/:id` | Public | Get one course |
| POST | `/api/courses` | Admin | Create a course |
| PUT | `/api/courses/:id` | Admin | Update a course |
| DELETE | `/api/courses/:id` | Admin | Delete a course |
| POST | `/api/upload/thumbnail` | Admin | Upload a thumbnail image (multipart form, field name `thumbnail`) |
| GET | `/uploads/thumbnails/:file` | Public | Serve an uploaded thumbnail |
| POST | `/api/enroll/:courseId` | User | Enroll in a free course (paid courses need a verified payment) |
| GET | `/api/enroll/my-courses` | User | List purchased courses |
| POST | `/api/payment/create-order` | User | Create a Razorpay order for a paid course |
| POST | `/api/payment/verify` | User | Verify the payment signature and enroll the user |

Protected routes expect the header `Authorization: Bearer <token>`.

## How thumbnail upload works

1. The admin picks or drops an image in the course form.
2. The frontend checks the type and size, then sends it to `POST /api/upload/thumbnail` as `multipart/form-data`.
3. Multer validates the file again on the server and saves it to `Server/uploads/thumbnails`.
4. The server returns a path such as `/uploads/thumbnails/<name>.jpg`, which is stored in the course's `thumbnail` field.
5. The frontend turns that path into a full URL using the API origin, so the image displays on cards and course pages.

## How payments work

1. The student clicks **Buy Now** and the frontend asks the backend to create an order. The price always comes from the database, never from the client.
2. The Razorpay checkout opens in the browser.
3. After payment, the backend verifies the signature, confirms the payment with Razorpay and then creates the enrollment.
4. `POST /api/enroll/:courseId` rejects paid courses that have no verified payment.

### Testing payments

Use Razorpay **test mode** keys and the test card `4111 1111 1111 1111` with any future expiry date and any CVV.

## Sample course data

You can add courses from the admin dashboard, or send this to `POST /api/courses` with an admin token:

```json
{
  "title": "Git & GitHub for Beginners",
  "slug": "git-github-for-beginners",
  "description": "A short free course on version control.",
  "thumbnail": "https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&fit=crop&w=800&q=80",
  "price": 0,
  "instructor": "Sneha Iyer",
  "duration": "2 Weeks",
  "level": "Beginner",
  "mode": "Online",
  "whatYouWillLearn": ["Track changes with Git", "Work with branches"],
  "curriculum": [
    { "title": "Git Basics", "lessons": ["Installing Git", "Commits"] }
  ]
}
```

## Roadmap

Done:
- [x] Course browsing, search, filters and sorting
- [x] JWT authentication with user and admin roles
- [x] Razorpay payments (test mode) with server-side verification
- [x] Admin dashboard and course form
- [x] Thumbnail upload with Multer
- [x] Light and dark theme

Planned, in this order:
1. [ ] **Razorpay webhook**: enroll the user even if they close the tab after paying
2. [ ] **Rate limiting**: limit requests on login, register and upload routes with `express-rate-limit`
3. [ ] **Forgot password** with Nodemailer: emailed reset link with a short-lived token
4. [ ] **Lesson content and course player**: videos and downloadable resources that only enrolled students can open
5. [ ] **Cloudinary for uploads**: move images off local disk before deploying, since many hosts delete local files on every deploy

Also worth adding:
- [ ] Input validation on the API (for example with `zod`)
- [ ] Security hardening: `helmet`, and CORS restricted to the live frontend URL
- [ ] Progress tracking (mark lessons complete, show a progress bar)
- [ ] Payment history page for students
- [ ] Email receipts after purchase
- [ ] Reviews and ratings
- [ ] Server-side search and pagination for large course lists
- [ ] Deployment: backend on Render, frontend on Vercel

## Security notes

- Never commit `.env` files. Make sure `.env`, `node_modules` and `uploads/` are in `.gitignore`.
- The Razorpay secret key stays on the server only.
- Uploads accept only JPG, PNG and WebP (SVG is blocked because it can contain scripts), with a 5 MB limit and only for admins.
- Frontend route guards are for user experience. The real access checks are the `protect` and `adminOnly` middleware on the API.

## License

This project is for learning purposes. Add a license (for example MIT) if you want others to reuse it.
