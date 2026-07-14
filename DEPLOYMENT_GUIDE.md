# 🚀 CampusConnect Deployment Guide (Split Stack)

This guide walks you through deploying **CampusConnect** using **Option 2**:
*   **Database:** MongoDB Atlas (Cloud)
*   **Backend Server:** Render (or Railway)
*   **Frontend Client:** Vercel

---

## 📦 Step 1: Set Up MongoDB Atlas (Cloud Database)

Since your database is currently local, you need a cloud-hosted MongoDB instance:

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2.  Create a new project and build a **Database** (choose the **M0 Free Tier**).
3.  Under **Security -> Database Access**, create a user (e.g., username `admin`) and set a secure password.
4.  Under **Security -> Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere** (`0.0.0.0/0`) so Render/Vercel can connect.
5.  Click **Database** in the sidebar, click **Connect**, select **Drivers**, and copy the connection string. It will look like this:
    ```text
    mongodb+srv://admin:<password>@cluster0.xxxx.mongodb.net/campusconnect?retryWrites=true&w=majority
    ```
    *(Replace `<password>` with your database user password).*

---

## 🖥️ Step 2: Deploy Backend to Render (or Railway)

Render is free and excellent for deploying Node.js/Express servers.

1.  Sign in to [Render](https://render.com) using your GitHub account.
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository containing the CampusConnect project.
4.  Configure the service details:
    *   **Name:** `campusconnect-backend`
    *   **Root Directory:** `server` *(Crucial: this directs Render to the server subfolder)*
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `node index.js`
5.  Click **Advanced**, and add the following **Environment Variables**:
    *   `MONGODB_URI` = *Your MongoDB Atlas connection string (from Step 1)*
    *   `JWT_SECRET` = *A strong random string (e.g., `supersecretkey123!`)*
    *   `PORT` = `5000`
6.  Click **Create Web Service**. 
7.  Once deployed, copy your backend URL from the top of the Render dashboard (e.g., `https://campusconnect-backend.onrender.com`).

---

## 🎨 Step 3: Configure & Deploy Frontend to Vercel

Vercel is the industry standard for fast, static React sites.

1.  Open the [client/vercel.json](file:///d:/Ghosted/Projects/CampusConnect/client/vercel.json) file.
2.  Replace the placeholder URL (`https://YOUR-BACKEND-URL.onrender.com`) with your actual live Render backend URL from Step 2:
    ```json
    {
      "rewrites": [
        {
          "source": "/api/:path*",
          "destination": "https://campusconnect-backend.onrender.com/api/:path*"
        },
        {
          "source": "/(.*)",
          "destination": "/index.html"
        }
      ]
    }
    ```
3.  Save and commit the changes to your GitHub repository.
4.  Log in to [Vercel](https://vercel.com) using GitHub.
5.  Click **Add New** -> **Project** and select your repository.
6.  In the configuration dashboard, set the **Root Directory** to `client` *(Crucial: this builds the React app)*.
7.  Click **Deploy**. Vercel will automatically run `npm run build` and launch your live site!

---

## 🧪 Step 4: Seed Data (Optional)

If you want to populate your new cloud database with the initial campus mock data:
1.  Temporarily update the `MONGODB_URI` inside your local `server/.env` file to point to your new **MongoDB Atlas connection string**.
2.  Run the seed script from your local terminal:
    ```bash
    cd server
    node seed.js
    ```
3.  Verify on Atlas that your collections (`users`, `groups`, `projects`, etc.) have been populated.
