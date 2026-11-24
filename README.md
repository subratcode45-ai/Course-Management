# CourseHub

A full stack course platform built with the MERN stack and TypeScript on the frontend. Visitors can browse courses, students can sign up and buy courses through Razorpay, and admins can add, edit and delete courses.

> Add a screenshot or GIF here, for example: `![CourseHub home page](./screenshots/home.png)`

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
- Admin-only routes protected on both the frontend and the backend

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
| Payments | Razorpay (test mode) |

## Project structure

```
course-platform/
├── client/                 # React + Vite + TypeScript
│   └── src/
│       ├── api/            # axios instance
│       ├── components/     # Navbar, Footer, CourseCard, route guards...
│       ├── context/        # AuthContext, ThemeContext
│       ├── pages/          # Home, Courses, CourseDetail, Login, admin/...
│       ├── types/
│       └── utils/
└── server/                 # Express API
    ├── config/             # db and razorpay setup
    ├── controllers/
    ├── middleware/         # auth (protect, adminOnly)
    ├── models/             # User, Course, Enrollment, Payment
    ├── routes/
    └── server.js
```

## Getting started

### Prerequisites

- Node.js 18 or newer
- A MongoDB database (local, or a free MongoDB Atlas cluster)
- A Razorpay account in test mode (only needed for paid courses)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
```

Start the server:

```bash
npm run dev
```

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
| POST | `/api/enroll/:courseId` | User | Enroll in a free course (paid courses need a verified payment) |
| GET | `/api/enroll/my-courses` | User | List purchased courses |
| POST | `/api/payment/create-order` | User | Create a Razorpay order for a paid course |
| POST | `/api/payment/verify` | User | Verify the payment signature and enroll the user |

Protected routes expect the header `Authorization: Bearer <token>`.

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

## Known limitations and roadmap

- [ ] Razorpay webhook, so a user is enrolled even if they close the tab after paying
- [ ] Email OTP verification on login (Nodemailer)
- [ ] Image upload (Multer and Cloudinary) instead of thumbnail URLs
- [ ] Rate limiting on auth routes
- [ ] Reviews and ratings
- [ ] Lesson content (videos) and progress tracking
- [ ] Deployment: backend on Render, frontend on Vercel, with CORS restricted to the live frontend URL

## Security notes

- Never commit `.env` files. Make sure `.env` and `node_modules` are in `.gitignore`.
- The Razorpay secret key stays on the server only.
- Frontend route guards are for user experience. The real access checks are the `protect` and `adminOnly` middleware on the API.

## License

This project is for learning purposes. Add a license (for example MIT) if you want others to reuse it.
