# How to Get and Set Up Your Google Maps API Key

To display the map in the PowerDown application, you need a valid Google Maps JavaScript API key. Follow these step-by-step instructions to get your key and add it to your project.

## Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Sign in with your Google account.
3. In the top navigation bar, click the **Select a project** dropdown.
4. Click **New Project** in the upper right corner of the modal window.
5. Enter a project name (e.g., `PowerDown App`) and click **Create**.
6. Wait a few moments for the project to be created, then ensure it is selected in the top navigation bar.

## Step 2: Enable the Mapping APIs
1. In the Google Cloud Console search bar at the top, type **"Maps JavaScript API"** and select it from the results. Click the blue **Enable** button.
2. Repeat the search and enabling process for the following APIs (they all share the same API key):
   - **Geocoding API**
   - **Places API**
   - **Distance Matrix API**
3. *Note: You will also need to enable billing on your Google Cloud project (Google provides $200 in free monthly credits for Maps, which is more than enough for testing and small apps).*

## Step 3: Generate Your API Key
1. In the left-hand menu, navigate to **APIs & Services** > **Credentials**.
2. Click **+ CREATE CREDENTIALS** at the top.
3. Select **API key** from the dropdown menu.
4. A popup will appear with your new API key. **Copy this key.**

*(Optional but Recommended): Click "Edit API Key" to restrict it so others can't use it. You can restrict it to "HTTP referrers (web sites)" and allow `localhost` for development, or restrict it to the specific APIs you enabled (`Maps JavaScript API`, `Geocoding API`, `Places API`, `Distance Matrix API`).*

## Step 4: Add the Key to Your Application
1. Open the file `client/.env` located in your project folder (`c:\Users\Onyx\POWER_OUTAGE\client\.env`).
2. Find the line that says:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
   ```
3. Replace the placeholder with your actual API key, like this:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyB-YourActualKeyGoesHere12345
   ```
4. **Save** the file.

## Step 5: Restart the Server
If your development server the application is currently running, Vite might need to be restarted to pick up the new environment variable.
1. In your terminal, stop the server by pressing `Ctrl + C`.
2. Start the server again by running:
   ```bash
   npm run dev
   ```
3. Open your browser to `http://localhost:5173` and the map should now load properly!
