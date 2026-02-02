# Trade Work Today - Deployment Instructions

## What You're Getting
This is a complete, ready-to-deploy website for Trade Work Today. When someone fills out the application form, you'll receive an email with all their details.

---

## STEP 1: Download and Prepare the Project

1. Download the `trade-work-today.zip` file
2. Unzip it to a folder on your computer (right-click → Extract All on Windows, or double-click on Mac)
3. Open the folder — you should see: `package.json`, `index.html`, `vite.config.js`, and a `src` folder

---

## STEP 2: Add Your Email Address

1. Open the `src` folder
2. Open `App.jsx` in any text editor (Notepad, TextEdit, or VS Code)
3. Find this line near the top (around line 35):
   
   ```javascript
   const YOUR_EMAIL = "your@email.com";
   ```

4. Replace `your@email.com` with YOUR actual email address
5. Save the file

---

## STEP 3: Install Required Software

You need Node.js installed. Check if you have it:

1. Open Terminal (Mac) or Command Prompt (Windows)
2. Type: `node --version`
3. If you see a version number (like v18.0.0), skip to Step 4
4. If not, download and install from: https://nodejs.org (choose the LTS version)

---

## STEP 4: Deploy to Vercel via Command Line

### 4a. Open your terminal/command prompt

**On Mac:**
- Press Cmd + Space, type "Terminal", hit Enter

**On Windows:**
- Press Windows key, type "cmd", hit Enter

### 4b. Navigate to your project folder

Type this command (replace the path with where you unzipped the folder):

**Mac example:**
```
cd ~/Downloads/trade-work-today
```

**Windows example:**
```
cd C:\Users\YourName\Downloads\trade-work-today
```

### 4c. Install the Vercel CLI

```
npm install -g vercel
```

Wait for it to finish (may take a minute).

### 4d. Deploy!

```
vercel
```

**It will ask you some questions:**

1. "Set up and deploy?" → Press **Enter** (Yes)
2. "Which scope?" → Press **Enter** (your account)
3. "Link to existing project?" → Type **N**, press Enter
4. "What's your project's name?" → Press **Enter** (or type `trade-work-today`)
5. "In which directory is your code located?" → Press **Enter** (current directory)
6. "Want to modify settings?" → Type **N**, press Enter

**Wait 1-2 minutes while it builds and deploys.**

You'll see a URL like: `https://trade-work-today-abc123.vercel.app`

🎉 **Your site is now LIVE!** Visit that URL to see it.

---

## STEP 5: Connect Your GoDaddy Domain

### 5a. In Vercel:

1. Go to https://vercel.com/dashboard
2. Click on your `trade-work-today` project
3. Click **Settings** (top menu)
4. Click **Domains** (left sidebar)
5. Type `tradeworktoday.com` and click **Add**
6. Vercel will show you nameservers. They look like:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
   
   **Write these down or keep this tab open.**

### 5b. In GoDaddy:

1. Go to https://dcc.godaddy.com/ and sign in
2. Find `tradeworktoday.com` and click **DNS** or **Manage DNS**
3. Scroll down to find **Nameservers**
4. Click **Change** or **Edit**
5. Select **"Enter my own nameservers (advanced)"**
6. Enter the Vercel nameservers:
   - Nameserver 1: `ns1.vercel-dns.com`
   - Nameserver 2: `ns2.vercel-dns.com`
7. Click **Save**

**⏰ Wait 10-30 minutes** for the changes to take effect.

---

## STEP 6: Activate Email Notifications

The **first time** someone submits the form:

1. Check your email inbox (the one you added in Step 2)
2. You'll get an email from FormSubmit asking you to confirm
3. **Click the confirmation link**

After that, every application goes straight to your inbox!

---

## Troubleshooting

**"command not found: vercel"**
→ Run: `npm install -g vercel` again

**"command not found: node"**
→ Install Node.js from https://nodejs.org

**Domain not working after 30 minutes**
→ Double-check the nameservers are entered correctly in GoDaddy

**Need help?**
→ Vercel has great support at https://vercel.com/help

---

## You're Done! 🎉

Your site should now be live at:
- https://trade-work-today.vercel.app (temporary URL)
- https://tradeworktoday.com (your domain, after DNS updates)

