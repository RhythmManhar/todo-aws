# TodoPro

A modern Todo productivity dashboard built with **HTML5, CSS3 and Vanilla JavaScript**.

## Features

- Add, edit and delete tasks
- Complete/uncomplete tasks
- Important tasks
- Due dates
- Priority and category
- Search
- Filtering
- Sorting
- Statistics and completion progress
- Light/dark mode
- Responsive mobile sidebar
- LocalStorage persistence
- Docker + Nginx deployment
- GitHub Actions CI build

## Run locally

Open `index.html` in a browser.

Optional local server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Docker

```bash
docker build -t todopro .
docker run -d --name todopro -p 8080:80 todopro
```

Open `http://localhost:8080`.

## AWS

The Docker image listens on port 80 inside the container, making it suitable for the existing EC2/ECR architecture. Replace the application image in your existing ECR repository and restart the existing EC2 container when ready.

## Important

No AWS credentials, API keys, or secrets belong in this repository.
