
// Main JavaScript file for portfolio

// Helper function to get the correct base path for content
function getContentPath(path) {
    // If we're on localhost or file://, use relative paths
    // Otherwise, use absolute paths (production)
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:') {
        return `./${path}`;
    }
    return `/${path}`;
}

// Content loading functions
async function loadContent() {
    try {
        // Load hero content
        await loadHeroContent();
        
        // Load about content
        await loadAboutContent();
        
        // Load skills
        await loadSkills();
        
        // Load projects
        await loadProjects();
        
        // Load blog posts
        await loadBlogPosts();
        
        // Load contact info
        await loadContactInfo();
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Load hero section content
async function loadHeroContent() {
    try {
        const response = await fetch(getContentPath('content/hero.json'));
        const data = await response.json();
        
        document.getElementById('hero-name').textContent = data.name;
        document.getElementById('hero-tagline').textContent = data.tagline;
        document.getElementById('hero-intro').textContent = data.intro;
    } catch (error) {
        console.error('Error loading hero content:', error);
    }
}

// Load about section content
async function loadAboutContent() {
    try {
        const response = await fetch(getContentPath('content/about.json'));
        const data = await response.json();
        
        document.getElementById('about-image').src = data.image;
        document.getElementById('about-bio').textContent = data.bio;
        document.getElementById('about-background').textContent = data.background;
    } catch (error) {
        console.error('Error loading about content:', error);
    }
}

// Load skills
async function loadSkills() {
    try {
        const skillsContainer = document.getElementById('skills-container');
        const skillFiles = await getContentFiles('skills');
        
        skillsContainer.innerHTML = '';
        
        for (const file of skillFiles) {
            const response = await fetch(getContentPath(`content/skills/${file}`));
            const skill = await response.json();
            
            const skillCard = createSkillCard(skill);
            skillsContainer.appendChild(skillCard);
        }
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

// Create skill card element
function createSkillCard(skill) {
    const card = document.createElement('div');
    card.className = 'skill-card bg-white p-6 rounded-lg shadow-md text-center';
    
    card.innerHTML = `
        <i class="${skill.icon} text-4xl text-blue-600 mb-4"></i>
        <h3 class="text-lg font-semibold mb-2">${skill.name}</h3>
        <div class="progress-bar mt-4">
            <div class="progress-fill" style="width: ${skill.level}%"></div>
        </div>
        <p class="text-sm text-gray-600 mt-2">${skill.level}%</p>
    `;
    
    return card;
}

// Load projects
async function loadProjects() {
    try {
        const projectsContainer = document.getElementById('projects-container');
        const projectFiles = await getContentFiles('projects');
        
        projectsContainer.innerHTML = '';
        
        const projects = [];
        for (const file of projectFiles) {
            const response = await fetch(getContentPath(`content/projects/${file}`));
            const project = await response.json();
            projects.push(project);
        }
        
        // Sort projects by order
        projects.sort((a, b) => (b.order || 0) - (a.order || 0));
        
        projects.forEach(project => {
            const projectCard = createProjectCard(project);
            projectsContainer.appendChild(projectCard);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Create project card element
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card bg-white rounded-lg shadow-md overflow-hidden';
    
    const techList = project.technologies.map(tech => 
        `<span class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">${tech}</span>`
    ).join(' ');
    
    const links = [];
    if (project.liveUrl) {
        links.push(`<a href="${project.liveUrl}" target="_blank" class="text-blue-600 hover:underline">Live Demo</a>`);
    }
    if (project.githubUrl) {
        links.push(`<a href="${project.githubUrl}" target="_blank" class="text-blue-600 hover:underline">GitHub</a>`);
    }
    
    card.innerHTML = `
        <img src="${project.image}" alt="${project.title}" class="w-full h-48 object-cover">
        <div class="p-6">
            <h3 class="text-xl font-semibold mb-2">${project.title}</h3>
            <p class="text-gray-700 mb-4">${project.description}</p>
            <div class="flex flex-wrap gap-2 mb-4">
                ${techList}
            </div>
            <div class="flex gap-4">
                ${links.join(' ')}
            </div>
        </div>
    `;
    
    return card;
}

// Load blog posts
async function loadBlogPosts() {
    try {
        const blogContainer = document.getElementById('blog-container');
        const blogFiles = await getContentFiles('blog');
        
        blogContainer.innerHTML = '';
        
        const posts = [];
        for (const file of blogFiles) {
            const response = await fetch(getContentPath(`content/blog/${file}`));
            const post = await response.json();
            posts.push(post);
        }
        
        // Sort posts by date (newest first)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Display only the latest 3 posts
        posts.slice(0, 3).forEach(post => {
            const blogCard = createBlogCard(post);
            blogContainer.appendChild(blogCard);
        });
    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}

// Create blog card element
function createBlogCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card bg-white rounded-lg shadow-md overflow-hidden';
    
    const date = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const imageHtml = post.image 
        ? `<img src="${post.image}" alt="${post.title}" class="w-full h-48 object-cover">`
        : '';
    
    card.innerHTML = `
        ${imageHtml}
        <div class="p-6">
            <p class="text-sm text-gray-600 mb-2">${date}</p>
            <h3 class="text-xl font-semibold mb-2">${post.title}</h3>
            <p class="text-gray-700 mb-4">${post.excerpt}</p>
            <a href="#" class="text-blue-600 hover:underline">Read More →</a>
        </div>
    `;
    
    return card;
}

// Load contact information
async function loadContactInfo() {
    try {
        const response = await fetch(getContentPath('content/contact.json'));
        const data = await response.json();
        
        const contactInfo = document.getElementById('contact-info');
        const socialLinks = [];
        
        if (data.email && data.email !== "your.email@example.com") {
            socialLinks.push(`<a href="mailto:${data.email}" class="text-gray-700 hover:text-blue-600"><i class="fas fa-envelope text-2xl"></i></a>`);
        }
        if (data.github) {
            socialLinks.push(`<a href="${data.github}" target="_blank" class="text-gray-700 hover:text-blue-600"><i class="fab fa-github text-2xl"></i></a>`);
        }
        
        contactInfo.innerHTML = `
            <p class="text-lg mb-4">${data.location || ''}</p>
            <div class="flex justify-center gap-6">
                ${socialLinks.join(' ')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading contact info:', error);
    }
}

// Helper function to get content files (100% CMS-driven - no hardcoded files)
async function getContentFiles(folder) {
    try {
        // Try to load content index generated by CMS or build process
        const indexResponse = await fetch(getContentPath(`content/${folder}/index.json`));
        if (indexResponse.ok) {
            const index = await indexResponse.json();
            return index.files || [];
        }
    } catch (e) {
        // No index file found - this is expected until CMS generates content
    }
    
    // Return empty array - content will be added via CMS only
    return [];
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const body = document.body;
    
    // Create mobile menu
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.innerHTML = `
        <div class="p-6">
            <button class="close-menu text-2xl mb-8">
                <i class="fas fa-times"></i>
            </button>
            <nav class="flex flex-col space-y-4">
                <a href="#home" class="text-lg hover:text-blue-600">Home</a>
                <a href="#about" class="text-lg hover:text-blue-600">About</a>
                <a href="#skills" class="text-lg hover:text-blue-600">Skills</a>
                <a href="#projects" class="text-lg hover:text-blue-600">Projects</a>
                <a href="#blog" class="text-lg hover:text-blue-600">Blog</a>
                <a href="#contact" class="text-lg hover:text-blue-600">Contact</a>
            </nav>
        </div>
    `;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    
    body.appendChild(mobileMenu);
    body.appendChild(overlay);
    
    // Toggle menu
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
    });
    
    // Close menu
    const closeBtn = mobileMenu.querySelector('.close-menu');
    closeBtn.addEventListener('click', closeMobileMenu);
    overlay.addEventListener('click', closeMobileMenu);
    
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    document.body.appendChild(themeToggle);
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        
        themeToggle.innerHTML = isDark 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// Contact form handling
function initContactForm() {
    const form = document.getElementById('contact-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // In a real implementation, this would send to a backend
        console.log('Form submitted:', data);
        
        // Show success message
        alert('Thank you for your message! I will get back to you soon.');
        form.reset();
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    initMobileMenu();
    initThemeToggle();
    initContactForm();
    
    // Add Netlify Identity widget
    if (window.netlifyIdentity) {
        window.netlifyIdentity.on("init", user => {
            if (!user) {
                window.netlifyIdentity.on("login", () => {
                    document.location.href = "/admin/";
                });
            }
        });
    }
}); 