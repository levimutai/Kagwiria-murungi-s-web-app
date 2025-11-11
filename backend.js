// Backend functionality for Kagwiria's website
import { db, storage, auth } from './firebase-config.js';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Email service using EmailJS (free service)
// emailjs.init("your-emailjs-user-id"); // Get from emailjs.com - Configure when ready

class KagwiriaBackend {
    
    // Contact Form Submission
    async submitContactForm(formData) {
        try {
            // Save to database
            await addDoc(collection(db, 'contacts'), {
                ...formData,
                timestamp: new Date(),
                status: 'new'
            });

            // Send email notification
            await emailjs.send('service_id', 'template_id', {
                to_email: 'kagwiriamurungi7@gmail.com',
                from_name: formData.name,
                from_email: formData.email,
                subject: formData.subject,
                message: formData.message
            });

            return { success: true, message: 'Message sent successfully!' };
        } catch (error) {
            console.error('Contact form error:', error);
            return { success: false, message: 'Failed to send message. Please try again.' };
        }
    }

    // Newsletter Subscription
    async subscribeNewsletter(email) {
        try {
            await addDoc(collection(db, 'newsletter'), {
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
            const storageRef = ref(storage, fileName);
            
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
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
            await addDoc(collection(db, 'stories'), {
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
            const querySnapshot = await getDocs(collection(db, 'stories'));
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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Invalid email or password' };
        }
    }

    // Support/Donation Tracking
    async recordDonation(donationData) {
        try {
            await addDoc(collection(db, 'donations'), {
                ...donationData,
                timestamp: new Date(),
                status: 'pending'
            });

            // Send thank you email
            await emailjs.send('service_id', 'donation_template', {
                to_email: donationData.email,
                donor_name: donationData.name,
                amount: donationData.amount,
                purpose: donationData.purpose
            });

            return { success: true, message: 'Donation recorded. Thank you!' };
        } catch (error) {
            console.error('Donation error:', error);
            return { success: false, message: 'Failed to process donation.' };
        }
    }

    // Update Website Settings
    async updateSettings(settings) {
        try {
            await updateDoc(doc(db, 'settings', 'website'), settings);
            return { success: true, message: 'Settings updated successfully!' };
        } catch (error) {
            console.error('Settings error:', error);
            return { success: false, message: 'Failed to update settings.' };
        }
    }
}

// Create global instance
window.kagwiriaBackend = new KagwiriaBackend();

// Simple form handlers for immediate use
window.handleContactForm = async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    const result = await window.kagwiriaBackend.submitContactForm(data);
    alert(result.message);
    
    if (result.success) {
        event.target.reset();
    }
};

window.handleNewsletter = async function(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    
    const result = await window.kagwiriaBackend.subscribeNewsletter(email);
    alert(result.message);
    
    if (result.success) {
        event.target.reset();
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
    
    const result = await window.kagwiriaBackend.addStory(data, files);
    alert(result.message);
    
    if (result.success) {
        event.target.reset();
    }
};