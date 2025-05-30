// ===== DOM Elements =====
const storyForm = document.getElementById('storyForm');
const storyList = document.getElementById('storyList');
const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');
const navSearch = document.getElementById('navSearch');
const startWritingBtn = document.getElementById('startWritingBtn');
const exploreBtn = document.getElementById('exploreBtn');
const storyCreationPanel = document.getElementById('storyCreationPanel');
const closePanelBtn = document.getElementById('closePanelBtn');
const saveDraftBtn = document.getElementById('saveDraftBtn');
const previewBtn = document.getElementById('previewBtn');
const previewModal = document.getElementById('previewModal');
const closePreview = document.querySelector('.close-preview');
const storyModal = document.getElementById('storyModal');
const modalContent = document.getElementById('modalContent');
const profileModal = document.getElementById('profileModal');
const authModal = document.getElementById('authModal');
const authBtn = document.getElementById('authBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userAvatar = document.getElementById('userAvatar');
const profileAvatar = document.getElementById('profileAvatar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const switchAuthLinks = document.querySelectorAll('.switch-auth');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// ===== App State =====
let stories = [];
let currentUser = null;
let currentTheme = localStorage.getItem('theme') || 'dark';
let currentFilter = 'all';
let currentSort = 'newest';
let drafts = [];
let bookmarks = [];
let isLoading = false;
let currentPage = 1;
let hasMoreStories = true;

// ===== Initialize App =====
function init() {
  // Set theme
  setTheme(currentTheme);
  
  // Load data
  loadData();
  
  // Set up event listeners
  setupEventListeners();
  
  // Check auth status
  checkAuthStatus();
  
  // Load initial stories
  loadStories();
}

// ===== Data Loading =====
function loadData() {
  // Load stories from localStorage or API
  const savedStories = localStorage.getItem('marvelStories');
  stories = savedStories ? JSON.parse(savedStories) : [];
  
  // Load drafts
  const savedDrafts = localStorage.getItem('storyDrafts');
  drafts = savedDrafts ? JSON.parse(savedDrafts) : [];
  
  // Load bookmarks
  const savedBookmarks = localStorage.getItem('bookmarks');
  bookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];
  
  // If no stories, load sample data
  if (stories.length === 0) {
    loadSampleData();
  }
}

// ===== Theme Functions =====
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Update toggle buttons
  if (theme === 'dark') {
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    if (mobileThemeToggle) mobileThemeToggle.checked = false;
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    if (mobileThemeToggle) mobileThemeToggle.checked = true;
  }
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(currentTheme);
}

// ===== Auth Functions =====
function checkAuthStatus() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateAuthUI(true);
  } else {
    updateAuthUI(false);
  }
}

function updateAuthUI(isLoggedIn) {
  if (isLoggedIn) {
    authBtn.style.display = 'none';
    document.querySelector('.user-avatar').classList.add('logged-in');
    userAvatar.src = currentUser.avatar;
    profileAvatar.src = currentUser.avatar;
  } else {
    authBtn.style.display = 'block';
    document.querySelector('.user-avatar').classList.remove('logged-in');
  }
}

function login(username, password) {
  // In a real app, this would call your backend API
  // For demo purposes, we'll just create a user
  
  currentUser = {
    id: `user_${Date.now()}`,
    username,
    avatar: 'assets/default-avatar.png',
    favoriteCharacter: 'spiderman',
    joinedAt: new Date().toISOString()
  };
  
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  updateAuthUI(true);
  authModal.style.display = 'none';
  showToast('Login successful!', 'success');
}

function register(username, email, password, avatar) {
  // In a real app, this would call your backend API
  // For demo purposes, we'll just create a user
  
  currentUser = {
    id: `user_${Date.now()}`,
    username,
    email,
    avatar: `assets/${avatar}-icon.png`,
    favoriteCharacter: avatar,
    joinedAt: new Date().toISOString()
  };
  
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  updateAuthUI(true);
  authModal.style.display = 'none';
  showToast('Registration successful!', 'success');
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  updateAuthUI(false);
  profileModal.style.display = 'none';
  showToast('Logged out successfully', 'info');
}

// ===== Story Functions =====
function loadStories() {
  if (isLoading || !hasMoreStories) return;
  
  isLoading = true;
  
  // Show loading state
  if (currentPage === 1) {
    storyList.innerHTML = `
      <div class="story-card skeleton">
        <div class="skeleton-character"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-excerpt"></div>
          <div class="skeleton-excerpt"></div>
          <div class="skeleton-meta"></div>
        </div>
      </div>
      <div class="story-card skeleton">
        <div class="skeleton-character"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-excerpt"></div>
          <div class="skeleton-excerpt"></div>
          <div class="skeleton-meta"></div>
        </div>
      </div>
      <div class="story-card skeleton">
        <div class="skeleton-character"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-excerpt"></div>
          <div class="skeleton-excerpt"></div>
          <div class="skeleton-meta"></div>
        </div>
      </div>
    `;
  }
  
  // Simulate API call delay
  setTimeout(() => {
    // Filter and sort stories
    let filteredStories = filterAndSortStories();
    
    // Pagination
    const startIdx = (currentPage - 1) * 6;
    const endIdx = startIdx + 6;
    const paginatedStories = filteredStories.slice(startIdx, endIdx);
    
    // If first page, replace content, otherwise append
    if (currentPage === 1) {
      renderStoryList(paginatedStories);
    } else {
      appendStories(paginatedStories);
    }
    
    // Update pagination state
    hasMoreStories = endIdx < filteredStories.length;
    if (!hasMoreStories) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
    }
    
    currentPage++;
    isLoading = false;
  }, 800);
}

function filterAndSortStories() {
  let filteredStories = [...stories];
  
  // Apply character filter
  if (currentFilter !== 'all') {
    filteredStories = filteredStories.filter(story => story.character === currentFilter);
  }
  
  // Apply search filter
  const searchTerm = navSearch.value.toLowerCase();
  if (searchTerm) {
    filteredStories = filteredStories.filter(story => 
      story.title.toLowerCase().includes(searchTerm) || 
      story.content.toLowerCase().includes(searchTerm) ||
      story.author.name.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply sorting
  switch (currentSort) {
    case 'newest':
      filteredStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'popular':
      filteredStories.sort((a, b) => b.votes - a.votes);
      break;
    case 'discussed':
      filteredStories.sort((a, b) => b.comments.length - a.comments.length);
      break;
    case 'views':
      filteredStories.sort((a, b) => b.views - a.views);
      break;
  }
  
  return filteredStories;
}

function renderStoryList(storiesToRender) {
  if (storiesToRender.length === 0) {
    storyList.innerHTML = `
      <div class="empty-state marvel-card">
        <i class="fas fa-book-open"></i>
        <h3>No stories found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    `;
    return;
  }
  
  storyList.innerHTML = storiesToRender.map(story => createStoryCard(story)).join('');
}

function appendStories(storiesToAppend) {
  const storyCards = storiesToAppend.map(story => createStoryCard(story)).join('');
  storyList.insertAdjacentHTML('beforeend', storyCards);
}

function createStoryCard(story) {
  return `
    <div class="story-card" data-id="${story.id}">
      <div class="story-character">
        <img src="assets/${story.character}-icon.png" alt="${story.character}">
      </div>
      <div class="story-content">
        <h3 class="story-title">${story.title}</h3>
        <p class="story-excerpt">${story.content.substring(0, 150)}${story.content.length > 150 ? '...' : ''}</p>
        <div class="story-meta">
          <span class="author">By ${story.author.name}</span>
          <span class="date">${formatDate(story.createdAt)}</span>
        </div>
        <div class="story-stats">
          <span class="stat"><i class="fas fa-thumbs-up"></i> ${story.votes}</span>
          <span class="stat"><i class="fas fa-comment"></i> ${story.comments.length}</span>
          <span class="stat"><i class="fas fa-eye"></i> ${story.views}</span>
        </div>
      </div>
      <button class="btn btn-sm btn-outline story-read-btn">Read Story</button>
    </div>
  `;
}

function handleStorySubmit(e) {
  e.preventDefault();
  
  if (!currentUser) {
    showToast('Please login to publish a story', 'warning');
    authModal.style.display = 'block';
    return;
  }
  
  const title = document.getElementById('title').value.trim();
  const character = document.getElementById('character').value;
  const era = document.getElementById('era').value;
  const content = document.getElementById('content').value.trim();
  const series = document.getElementById('series').value;
  const chapter = document.getElementById('chapter').value;
  const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
  
  if (title && character && content) {
    const newStory = {
      id: `story_${Date.now()}`,
      title,
      character,
      era,
      content,
      series: series || null,
      chapter: chapter || 1,
      tags,
      author: {
        id: currentUser.id,
        name: currentUser.username,
        avatar: currentUser.avatar
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      votes: 0,
      comments: [],
      userVotes: {},
      views: 0,
      wordCount: content.split(/\s+/).length
    };
    
    stories.unshift(newStory);
    saveStories();
    
    // Reset form and close panel
    storyForm.reset();
    storyCreationPanel.classList.remove('active');
    
    // Show success message
    showToast('Story published successfully!', 'success');
    
    // Reload stories
    currentPage = 1;
    loadStories();
    
    // Add to user's stories
    addToUserStories(newStory.id);
  }
}

function saveDraft() {
  const title = document.getElementById('title').value.trim();
  const character = document.getElementById('character').value;
  const era = document.getElementById('era').value;
  const content = document.getElementById('content').value.trim();
  const series = document.getElementById('series').value;
  const chapter = document.getElementById('chapter').value;
  const tags = document.getElementById('tags').value;
  
  if (title || content) {
    const newDraft = {
      id: `draft_${Date.now()}`,
      title,
      character,
      era,
      content,
      series,
      chapter,
      tags,
      updatedAt: new Date().toISOString(),
      wordCount: content.split(/\s+/).length
    };
    
    // Remove any existing empty drafts
    drafts = drafts.filter(d => !(d.title === '' && d.content === ''));
    
    drafts.unshift(newDraft);
    localStorage.setItem('storyDrafts', JSON.stringify(drafts));
    
    // Reset form and close panel
    storyForm.reset();
    storyCreationPanel.classList.remove('active');
    
    showToast('Draft saved!', 'success');
  } else {
    showToast('Nothing to save', 'warning');
  }
}

function showPreview() {
  const title = document.getElementById('title').value.trim() || 'Untitled Story';
  const content = document.getElementById('content').value.trim() || 'No content yet...';
  
  document.getElementById('previewTitle').textContent = title;
  document.getElementById('previewAuthor').textContent = currentUser ? `By ${currentUser.username}` : 'By Anonymous';
  document.getElementById('previewDate').textContent = 'Just now';
  document.getElementById('previewBody').innerHTML = `<p>${content.replace(/\n\n/g, '</p><p>')}</p>`;
  
  previewModal.classList.add('active');
}

function openStoryModal(storyId) {
  const story = stories.find(s => s.id === storyId);
  if (!story) return;
  
  // Increment views
  story.views++;
  saveStories();
  
  // Render modal content
  modalContent.innerHTML = `
    <div class="story-header">
      <div class="story-character">
        <img src="assets/${story.character}-icon.png" alt="${story.character}">
      </div>
      <div>
        <h2 class="story-title">${story.title}</h2>
        <div class="story-meta">
          <span>By ${story.author.name}</span>
          <span>• ${formatDate(story.createdAt)}</span>
          ${story.era !== 'modern' ? `<span>• ${story.era}</span>` : ''}
          ${story.series ? `<span>• ${story.series} #${story.chapter}</span>` : ''}
        </div>
      </div>
    </div>
    <div class="story-content">
      ${story.content}
    </div>
    <div class="story-actions">
      <div class="action-buttons">
        <button class="action-btn ${story.userVotes[currentUser?.id] === 1 ? 'active' : ''}" 
                onclick="handleVote('${story.id}', 1, event)">
          <i class="fas fa-thumbs-up"></i>
          <span>${story.votes > 0 ? story.votes : ''}</span>
        </button>
        <button class="action-btn" onclick="handleBookmark('${story.id}', event)">
          <i class="fas fa-bookmark"></i>
          <span>Save</span>
        </button>
      </div>
      <div class="story-stats">
        <div class="story-stat">
          <i class="fas fa-eye"></i>
          <span>${story.views}</span>
        </div>
        <div class="story-stat">
          <i class="fas fa-comment"></i>
          <span>${story.comments.length}</span>
        </div>
      </div>
    </div>
    <div class="comments-section">
      <h3><i class="fas fa-comments"></i> Comments (${story.comments.length})</h3>
      <form class="comment-form" onsubmit="handleComment(event, '${story.id}')">
        <div class="comment-input-container">
          <img src="${currentUser?.avatar || 'assets/default-avatar.png'}" 
               alt="${currentUser?.username || 'Anonymous'}" 
               class="comment-avatar">
          <input type="text" class="comment-input" placeholder="Add your comment..." required>
        </div>
        <button type="submit" class="btn btn-red">
          <i class="fas fa-paper-plane"></i> Post
        </button>
      </form>
      <div class="comment-list">
        ${story.comments.length > 0 ? 
          story.comments.map(comment => `
            <div class="comment-card">
              <img src="${comment.author.avatar || 'assets/default-avatar.png'}" 
                   alt="${comment.author.name}" 
                   class="comment-avatar">
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">${comment.author.name}</span>
                  <span class="comment-date">${formatDate(comment.createdAt)}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
              </div>
            </div>
          `).join('') : 
          `<div class="empty-comments">
            <i class="fas fa-comment-slash"></i>
            <p>No comments yet. Be the first to comment!</p>
          </div>`
        }
      </div>
    </div>
  `;
  
  storyModal.style.display = 'block';
}

function handleVote(storyId, value, e) {
  if (e) e.stopPropagation();
  
  if (!currentUser) {
    showToast('Please login to vote', 'warning');
    authModal.style.display = 'block';
    return;
  }
  
  const story = stories.find(s => s.id === storyId);
  if (!story) return;
  
  if (!story.userVotes) {
    story.userVotes = {};
  }
  
  // Check if user already voted
  if (currentUser.id in story.userVotes) {
    // If clicking same vote again, remove vote
    if (story.userVotes[currentUser.id] === value) {
      story.votes -= value;
      delete story.userVotes[currentUser.id];
    } else {
      // If changing vote, adjust by 2 (remove old, add new)
      story.votes += value * 2;
      story.userVotes[currentUser.id] = value;
    }
  } else {
    // New vote
    story.votes += value;
    story.userVotes[currentUser.id] = value;
  }
  
  saveStories();
  
  // Update the vote button in the modal
  if (storyModal.style.display === 'block') {
    const voteBtn = modalContent.querySelector('.action-btn');
    if (voteBtn) {
      voteBtn.classList.toggle('active', story.userVotes[currentUser.id] === 1);
      const voteCount = voteBtn.querySelector('span');
      if (voteCount) {
        voteCount.textContent = story.votes > 0 ? story.votes : '';
      }
    }
  }
  
  // Update the story card in the list
  const storyCard = document.querySelector(`.story-card[data-id="${storyId}"]`);
  if (storyCard) {
    const voteStat = storyCard.querySelector('.story-stat i.fa-thumbs-up');
    if (voteStat) {
      voteStat.nextElementSibling.textContent = story.votes;
    }
  }
}

function handleComment(e, storyId) {
  e.preventDefault();
  
  if (!currentUser) {
    showToast('Please login to comment', 'warning');
    authModal.style.display = 'block';
    return;
  }
  
  const commentInput = e.target.querySelector('.comment-input');
  const commentText = commentInput.value.trim();
  
  if (commentText) {
    const story = stories.find(s => s.id === storyId);
    if (story) {
      story.comments.unshift({
        id: `comment_${Date.now()}`,
        text: commentText,
        author: {
          id: currentUser.id,
          name: currentUser.username,
          avatar: currentUser.avatar
        },
        createdAt: new Date().toISOString()
      });
      
      saveStories();
      openStoryModal(storyId);
      commentInput.value = '';
      
      showToast('Comment added!', 'success');
    }
  }
}

function handleBookmark(storyId, e) {
  if (e) e.stopPropagation();
  
  if (!currentUser) {
    showToast('Please login to bookmark', 'warning');
    authModal.style.display = 'block';
    return;
  }
  
  const story = stories.find(s => s.id === storyId);
  if (!story) return;
  
  const bookmarkIndex = bookmarks.findIndex(b => b.storyId === storyId && b.userId === currentUser.id);
  
  if (bookmarkIndex === -1) {
    bookmarks.unshift({
      storyId,
      userId: currentUser.id,
      title: story.title,
      character: story.character,
      addedAt: new Date().toISOString()
    });
    showToast('Story bookmarked!', 'success');
  } else {
    bookmarks.splice(bookmarkIndex, 1);
    showToast('Bookmark removed', 'info');
  }
  
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

// ===== User Stories Management =====
function addToUserStories(storyId) {
  if (!currentUser) return;
  
  let userStories = JSON.parse(localStorage.getItem('userStories')) || {};
  if (!userStories[currentUser.id]) {
    userStories[currentUser.id] = [];
  }
  
  if (!userStories[currentUser.id].includes(storyId)) {
    userStories[currentUser.id].unshift(storyId);
    localStorage.setItem('userStories', JSON.stringify(userStories));
  }
}

// ===== Helper Functions =====
function saveStories() {
  localStorage.setItem('marvelStories', JSON.stringify(stories));
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas fa-${
      type === 'success' ? 'check-circle' : 
      type === 'error' ? 'times-circle' : 
      type === 'warning' ? 'exclamation-circle' : 'info-circle'
    }"></i>
    <span>${message}</span>
  `;
  document.getElementById('toastContainer').appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }, 100);
}

function loadSampleData() {
  stories = [
    {
      id: 'story_1',
      title: 'Spider-Man: The Lost Years',
      character: 'spiderman',
      era: '1990s',
      content: 'After the events of the Clone Saga, Peter Parker finds himself in a strange new reality where he never married Mary Jane. As he navigates this unfamiliar world, he discovers shocking truths about his past and must decide whether to try to return to his old life or embrace this new beginning. Along the way, he encounters alternate versions of his friends and foes, including a heroic Norman Osborn who never became the Green Goblin.',
      author: {
        id: 'user_1',
        name: 'ComicFan42',
        avatar: 'assets/default-avatar.png'
      },
      createdAt: '2023-05-15T10:30:00Z',
      updatedAt: '2023-05-15T10:30:00Z',
      votes: 24,
      comments: [
        {
          id: 'comment_1',
          text: 'This is an amazing take on the Clone Saga aftermath! Would love to see more of this alternate Norman Osborn.',
          author: {
            id: 'user_2',
            name: 'MarvelReader',
            avatar: 'assets/default-avatar.png'
          },
          createdAt: '2023-05-16T08:45:00Z'
        }
      ],
      userVotes: { 'user_1': 1, 'user_2': 1 },
      views: 156,
      wordCount: 98,
      tags: ['spiderman', '1990s']
    },
    {
      id: 'story_2',
      title: 'Iron Man: Extremis Evolution',
      character: 'ironman',
      era: 'modern',
      content: 'Tony Stark pushes the Extremis technology further than ever before, integrating it with his latest armor to create a symbiotic relationship between man and machine. But when the system begins developing its own consciousness, Tony must confront the ethical dilemmas of creating true AI while battling a new techno-organic threat that seeks to assimilate all of Stark Industries\' inventions.',
      author: {
        id: 'user_3',
        name: 'TechWriter',
        avatar: 'assets/default-avatar.png'
      },
      createdAt: '2023-05-10T14:20:00Z',
      updatedAt: '2023-05-10T14:20:00Z',
      votes: 42,
      comments: [],
      userVotes: {},
      views: 203,
      wordCount: 87,
      tags: ['ironman', 'modern']
    },
    {
      id: 'story_3',
      title: 'Black Panther: The Golden Tribe',
      character: 'blackpanther',
      era: 'alternate',
      content: 'In an alternate Wakanda where vibranium was discovered centuries later, T\'Challa must navigate a world where his nation never became the technological powerhouse it is in our reality. Without the advantage of vibranium, how does Wakanda maintain its sovereignty? This story explores a Wakanda that developed its strength through diplomacy and economic strategy rather than superior technology.',
      author: {
        id: 'user_4',
        name: 'WakandaForever',
        avatar: 'assets/default-avatar.png'
      },
      createdAt: '2023-05-05T09:15:00Z',
      updatedAt: '2023-05-05T09:15:00Z',
      votes: 18,
      comments: [
        {
          id: 'comment_2',
          text: 'Fascinating premise! I especially liked how you handled the Dora Milaje in this version.',
          author: {
            id: 'user_5',
            name: 'ComicHistorian',
            avatar: 'assets/default-avatar.png'
          },
          createdAt: '2023-05-06T11:30:00Z'
        },
        {
          id: 'comment_3',
          text: 'Would love to see this expanded into a full series!',
          author: {
            id: 'user_1',
            name: 'ComicFan42',
            avatar: 'assets/default-avatar.png'
          },
          createdAt: '2023-05-07T16:45:00Z'
        }
      ],
      userVotes: { 'user_4': 1, 'user_5': 1 },
      views: 127,
      wordCount: 76,
      tags: ['blackpanther', 'alternate']
    }
  ];
  saveStories();
}

// ===== Event Listeners Setup =====
function setupEventListeners() {
  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);
  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener('change', () => toggleTheme());
  }
  
  // Story creation
  startWritingBtn.addEventListener('click', () => {
    if (!currentUser) {
      showToast('Please login to write a story', 'warning');
      authModal.style.display = 'block';
      return;
    }
    storyCreationPanel.classList.add('active');
    document.getElementById('title').focus();
  });
  
  closePanelBtn.addEventListener('click', () => storyCreationPanel.classList.remove('active'));
  saveDraftBtn.addEventListener('click', saveDraft);
  previewBtn.addEventListener('click', showPreview);
  closePreview.addEventListener('click', () => previewModal.classList.remove('active'));
  
  // Story interactions
  storyForm.addEventListener('submit', handleStorySubmit);
  
  // Modal close buttons
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.marvel-modal').style.display = 'none';
    });
  });
  
  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('marvel-modal')) {
      e.target.style.display = 'none';
    }
    if (e.target.classList.contains('preview-modal')) {
      e.target.classList.remove('active');
    }
  });
  
  // Auth buttons
  authBtn.addEventListener('click', () => authModal.style.display = 'block');
  logoutBtn.addEventListener('click', logout);
  
  // Auth tabs
  authTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      
      // Update active tab
      authTabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      
      // Show corresponding form
      authForms.forEach(form => form.classList.remove('active'));
      document.getElementById(`${tabName}Form`).classList.add('active');
    });
  });
  
  // Switch between login/register
  switchAuthLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = link.classList.contains('switch-auth') ? 
        (link.textContent.includes('Login') ? 'login' : 'register') : 
        e.target.dataset.tab;
      
      // Update active tab
      authTabs.forEach(t => t.classList.remove('active'));
      document.querySelector(`.auth-tab[data-tab="${targetTab}"]`).classList.add('active');
      
      // Show corresponding form
      authForms.forEach(form => form.classList.remove('active'));
      document.getElementById(`${targetTab}Form`).classList.add('active');
    });
  });
  
  // Login form
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (username && password) {
      login(username, password);
    }
  });
  
  // Register form
  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const avatar = document.querySelector('.avatar-option.active')?.dataset.avatar || 'spiderman';
    
    if (username && email && password) {
      register(username, email, password, avatar);
    }
  });
  
  // Avatar selection
  document.querySelectorAll('.avatar-option').forEach(option => {
    option.addEventListener('click', (e) => {
      document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
  
  // Mobile menu
  mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.add('active'));
  
  // Close mobile menu when clicking a link
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('active'));
  });
  
  // Search functionality
  navSearch.addEventListener('input', () => {
    currentPage = 1;
    loadStories();
  });
  
  // Load more stories
  loadMoreBtn.addEventListener('click', loadStories);
  
  // Word count for textarea
  document.getElementById('content').addEventListener('input', updateWordCount);
  
  // Character count for textarea
  document.getElementById('content').addEventListener('input', updateCharacterCount);
  
  // Story card clicks (delegated)
  storyList.addEventListener('click', (e) => {
    const storyCard = e.target.closest('.story-card');
    if (storyCard) {
      const storyId = storyCard.dataset.id;
      openStoryModal(storyId);
    }
  });
}

function updateWordCount() {
  const content = document.getElementById('content').value;
  const wordCount = content.trim() === '' ? 0 : content.split(/\s+/).length;
  document.querySelector('.word-count').textContent = `${wordCount}/10,000 words`;
}

function updateCharacterCount() {
  const content = document.getElementById('content').value;
  document.querySelector('.character-count').textContent = `${content.length} characters`;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);