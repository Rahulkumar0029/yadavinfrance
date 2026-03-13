document.addEventListener('DOMContentLoaded', () => {
    // Initialize Particles.js with heart shapes
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": { "value": 40, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#ff758c" },
                "shape": {
                    "type": "heart",
                    "stroke": { "width": 0, "color": "#000000" }
                },
                "opacity": {
                    "value": 0.3,
                    "random": true,
                    "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false }
                },
                "size": {
                    "value": 15,
                    "random": true,
                    "anim": { "enable": false, "speed": 40, "size_min": 0.1, "sync": false }
                },
                "line_linked": { "enable": false },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "top",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": true, "mode": "bubble" },
                    "onclick": { "enable": true, "mode": "push" },
                    "resize": true
                },
                "modes": {
                    "bubble": { "distance": 200, "size": 25, "duration": 2, "opacity": 0.8, "speed": 3 },
                    "push": { "particles_nb": 4 }
                }
            },
            "retina_detect": true
        });
    }

    // SPA Navigation
    const navLinks = document.querySelectorAll('.nav-links a');
    const pages = document.querySelectorAll('.page');

    function navigate() {
        const hash = window.location.hash || '#home';

        // Update active link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === hash) {
                link.classList.add('active');
            }
        });

        // Update active page
        pages.forEach(page => {
            page.classList.remove('active');
            if (`#${page.id}` === hash) {
                page.classList.add('active');
            }
        });

        // Special handling for hash changes
        window.scrollTo(0, 0);
    }

    window.addEventListener('hashchange', navigate);
    navigate(); // Initial call

    // Fetch Memories & Populate Timeline/Gallery
    let memoriesData = [];

    async function loadMemories() {
        try {
            const response = await fetch('data/memories.json');
            memoriesData = await response.json();

            updateDaysCounter();
            renderTimeline();
            renderGallery();
        } catch (error) {
            console.error('Error loading memories:', error);
        }
    }

    function updateDaysCounter() {
        const countElement = document.getElementById('days-count');
        if (countElement) {
            countElement.textContent = memoriesData.length;
        }
    }

    function renderTimeline() {
        const timelineList = document.getElementById('timeline-list');
        if (!timelineList) return;

        timelineList.innerHTML = memoriesData.map((m, index) => `
            <div class="timeline-item ${index % 2 === 0 ? 'left' : 'right'}" onclick="openMemory(${index})">
                <div class="timeline-dot"></div>
                <div class="timeline-content glass hover-scale">
                    <span class="date">${formatDate(m.date)}</span>
                    <h3>${m.title}</h3>
                    <p>${m.memory.substring(0, 100)}...</p>
                    <div class="timeline-emoji">${m.emoji}</div>
                </div>
            </div>
        `).join('');
    }

    function renderGallery() {
        const galleryGrid = document.getElementById('gallery-grid');
        if (!galleryGrid) return;

        galleryGrid.innerHTML = memoriesData.map((m, index) => `
            <div class="gallery-item glass" onclick="openMemory(${index})">
                <img src="${m.photo}" alt="${m.title}" loading="lazy">
                <div class="gallery-overlay">
                    <span>${formatDateShort(m.date)}</span>
                </div>
            </div>
        `).join('');
    }

    function formatDate(dateStr) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    }

    function formatDateShort(dateStr) {
        const options = { month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    }

    // Modal Logic
    window.openMemory = function (index) {
        const memory = memoriesData[index];
        const modal = document.getElementById('memory-modal');
        const modalBody = document.getElementById('modal-body');

        modalBody.innerHTML = `
            <div class="modal-grid">
                <div class="modal-image">
                    <img src="${memory.photo}" alt="${memory.title}">
                </div>
                <div class="modal-info">
                    <span class="modal-date">${formatDate(memory.date)} ${memory.emoji}</span>
                    <h2>${memory.title}</h2>
                    <div class="modal-highlight">
                        <i class="fas fa-quote-left"></i>
                        <p>${memory.highlight}</p>
                    </div>
                    <p class="modal-text">${memory.memory}</p>
                    <div class="modal-quote glass">
                        <p>"${memory.quote}"</p>
                    </div>
                </div>
            </div>
        `;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.onclick = () => {
            document.getElementById('memory-modal').style.display = 'none';
            document.body.style.overflow = 'auto';
        };
    }

    window.onclick = (event) => {
        const modal = document.getElementById('memory-modal');
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    // Music Toggle Logic
    const musicBtn = document.getElementById('music-btn');
    let isPlaying = false;
    const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); // Placeholder romantic track
    audio.loop = true;

    musicBtn.onclick = () => {
        if (isPlaying) {
            audio.pause();
            musicBtn.classList.remove('playing');
        } else {
            audio.play();
            musicBtn.classList.add('playing');
        }
        isPlaying = !isPlaying;
    };

    // Calendar Logic
    let currentDate = new Date(2026, 1, 21); // Start from Feb 21, 2026
    const minDate = new Date(2026, 1, 21);
    const maxDate = new Date(2026, 6, 30); // End July 30, 2026

    function renderCalendar() {
        const calendarDays = document.getElementById('calendar-days');
        const monthYearText = document.getElementById('current-month-year');
        if (!calendarDays || !monthYearText) return;

        calendarDays.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthYearText.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty slots for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('cal-day', 'empty');
            calendarDays.appendChild(emptyDay);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEl = document.createElement('div');
            dayEl.classList.add('cal-day');

            const dayNum = document.createElement('span');
            dayNum.classList.add('day-num');
            dayNum.textContent = day;
            dayEl.appendChild(dayNum);

            // Check if there's a memory for this date
            const memoryIndex = memoriesData.findIndex(m => m.date === dateStr);
            if (memoryIndex !== -1) {
                dayEl.classList.add('has-memory');
                const heart = document.createElement('i');
                heart.classList.add('fas', 'fa-heart', 'heart-marker');
                dayEl.appendChild(heart);
                dayEl.onclick = () => openMemory(memoryIndex);
            }

            // Disable days outside the range
            const dayDate = new Date(year, month, day);
            if (dayDate < minDate || dayDate > maxDate) {
                dayEl.style.opacity = '0.3';
                dayEl.style.pointerEvents = 'none';
            }

            calendarDays.appendChild(dayEl);
        }
    }

    document.getElementById('prev-month').onclick = () => {
        if (currentDate.getMonth() > 1 || currentDate.getFullYear() > 2026) {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        }
    };

    document.getElementById('next-month').onclick = () => {
        if (currentDate.getMonth() < 6 || currentDate.getFullYear() < 2026) {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        }
    };

    // Initialize
    loadMemories().then(() => {
        renderCalendar();
    });
    initMap();
});
