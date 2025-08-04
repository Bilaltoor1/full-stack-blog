# Deploying a Next.js App with MongoDB, Nginx, and PM2 on Ubuntu (WSL)

This guide provides step-by-step instructions to deploy your Next.js application on an Ubuntu server running within the Windows Subsystem for Linux (WSL). We will use MongoDB as the database, PM2 as a process manager, and Nginx as a reverse proxy.

## Prerequisites

*   Windows 10 or 11 with WSL installed.
*   Ubuntu installed as a WSL distribution.
*   Your Next.js project code available (e.g., in a Git repository).

---

### Step 1: Update Your Ubuntu System

First, open your Ubuntu terminal in WSL and make sure your package list and installed packages are up to date.

```bash
sudo apt update && sudo apt upgrade -y
```

---

### Step 2: Install Node.js

We need Node.js to run the Next.js application. We'll install it using NodeSource, which provides up-to-date versions.

1.  **Install curl and other required packages:**
    ```bash
    sudo apt install -y curl build-essential
    ```

2.  **Add the NodeSource repository (for Node.js 20.x):**
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    ```

3.  **Install Node.js:**
    ```bash
    sudo apt install -y nodejs
    ```

4.  **Verify the installation:**
    ```bash
    node -v
    npm -v
    ```
    You should see the versions of Node.js and npm printed to the console.

---

### Step 3: Install and Configure MongoDB

MongoDB will be our database.

1.  **Import the MongoDB public GPG key:**
    ```bash
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
       sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
       --dearmor
    ```

2.  **Create a list file for MongoDB:**
    ```bash
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    ```

3.  **Update the package list and install MongoDB:**
    ```bash
    sudo apt update
    sudo apt install -y mongodb-org
    ```

4.  **Start and enable the MongoDB service:**
    ```bash
    sudo systemctl start mongod
    sudo systemctl enable mongod
    ```

5.  **Verify that MongoDB is running:**
    ```bash
    sudo systemctl status mongod
    ```
    You should see an "active (running)" status. Press `q` to exit.

---

### Step 4: Prepare Your Next.js Application

Now, let's get your application code onto the server.

1.  **Install Git:**
    ```bash
    sudo apt install -y git
    ```

2.  **Clone your project from your repository:**
    Replace `your_repository_url` with the actual URL of your Git repository.
    ```bash
    git clone your_repository_url
    ```
    For example:
    ```bash
    git clone https://github.com/Bilaltoor1/full-stack-blog.git
    ```

3.  **Navigate into your project directory:**
    ```bash
    cd full-stack-blog
    ```

4.  **Install project dependencies:**
    ```bash
    npm install
    ```

5.  **Create a `.env.local` file:**
    Your application likely needs environment variables, especially for the database connection.
    ```bash
    cp .env.example .env.local
    ```
    If you don't have a `.env.example`, create the file manually:
    ```bash
    nano .env.local
    ```
    Add your environment variables. For a local MongoDB instance, your connection string will look like this:
    ```
    MONGODB_URI=mongodb://127.0.0.1:27017/your_database_name
    ```
    Replace `your_database_name` with the name you want to use for your database.

6.  **Build the application for production:**
    ```bash
    npm run build
    ```

---

### Step 5: Install and Use PM2

PM2 is a process manager that will keep your Next.js application running in the background.

1.  **Install PM2 globally:**
    ```bash
    sudo npm install pm2 -g
    ```

2.  **Start your Next.js application with PM2:**
    ```bash
    pm2 start npm --name "next-app" -- start
    ```
    *   `--name "next-app"` gives your process a name, which is useful for managing it.
    *   `-- start` tells PM2 to use the `start` script from your `package.json`.

3.  **Set up PM2 to start on system reboot:**
    ```bash
    pm2 startup
    ```
    This command will output another command that you need to run. Copy and paste it into your terminal and execute it.

4.  **Save your current process list:**
    ```bash
    pm2 save
    ```

5.  **Check the status of your application:**
    ```bash
    pm2 status
    ```
    You should see your "next-app" process with an "online" status.

---

### Step 6: Install and Configure Nginx

Nginx will act as a reverse proxy, directing traffic from the public internet (port 80) to your Next.js application running on a local port (e.g., 3000).

1.  **Install Nginx:**
    ```bash
    sudo apt install -y nginx
    ```

2.  **Start and enable Nginx:**
    ```bash
    sudo systemctl start nginx
    sudo systemctl enable nginx
    ```

3.  **Configure Nginx for your application:**
    *   Remove the default configuration:
        ```bash
        sudo rm /etc/nginx/sites-enabled/default
        ```
    *   Create a new configuration file for your site:
        ```bash
        sudo nano /etc/nginx/sites-available/next-app
        ```
    *   Paste the following configuration into the file. This configuration listens on port 80 and forwards requests to your Next.js app running on port 3000.

        ```nginx
        server {
            listen 80;
            server_name your_domain_or_ip; # Replace with your server's IP or domain

            location / {
                proxy_pass http://localhost:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
            }
        }
        ```
        **Note:** If you are running this purely in WSL for testing, you can use `localhost` for `server_name`.

4.  **Enable the new configuration by creating a symbolic link:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/next-app /etc/nginx/sites-enabled/
    ```

5.  **Test the Nginx configuration for syntax errors:**
    ```bash
    sudo nginx -t
    ```
    If you see "syntax is ok" and "test is successful," you are good to go.

6.  **Restart Nginx to apply the changes:**
    ```bash
    sudo systemctl restart nginx
    ```

---

### Step 7: Access Your Application

Your application is now deployed!

Since you are in WSL, you can access it from your Windows web browser by navigating to:

```
http://localhost
```

If everything is configured correctly, you should see your Next.js application.

### Managing Your Application with PM2

*   **List all running processes:** `pm2 list`
*   **Monitor logs:** `pm2 logs next-app`
*   **Restart the app:** `pm2 restart next-app`
*   **Stop the app:** `pm2 stop next-app`
*   **Delete the app from PM2:** `pm2 delete next-app`

Congratulations! You have successfully deployed a full-stack Next.js application on Ubuntu with MongoDB, Nginx, and PM2.
