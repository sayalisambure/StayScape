# 🏡 StayScape

> A full-stack Airbnb-inspired rental platform where users can list properties, explore stays on an interactive map, upload photos, and leave star-rated reviews.

![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Mapbox](https://img.shields.io/badge/Mapbox-GL%20JS-000000?logo=mapbox&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Images-3448C5?logo=cloudinary&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white)


**📂 LiveDemo:** https://stayscape-e7e3.onrender.com/listings
**📂 Repository:** [github.com/sayalisambure/StayScape](https://github.com/sayalisambure/StayScape)

---

## 📸 Screenshots

<table>
  <tr>
    <td width="50%"><img src="https://github.com/user-attachments/assets/a4535398-e20e-413a-a445-6ff6525902d7" alt="Home page"></td>
    <td width="50%"><img src="https://github.com/user-attachments/assets/6ac23a90-908a-46a8-a077-b62cb3a1f884" alt="Listing details"></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://github.com/user-attachments/assets/7d8b4a0f-dd6e-41fd-9347-3216927fe8fd" alt="Map view"></td>
    <td width="50%"><img src="https://github.com/user-attachments/assets/2931d453-81e9-493d-9a71-b17488a5bda4" alt="Reviews"></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://github.com/user-attachments/assets/7ca7335a-a725-4a00-89c8-17ea7318febc" alt="Add listing"></td>
    <td width="50%"></td>
  </tr>
</table>

---

## ✨ Features

**Listings**
- Create, view, edit and delete property listings (full CRUD)
- Photo upload straight to Cloudinary (Multer + `multer-storage-cloudinary`)
- Browse by 8 categories: Trending, Rooms, Iconic Cities, Castles, Amazing Pools, Camping, Farms, Arctic
- Prices formatted in INR (`en-IN`) with a "display total after taxes" toggle

**Maps**
- Addresses are converted to coordinates with the **Mapbox Geocoding API** and stored as GeoJSON `Point` data
- Each listing page shows an interactive **Mapbox GL JS** map with a marker and popup

**Reviews**
- Star ratings (1–5) with comments
- Only the author can delete their own review
- Deleting a listing automatically deletes its reviews (Mongoose `post("findOneAndDelete")` middleware)

**Authentication & authorization**
- Signup / login / logout with **Passport.js** (local strategy) and `passport-local-mongoose` (salted and hashed passwords)
- Sessions stored in MongoDB with `connect-mongo` (session data encrypted, lazy updates with `touchAfter`)
- Route protection middleware: `isLoggedIn`, `isOwner`, `isReviewAuthor`
- After login, users are redirected back to the page they originally requested

**Quality & UX**
- Server-side validation with **Joi** and client-side validation with Bootstrap
- Flash messages for success and error feedback
- Centralized error handling: custom `ExpressError`, `wrapAsync` helper and a 404 catch-all
- Responsive layout built with Bootstrap 5

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| Runtime / Server | Node.js 22, Express 5 |
| Database | MongoDB Atlas, Mongoose 9 |
| Templating | EJS, `ejs-mate` (layouts) |
| Auth | Passport.js, `passport-local`, `passport-local-mongoose`, `express-session`, `connect-mongo` |
| Validation | Joi |
| Media | Multer, Cloudinary |
| Maps | Mapbox Geocoding SDK, Mapbox GL JS |
| Frontend | Bootstrap 5, Font Awesome, Starability (star rating CSS) |
| Deployment | Render, MongoDB Atlas |

---

## 🧱 Architecture

The app follows the **MVC** pattern:

```
Request → Router → Middleware (auth / validation) → Controller → Model → View (EJS)
```

```
StayScape/
├── app.js                # App setup, sessions, passport, routes, error handling
├── cloudConfig.js        # Cloudinary + Multer storage config
├── middleware.js         # isLoggedIn, isOwner, isReviewAuthor, Joi validators
├── schema.js             # Joi schemas for listings and reviews
├── Models/               # listing.js, reviews.js, user.js
├── controllers/          # listings.js, reviews.js, users.js
├── routes/               # listing.js, review.js, user.js
├── utils/                # ExpressError.js, wrapAsync.js
├── views/                # layouts, includes, listings, user, error page
├── public/               # css, client-side js (map.js, script.js)
└── init/                 # data.js + seed script
```

### Data models

- **User**: `username`, `email`, hashed password (via `passport-local-mongoose`)
- **Listing**: `title`, `description`, `image {url, filename}`, `price`, `location`, `country`, `category`, `geometry (GeoJSON Point)`, `owner → User`, `reviews → [Review]`
- **Review**: `comment`, `rating (1–5)`, `author → User`

### Routes

| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/listings` | All listings | Public |
| GET | `/listings/category/:category` | Filter by category | Public |
| GET | `/listings/new` | New listing form | Logged in |
| POST | `/listings` | Create listing (image upload + geocoding) | Logged in |
| GET | `/listings/:id` | Listing details, map and reviews | Public |
| GET | `/listings/:id/edit` | Edit form | Owner |
| PUT | `/listings/:id` | Update listing | Owner |
| DELETE | `/listings/:id` | Delete listing and its reviews | Owner |
| POST | `/listings/:id/reviews` | Add review | Logged in |
| DELETE | `/listings/:id/reviews/:reviewId` | Delete review | Review author |
| GET / POST | `/signup` | Register | Public |
| GET / POST | `/login` | Log in | Public |
| GET | `/logout` | Log out | Logged in |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Mapbox](https://www.mapbox.com/) account (public access token)
- A [Cloudinary](https://cloudinary.com/) account

### Installation

```bash
git clone https://github.com/sayalisambure/StayScape.git
cd StayScape
npm install
```

### Environment variables

Create a `.env` file in the project root (never commit it):

```env
ATLASDB_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/StayScape
SECRET=replace_with_a_long_random_string
MAP_TOKEN=pk.your_mapbox_public_token
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

### Run

```bash
node app.js
```

Open `http://localhost:8080/listings`.

### Seed sample data (optional)

```bash
node init/index.js
```

> ⚠️ The seed script deletes all existing listings before inserting sample ones. Do not run it against a database with data you want to keep.

---

## ☁️ Deployment (Render + MongoDB Atlas)

1. Push the repo to GitHub.
2. In MongoDB Atlas, allow network access from Render (`0.0.0.0/0`).
3. On Render, create a **Web Service** from the repo.
   - Build command: `npm install`
   - Start command: `node app.js`
4. Add all environment variables above, plus `NODE_ENV=production`.
5. Deploy. Render provides the live URL.

---

## 🔐 Security notes

- Passwords are salted and hashed; plain-text passwords are never stored
- Secrets live in environment variables, and `.env` is git-ignored
- Server-side validation (Joi) on all listing and review writes
- Ownership checks on edit, delete and review-delete routes
- User content is HTML-escaped by EJS when rendered
- Session cookies are `httpOnly`

---

## 🧠 Challenges & what I learned

- **Map not rendering:** the listing JSON was HTML-escaped by EJS's `<%= %>` tag, which broke the inline script. Fixed it by emitting unescaped, sanitized JSON and sending only the fields the map needs.
- **Lost redirect after login:** Passport 0.6+ regenerates the session on login, wiping the saved "return to" URL. Solved with a middleware that copies it into `res.locals` before authentication.
- **Express 5 migration:** the old `*` wildcard route is invalid in Express 5; switched to the `/{*splat}` syntax for the 404 handler.
- **Orphaned data:** deleting a listing left its reviews behind, so I added Mongoose post-delete middleware to clean them up.
- **Separation of concerns:** refactored routes into controllers, middleware and utilities to keep the code maintainable.

---


## 👩‍💻 Author

**Sayali Sambure**
GitHub: [@sayalisambure](https://github.com/sayalisambure)

## 📄 License

This project is for learning and portfolio purposes.
