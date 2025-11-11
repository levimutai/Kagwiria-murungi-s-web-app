// Blog system for Kagwiria's stories with comments
class BlogSystem {
    
    // Load and display published stories
    async loadStories() {
        try {
            const stories = await window.kagwiriaBackend.getStories();
            const container = document.getElementById('published-stories');
            
            if (stories.length === 0) {
                return; // Show empty state
            }
            
            // Hide empty state
            document.querySelector('.empty-blog').style.display = 'none';
            
            stories.forEach(story => {
                const storyCard = this.createStoryCard(story);
                container.appendChild(storyCard);
            });
        } catch (error) {
            console.error('Error loading stories:', error);
        }
    }
    
    // Create story card HTML
    createStoryCard(story) {
        const card = document.createElement('article');
        card.className = 'story-card';
        card.setAttribute('data-category', story.region);
        
        card.innerHTML = `
            <div class="story-image">
                ${story.files && story.files.length > 0 ? 
                    `<img src="${story.files[0].url}" alt="${story.title}">` :
                    '<div class="placeholder-image">📍</div>'
                }
            </div>
            <div class="story-content">
                <h3>${story.title}</h3>
                <p class="story-meta">${story.county} • ${story.region}</p>
                <p>${story.content.substring(0, 150)}...</p>
                <div class="story-footer">
                    <span class="read-time">${story.readTime || '5'} min read</span>
                    <div class="share-buttons">
                        <a href="https://www.facebook.com/share/1BJnUzMH2o/" class="share-btn">📘</a>
                        <a href="https://www.linkedin.com/in/kagwiriamurungi" class="share-btn">💼</a>
                    </div>
                </div>
                <button onclick="openStory('${story.id}')" class="read-more-btn">Read Full Story</button>
            </div>
        `;
        
        return card;
    }
    
    // Open full story with comments
    openStory(storyId) {
        // This would open a modal or new page with full story and comments
        window.location.href = `story.html?id=${storyId}`;
    }
    
    // Add comment to story
    async addComment(storyId, commentData) {
        try {
            await addDoc(collection(db, 'comments'), {
                storyId: storyId,
                ...commentData,
                timestamp: new Date(),
                approved: false // Comments need approval
            });
            
            return { success: true, message: 'Comment submitted for approval!' };
        } catch (error) {
            console.error('Comment error:', error);
            return { success: false, message: 'Failed to submit comment.' };
        }
    }
    
    // Filter stories by region
    filterStories(region) {
        const stories = document.querySelectorAll('.story-card');
        
        stories.forEach(story => {
            if (region === 'all' || story.getAttribute('data-category') === region) {
                story.style.display = 'block';
            } else {
                story.style.display = 'none';
            }
        });
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${region}"]`).classList.add('active');
    }
}

// Initialize blog system
window.blogSystem = new BlogSystem();

// Load stories when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('published-stories')) {
        window.blogSystem.loadStories();
    }
});

// Filter functionality
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        window.blogSystem.filterStories(filter);
    });
});

// Global function for opening stories
window.openStory = function(storyId) {
    window.blogSystem.openStory(storyId);
};