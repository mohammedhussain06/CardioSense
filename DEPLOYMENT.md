# CardioSense AI — Production Deployment Guide

This guide covers deploying the CardioSense AI full stack (FastAPI backend + PyTorch ResNet-18 model + Digital Signal Processing + React Web Frontend).

---

## Architecture Overview

```
                                      +------------------------------------+
                                      |   Cloud Deployment (Render / HF)   |
                                      |                                    |
[ React Web App (Browser) ] --------> |   FastAPI (Port 8000 / $PORT)      |
                                      |   ├── /         -> React Web UI    |
[ Mobile App (APK / Phone) ] -------> |   ├── /api/...  -> DSP & PyTorch   |
                                      |   └── /health   -> Health Status   |
                                      +------------------------------------+
```

The unified deployment serves **both**:
1. **Web Dashboard & Studio**: Anyone visiting your URL in a browser accesses the full diagnostic interface.
2. **Mobile Backend**: Your mobile app points to `https://your-domain.com` and executes live recordings & clinical analysis without needing a local Wi-Fi connection.

---

## Option 1: Render.com (Recommended — Fast & Free)

Render provides free hosting with automatic HTTPS and seamless GitHub integration.

### Steps:
1. Push your code to GitHub:
   ```cmd
   git add .
   git commit -m "Prepare production deployment"
   git push origin main
   ```
2. Log in to [Render.com](https://render.com).
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository (`cardiosense-ai`).
5. Select **Docker** as the runtime:
   - **Name**: `cardiosense-ai`
   - **Region**: Closest to you (e.g. Frankfurt, Singapore, or Oregon)
   - **Branch**: `main`
   - **Instance Type**: **Free** (or Starter for persistent RAM)
6. Click **Deploy Web Service**.
7. Once deployed, Render will provide a live URL like:
   `https://cardiosense-ai.onrender.com`

---

## Option 2: Hugging Face Spaces (Free 16GB RAM)

Hugging Face Spaces provides 16GB RAM for free, perfect for PyTorch models.

### Steps:
1. Log in to [Hugging Face](https://huggingface.co).
2. Click **New Space** (`https://huggingface.co/new-space`).
3. Set:
   - **Space Name**: `cardiosense-ai`
   - **License**: MIT or Apache 2.0
   - **Space SDK**: **Docker** (Blank)
   - **Visibility**: Public
4. Push your repository to the Hugging Face Space git remote:
   ```cmd
   git remote add hf https://huggingface.co/spaces/<YOUR_USERNAME>/cardiosense-ai
   git push hf main
   ```
5. Hugging Face will automatically build the Docker image and launch the app at:
   `https://<YOUR_USERNAME>-cardiosense-ai.hf.space`

---

## Option 3: Local / VPS Docker Container

Run anywhere (AWS EC2, DigitalOcean, Hetzner, or local server):

```bash
# Build the unified image
docker build -t cardiosense-ai:latest .

# Run container on port 8000
docker run -d --name cardiosense -p 8000:8000 --restart always cardiosense-ai:latest
```

Verify status:
```bash
curl http://localhost:8000/health
```

---

## Connecting the Mobile App to Deployed Backend

Once you get your live HTTPS URL (e.g., `https://cardiosense-ai.onrender.com`):

### Option A: In-App (No Rebuild Required)
1. Open the CardioSense mobile app.
2. Tap the **Backend Status Pill** at the top right of the screen.
3. In the Server Settings modal, paste your deployed URL:
   `https://cardiosense-ai.onrender.com`
4. Tap **Test & Save**. The app will now communicate directly with your cloud backend!

### Option B: Build-time Default
Update `mobile/.env`:
```env
EXPO_PUBLIC_API_BASE_URL=https://cardiosense-ai.onrender.com
```
Then build your APK:
```cmd
cd mobile
npx eas build -p android --profile preview
```

