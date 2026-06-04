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



## To do
* Improve etl perfomance


# AWS SETUP

## EC2
### SSH into EC2
```
chmod 400 bookclub.pem # only owner can read
ssh -i bookclub.pem ec2-user@Public-IP
```
```
cat /etc/os-release
```

### Install Docker
```
sudo dnf update -y # update package
sudo dnf install docker -y
sudo systemctl docker enable docker # enable at boot
sudo systemctl docker start docker # start service
docker --version
```
### Add yourself to Docker Group
```
# you won't use sudo docker ps everytime
sudo usermod -aG docker ec2-user 
```

### Installing Docker Compose manually
```
sudo mkdir -p /usr/libexec/docker/cli-plugins/

sudo curl -SL \
https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m) \
-o /usr/libexec/docker/cli-plugins/docker-compose

sudo chmod +x /usr/libexec/docker/cli-plugins/docker-compose
```

### Install Git and Clone Rep
```
sudo dnf install git -y
git clone https://github.com/SinanErbezci/bookclub.git
```