// Blog system for Kagwiria's stories with comments
class BlogSystem {
    
    constructor() {
        this.storiesLoaded = false;
    }
    
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
                <div class="story-actions" style="margin-top: 15px;">
                    <button class="action-btn" onclick="likeStory(this)">❤️ Like</button>
                    <button class="action-btn" onclick="commentStory(this)">💬 Comment</button>
                    <button class="action-btn" onclick="shareStory(this)">🔄 Share</button>
                </div>
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
            await db.collection('comments').add({
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
    // Wait for Firebase to be ready
    setTimeout(() => {
        if (document.getElementById('published-stories')) {
            window.blogSystem.loadStories();
        }
        if (document.getElementById('stories-feed')) {
            window.blogSystem.loadStoriesForFeed();
        }
    }, 1000);
});

// Filter functionality
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        window.blogSystem.filterStories(filter);
    });
});

// Load stories for homepage feed
BlogSystem.prototype.loadStoriesForFeed = async function() {
    try {
        const stories = await window.kagwiriaBackend.getStories();
        const container = document.getElementById('stories-feed');
        
        if (!container || stories.length === 0) {
            return;
        }
        
        // Show latest 3 stories
        const latestStories = stories.slice(0, 3);
        
        latestStories.forEach(story => {
            const storyPost = document.createElement('div');
            storyPost.className = 'story-post';
            storyPost.innerHTML = `
                <div class="story-header">
                    <div class="profile-pic">👩🦱</div>
                    <div>
                        <h4>Kagwiria Murungi</h4>
                        <p class="story-meta">${story.county || 'Kenya'} • ${this.formatDate(story.published)}</p>
                    </div>
                </div>
                <div class="story-content">${story.content.substring(0, 200)}...</div>
                ${story.files && story.files.length > 0 ? 
                    `<img src="${story.files[0].url}" alt="Story image" style="width:100%; border-radius:8px; margin:10px 0;">` : 
                    ''
                }
                <div class="story-actions">
                    <button class="action-btn" onclick="likeStory(this)">❤️ Like</button>
                    <button class="action-btn" onclick="commentStory(this)">💬 Comment</button>
                    <button class="action-btn" onclick="shareStory(this)">🔄 Share</button>
                </div>
            `;
            container.appendChild(storyPost);
        });
    } catch (error) {
        console.error('Error loading stories for feed:', error);
    }
};

// Format date helper
BlogSystem.prototype.formatDate = function(date) {
    if (!date) return 'Recently';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
};

// Global function for opening stories
window.openStory = function(storyId) {
    window.blogSystem.openStory(storyId);
};