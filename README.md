# Pathfinder 🧭

A full-stack career development platform that helps users identify skill gaps and discover learning resources to achieve their career goals.
This project features a React frontend and a Supabase backend with AI-powered recommendations.

---

### ✨ Live Demo

*[Link to your deployed application will go here]*

### 📸 Screenshots

*Add screenshots of your application here. You can drag and drop them into this README file on GitHub.*

![Dashboard View](./path/to/dashboard_screenshot.png)
![Profile View](./path/to/profile_screenshot.png)

---

### 🚀 Features

* **User Authentication**: Secure user registration and login handled by Supabase Auth.
* **Profile Management**: Users can view and update their profile information and skillsets.
* **Skill Gap Analysis**: Select a target role to see which skills you have and which you need to learn.
* **AI Recommendations**: Get personalized course recommendations based on your skill gaps.
* **Secure & Scalable**: Built with Row Level Security (RLS) to ensure users can only access their own data.
* **Fully Responsive**: A clean, modern UI that works on all devices.

---

### 🛠️ Built With

* **Frontend**: React, React Router
* **Backend**: Supabase (PostgreSQL, Authentication, Edge Functions)
* **Styling**: CSS with a mobile-first approach
* **AI**: OpenAI API (via Supabase Edge Functions)

---

### ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

**Prerequisites:**
* Node.js (v18 or later)
* npm

**Installation:**

1.  **Clone the repo**
    ```sh
    git clone [https://github.com/Rippperr/Pathfinder.git](https://github.com/Rippperr/Pathfinder.git)
    ```
2.  **Set up the Frontend**
    ```sh
    cd Pathfinder/frontend/client
    npm install
    # Create a .env.local file and add your Supabase keys
    # REACT_APP_SUPABASE_URL='YOUR_SUPABASE_URL'
    # REACT_APP_SUPABASE_ANON_KEY='YOUR_SUPABASE_ANON_KEY'
    npm start
    ```
