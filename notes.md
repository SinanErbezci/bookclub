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


### Building npm server and testing
```
npm run build # creates build folder
npx serve -s build # starts server
```


## To do
* Improve etl perfomance


# AWS SETUP

## Basic EC2 Setup
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

### ECR Repo
- Create repo and copy the url
- If aws cli is not installed, install it
```
aws configure # enter your access key
aws sts get-caller-identity # check your info
```
### Authenticate Docker to ECR
```
aws ecr get-login-password  --region eu-west-3  | docker login --username AWS  --password-stdin 796973519136.dkr.ecr.eu-west-3.amazonaws.com/bookclub
```
### Tag Current Image and Push
```
docker tag bookclub-web:latest 796973519136.dkr.ecr.eu-west-3.amazonaws.com/bookclub:latest
docker push 796973519136.dkr.ecr.eu-west-3.amazonaws.com/bookclub:latest
```
### SSM Agent
Rather than using aws configure in ec2, use ssm with iam role. Safer
- Role -> EC2 - AmazonSSMManagedInstanceCore, AmazonEC2ContainerRegistryReadOnly
- Attach role to instance
```
# check if it's attached
aws ssm describe-instance-information \
  --region eu-west-3
```

## Frontend on S3
### Create ACM certificate on us-east-1
### Create S3 Bucket
```
npm run build # creates build folder
```
```
aws s3 sync build/ s3://sinanbook.club --delete
```


#### Checking Log Config
```
docker inspect bookclub_web --format='{{.HostConfig.LogConfig.Type}}'
```