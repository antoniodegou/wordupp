# Deployment 

This project is built using Django and deployed on Heroku, with data stored in ElephantSQL. We use Git for version control and GitHub for repository hosting. Below are the steps to get you started:

## Project Creation

1. **Install Django**: If you haven't already, install Django using pip.
    ```bash
    pip install django
    ```
2. **Create a New Project**: Create a new Django project using the following command.
    ```bash
    django-admin startproject projectname
    ```
3. **Navigate to Project**: Change directory to your new project.
    ```bash
    cd projectname
    ```

---

## How to Deploy to Heroku from GitHub

1. **Create Heroku Account**: If you don't have one, [sign up for a Heroku account](https://www.heroku.com/).
2. **Install Heroku CLI**: [Download and install the Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).
3. **Login to Heroku**: Open your terminal and run `heroku login`.
4. **Connect GitHub Repository to Heroku**: Go to the 'Deploy' section in your Heroku Dashboard and connect your GitHub repository.
5. **Deploy**: Click on 'Deploy Branch' at the bottom of the 'Deploy' section.

---

## How to Run Locally

1. **Install Requirements**: Make sure all the required packages are installed.
    ```bash
    pip install -r requirements.txt
    ```
2. **Run Server**: Start the Django development server.
    ```bash
    python manage.py runserver
    ```
3. **Open Browser**: Navigate to `http://127.0.0.1:8000/` in your web browser.

---

## How to Fork Project

1. **Navigate to GitHub Repo**: Open the GitHub repository you wish to fork.
2. **Click Fork**: Click on the 'Fork' button at the top-right corner.
3. **Clone Your Fork**: Clone the forked repository to your local machine.
    ```bash
    git clone https://github.com/yourusername/projectname.git
    ```

    [NEXT ---> Tests](tests.md)