Using:
* Django 6.0.1
* Postgres 18.1

### Creating project
django-admin startproject mysite bookclub

### verify project is running
python manage.py runserver

### Using etl script
```bash
docker compose exec web python manage.py <command> <options>
```

frontend/
├── public/
├── src/
│   ├── api/                # API calls (DRF communication)
│   │   ├── client.js
│   │   ├── books.js
│   │   ├── authors.js
│   │   └── genres.js
│   │
│   ├── components/         # Reusable UI pieces
│   │   ├── BookCard.jsx
│   │   ├── Navbar.jsx
│   │   └── Spinner.jsx
│   │
│   ├── features/           # Domain-based modules (VERY IMPORTANT)
│   │   ├── books/
│   │   │   ├── BookList.jsx
│   │   │   ├── BookDetail.jsx
│   │   │   └── bookSlice.js (optional if using state management)
│   │   │
│   │   ├── authors/
│   │   │   ├── AuthorDetail.jsx
│   │   │   └── FeaturedAuthor.jsx
│   │   │
│   │   ├── genres/
│   │   │   ├── GenreDetail.jsx
│   │   │   └── FeaturedGenre.jsx
│   │
│   ├── pages/              # Route-level pages
│   │   ├── Browse.jsx
│   │   ├── BookPage.jsx
│   │   ├── AuthorPage.jsx
│   │   └── GenrePage.jsx
│   │
│   ├── hooks/              # Custom hooks
│   │   └── useFetch.js
│   │
│   ├── utils/              # Helpers
│   │   └── format.js
│   │
│   ├── styles/             # CSS / Tailwind
│   │   └── main.css
│   │
│   ├── App.jsx             # Routes + layout
│   └── main.jsx            # Entry point
│
├── package.json
└── vite.config.js / webpack.config.js

### Javascript notes
#### Optional chaning
author.books?.map(...)
"Only continue if the thing before ? exists"