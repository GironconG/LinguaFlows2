// LinguaFlow Core Logic - Edición Japonesa
const appState = {
    user: {
        points: 0,
        completedLessons: []
    },
    currentLesson: null,
    lessons: [
        {
            id: 'reading-hiragana-1',
            category: 'Reading',
            title: 'Hiragana basics (A-O)',
            description: 'Aprende las 5 vocales fundamentales (あ, い, う, え, お).',
            icon: '🏮',
            requiredPoints: 0,
            cards: [
                { type: 'info', eng: 'A', esp: 'あ', phonetic: '/a/' },
                { type: 'info', eng: 'I', esp: 'い', phonetic: '/i/' },
                { type: 'quiz', question: '¿Cuál es el Hiragana de la vocal "A"?', options: ['あ', 'い', 'え'], correct: 0 }
            ]
        },
        {
            id: 'speaking-greetings',
            category: 'Speaking',
            title: 'Saludos de cortesía',
            description: 'Frases esenciales para el día a día.',
            icon: '👋',
            requiredPoints: 50,
            cards: [
                { type: 'info', eng: 'Hello', esp: 'Konnichiwa (こんにちは)', phonetic: '/kon-ni-chiwa/' },
                { type: 'info', eng: 'Good Morning', esp: 'Ohayou (おはよう)', phonetic: '/o-hayou/' },
                { type: 'quiz', question: '¿Cómo se dice "Hola" de forma estándar?', options: ['Sayonara', 'Konnichiwa', 'Ohayou'], correct: 1 }
            ]
        },
        {
            id: 'grammar-basics',
            category: 'Grammar',
            title: 'Estructura "Desu"',
            description: 'Cómo presentarte y definir cosas.',
            icon: '⛩️',
            requiredPoints: 100,
            cards: [
                { type: 'info', eng: 'It is...', esp: '...Desu (...です)', phonetic: '/des/' },
                { type: 'quiz', question: '¿Qué palabra se usa al final para decir "Es"?', options: ['Desu', 'Mesu', 'Kesu'], correct: 0 }
            ]
        }
    ]
};

// UI Selectors
const screens = {
    onboarding: document.getElementById('onboarding'),
    lesson: document.getElementById('lesson-view'),
    chat: document.getElementById('chat-view')
};

const nav = {
    points: document.querySelector('.stars')
};

// Initialize Gallery with Lock Logic
function renderGallery() {
    const grid = document.querySelector('.showcase-grid');
    grid.innerHTML = '';

    appState.lessons.forEach(lesson => {
        const isLocked = appState.user.points < lesson.requiredPoints;
        const item = document.createElement('div');
        item.className = `showcase-item glass ${isLocked ? 'locked' : ''}`;
        if (!isLocked) item.dataset.lesson = lesson.id;

        item.innerHTML = `
            <div class="category-tag">${lesson.category}</div>
            <div class="item-icon">${lesson.icon}</div>
            <h3>${lesson.title}</h3>
            <p>${lesson.description}</p>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${appState.user.completedLessons.includes(lesson.id) ? '100' : '0'}%"></div>
            </div>
            <span class="item-status">${isLocked ? `Necesitas ${lesson.requiredPoints}★` : 'Disponible'}</span>
        `;

        if (!isLocked) {
            item.onclick = () => {
                const l = appState.lessons.find(x => x.id === lesson.id);
                switchScreen('lesson');
                loadLesson(l);
            };
        }
        grid.appendChild(item);
    });
}

function switchScreen(screen) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[screen].classList.remove('hidden');
    if (screen === 'onboarding') renderGallery();
}

function loadLesson(lesson) {
    appState.currentLesson = lesson;
    screens.lesson.innerHTML = `
        <div class="lesson-card glass animate-slide">
            <span class="category-indicator">${lesson.category}</span>
            <h2>${lesson.title}</h2>
            <div id="card-container"></div>
            <div class="lesson-controls">
                <button id="next-card" class="btn-primary">Siguiente</button>
            </div>
        </div>
    `;
    
    let cardIndex = 0;
    const showCard = () => {
        const card = lesson.cards[cardIndex];
        const container = document.getElementById('card-container');
        
        if (card.type === 'info') {
            container.innerHTML = `
                <div class="vocab-card animate-pop">
                    <div class="esp">${card.esp}</div>
                    <div class="eng">${card.eng}</div>
                    <div class="phonetic">${card.phonetic}</div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="quiz-card animate-pop">
                    <p class="question">${card.question}</p>
                    <div class="options">
                        ${card.options.map((opt, i) => `<button class="opt-btn" data-idx="${i}">${opt}</button>`).join('')}
                    </div>
                </div>
            `;
            
            document.querySelectorAll('.opt-btn').forEach(btn => {
                btn.onclick = (e) => {
                    const idx = parseInt(e.target.dataset.idx);
                    if (idx === card.correct) {
                        e.target.classList.add('correct');
                        appState.user.points += 10;
                        updateStats();
                        setTimeout(next, 800);
                    } else {
                        e.target.classList.add('wrong');
                    }
                };
            });
        }
    };

    const next = () => {
        cardIndex++;
        if (cardIndex < lesson.cards.length) {
            showCard();
        } else {
            finishLesson();
        }
    };

    document.getElementById('next-card').onclick = next;
    showCard();
}

function finishLesson() {
    if (!appState.user.completedLessons.includes(appState.currentLesson.id)) {
        appState.user.completedLessons.push(appState.currentLesson.id);
        appState.user.points += 20;
    }
    
    screens.lesson.innerHTML = `
        <div class="lesson-complete glass">
            <h1 class="item-icon">✨</h1>
            <h2 class="gradient-text">¡Módulo Completado!</h2>
            <p>Has ganado puntos para desbloquear la siguiente pieza de tu vitrina.</p>
            <button id="back-to-vitrina" class="btn-primary">Volver a la Vitrina</button>
        </div>
    `;
    
    document.getElementById('back-to-vitrina').onclick = () => {
        switchScreen('onboarding');
    };
    
    updateStats();
}

function updateStats() {
    nav.points.innerText = `★ ${appState.user.points}`;
}

// Start app
renderGallery();
updateStats();
