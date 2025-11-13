// Backend functionality for Kagwiria's website (Browser Compatible)

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDawSbMQJHXnSvv6nuorAJ9uD9QJ9tn2Ps",
  authDomain: "kagwiria-website.firebaseapp.com",
  projectId: "kagwiria-website",
  storageBucket: "kagwiria-website.firebasestorage.app",
  messagingSenderId: "152073589515",
  appId: "1:152073589515:web:7c895798d9469a2927c80e",
  measurementId: "G-HTXQ59VEMS"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// Initialize EmailJS
emailjs.init("user_your_emailjs_key"); // Replace with actual key when ready

class KagwiriaBackend {
    
    // Contact Form Submission
    async submitContactForm(formData) {
        try {
            // Save to database
            await db.collection('contacts').add({
                ...formData,
                timestamp: new Date(),
                status: 'new'
            });

            // Send email notification (when EmailJS is configured)
            try {
                await emailjs.send('service_id', 'template_id', {
                    to_email: 'kagwiriamurungi7@gmail.com',
                    from_name: formData.name,
                    from_email: formData.email,
                    subject: formData.subject,
                    message: formData.message
                });
            } catch (emailError) {
                console.log('Email service not configured yet');
            }

            return { success: true, message: 'Message sent successfully!' };
        } catch (error) {
            console.error('Contact form error:', error);
            return { success: false, message: 'Failed to send message. Please try again.' };
        }
    }

    // Newsletter Subscription
    async subscribeNewsletter(email) {
        try {
            await db.collection('newsletter').add({
                email: email,
                subscribed: new Date(),
                active: true
            });
            return { success: true, message: 'Successfully subscribed!' };
        } catch (error) {
            console.error('Newsletter error:', error);
            return { success: false, message: 'Subscription failed. Please try again.' };
        }
    }

    // Upload Files (Photos/Videos)
    async uploadFile(file, folder = 'uploads') {
        try {
            const fileName = `${folder}/${Date.now()}_${file.name}`;
            const storageRef = storage.ref(fileName);
            
            const snapshot = await storageRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            return { success: true, url: downloadURL, fileName: fileName };
        } catch (error) {
            console.error('Upload error:', error);
            return { success: false, message: 'Upload failed. Please try again.' };
        }
    }

    // Add New Story
    async addStory(storyData, files = []) {
        try {
            // Upload files first
            const uploadedFiles = [];
            for (let file of files) {
                const result = await this.uploadFile(file, 'stories');
                if (result.success) {
                    uploadedFiles.push({
                        url: result.url,
                        name: file.name,
                        type: file.type
                    });
                }
            }

            // Save story to database
            await db.collection('stories').add({
                ...storyData,
                files: uploadedFiles,
                published: new Date(),
                status: 'published'
            });

            return { success: true, message: 'Story published successfully!' };
        } catch (error) {
            console.error('Story error:', error);
            return { success: false, message: 'Failed to publish story.' };
        }
    }

    // Get All Stories
    async getStories() {
        try {
            const querySnapshot = await db.collection('stories').orderBy('published', 'desc').get();
            const stories = [];
            querySnapshot.forEach((doc) => {
                stories.push({ id: doc.id, ...doc.data() });
            });
            return stories;
        } catch (error) {
            console.error('Get stories error:', error);
            return [];
        }
    }

    // Admin Login
    async adminLogin(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Invalid email or password' };
        }
    }

    // Support/Donation Tracking
    async recordDonation(donationData) {
        try {
            await db.collection('donations').add({
                ...donationData,
                timestamp: new Date(),
                status: 'pending'
            });

            // Send thank you email (when configured)
            try {
                await emailjs.send('service_id', 'donation_template', {
                    to_email: donationData.email,
                    donor_name: donationData.name,
                    amount: donationData.amount,
                    purpose: donationData.purpose
                });
            } catch (emailError) {
                console.log('Email service not configured yet');
            }

            return { success: true, message: 'Donation recorded. Thank you!' };
        } catch (error) {
            console.error('Donation error:', error);
            return { success: false, message: 'Failed to process donation.' };
        }
    }
}

// Create global instance
window.kagwiriaBackend = new KagwiriaBackend();

// Enhanced form handlers
window.handleContactForm = async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    const button = event.target.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;
    button.innerHTML = 'Sending...';
    button.disabled = true;
    
    try {
        const result = await window.kagwiriaBackend.submitContactForm(data);
        showNotification(result.message, result.success ? 'success' : 'error');
        
        if (result.success) {
            event.target.reset();
        }
    } catch (error) {
        showNotification('Something went wrong. Please try again.', 'error');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
};

window.handleNewsletter = async function(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    
    if (!email || !email.includes('@')) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    const button = event.target.querySelector('button');
    const originalText = button.innerHTML;
    button.innerHTML = 'Subscribing...';
    button.disabled = true;
    
    try {
        const result = await window.kagwiriaBackend.subscribeNewsletter(email);
        showNotification(result.message, result.success ? 'success' : 'error');
        
        if (result.success) {
            event.target.reset();
        }
    } catch (error) {
        showNotification('Subscription failed. Please try again.', 'error');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
};

window.handleStoryForm = async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Get files
    const files = [];
    const fileInputs = event.target.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        if (input.files.length > 0) {
            files.push(...input.files);
        }
    });
    
    const button = event.target.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;
    button.innerHTML = 'Publishing...';
    button.disabled = true;
    
    try {
        const result = await window.kagwiriaBackend.addStory(data, files);
        showNotification(result.message, result.success ? 'success' : 'error');
        
        if (result.success) {
            event.target.reset();
            // Reload stories if on stories page
            if (window.blogSystem) {
                window.blogSystem.loadStories();
            }
        }
    } catch (error) {
        showNotification('Failed to publish story. Please try again.', 'error');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
};

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

console.log('Backend loaded successfully');