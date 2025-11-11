# Backend Setup Instructions for Kagwiria's Website

## 1. Firebase Setup (Free - Google Account Required)

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Name it "kagwiria-website"
4. Enable Google Analytics (optional)

### Step 2: Enable Services
1. **Authentication**: Go to Authentication > Sign-in method > Enable Email/Password
2. **Firestore Database**: Go to Firestore Database > Create database > Start in test mode
3. **Storage**: Go to Storage > Get started > Start in test mode

### Step 3: Get Configuration
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" > Add web app
3. Copy the config object and replace in `firebase-config.js`

## 2. EmailJS Setup (Free Email Service)

### Step 1: Create Account
1. Go to https://www.emailjs.com
2. Sign up with Gmail account
3. Create email service connecting to Gmail

### Step 2: Create Templates
1. Create template for contact form
2. Create template for donations
3. Get Service ID and Template IDs
4. Update in `backend.js`

## 3. File Upload Setup

Files automatically upload to Firebase Storage:
- Photos go to `/stories/` folder
- Videos go to `/stories/` folder
- Admin uploads go to `/uploads/` folder

## 4. Admin Access

### Default Login:
- Email: kagwiriamurungi7@gmail.com
- Password: (Set in Firebase Authentication)

### Admin Features:
- ✅ Add stories with photos/videos
- ✅ Manage cancer institute content
- ✅ Update contact information
- ✅ Track donations
- ✅ Manage mentorship programs

## 5. Forms That Work:
- ✅ Contact form → Sends email to Kagwiria
- ✅ Newsletter signup → Saves to database
- ✅ Story publishing → Uploads files + saves content
- ✅ Donation tracking → Records + sends thank you email

## 6. Deployment Options:

### Option A: Firebase Hosting (Recommended - Free)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Option B: Netlify (Free)
1. Drag website folder to netlify.com
2. Site goes live instantly

### Option C: Traditional Hosting
Upload all files to any web hosting service

## 7. Cost Breakdown:
- Firebase: FREE (up to 1GB storage, 50K reads/day)
- EmailJS: FREE (up to 200 emails/month)
- Domain: ~$10/year (optional)
- Hosting: FREE with Firebase/Netlify

## 8. Maintenance:
- Kagwiria can manage everything through admin panel
- No coding required for daily operations
- Automatic backups with Firebase
- Mobile-friendly admin interface