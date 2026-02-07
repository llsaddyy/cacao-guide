// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let allCacaos = [];
let currentTheme = 'dark';

// ===== ЗАГРУЗКА ДАННЫХ =====
async function loadCacaos() {
    try {
        const container = document.getElementById('cacaoGrid');
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Загружаем коллекцию какао...</p>
            </div>
        `;
        
        const response = await fetch('data.json');
        const data = await response.json();
        allCacaos = data.cacaos;
        
        displayCacaos(allCacaos);
        updateCounter(allCacaos.length);
        setupSearch();
        setupTheme();
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        document.getElementById('cacaoGrid').innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <p>Не удалось загрузить коллекцию какао</p>
                <p style="margin-top: 10px; font-size: 0.9rem;">Попробуйте обновить страницу</p>
            </div>
        `;
    }
}

// ===== ОТОБРАЖЕНИЕ КАРТОЧЕК =====
function displayCacaos(cacaos) {
    const container = document.getElementById('cacaoGrid');
    
    if (!cacaos || cacaos.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Какао не найдены</p>
                <p style="margin-top: 10px; font-size: 0.9rem;">Попробуйте изменить запрос</p>
            </div>
        `;
        updateCounter(0);
        return;
    }
    
    container.innerHTML = '';
    
    cacaos.forEach((cacao, index) => {
        const card = document.createElement('div');
        card.className = 'cacao-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = createCardHTML(cacao);
        container.appendChild(card);
    });
    
    updateCounter(cacaos.length);
}

// ===== СОЗДАНИЕ HTML ДЛЯ КАРТОЧКИ =====
function createCardHTML(cacao) {
    const characteristicsHTML = Object.entries(cacao.characteristics || {})
        .map(([key, value]) => `
            <div class="char-item">
                <span class="char-name">${key}</span>
                <div class="char-bar">
                    <div class="char-fill" style="width: ${value * 20}%"></div>
                </div>
                <span class="char-value">${value}/5</span>
            </div>
        `).join('');
    
    return `
        <h3>${cacao.name}</h3>
        <p>${cacao.description}</p>
        <p class="taste">${cacao.taste}</p>
        
        ${characteristicsHTML ? `
            <div class="characteristics">
                ${characteristicsHTML}
            </div>
        ` : ''}
        
        <button class="show-btn" onclick="showInstruction(${cacao.id})">
            Инструкция приготовления
        </button>
    `;
}

// ===== ПОКАЗ ИНСТРУКЦИИ =====
async function showInstruction(id) {
    try {
        const cacao = allCacaos.find(c => c.id === id);
        if (!cacao) return;
        
        const modal = document.getElementById('cacaoModal');
        const content = document.getElementById('modalBody');
        
        const characteristicsHTML = Object.entries(cacao.characteristics || {})
            .map(([key, value]) => `
                <div class="char-item">
                    <span class="char-name">${key}</span>
                    <div class="char-bar">
                        <div class="char-fill" style="width: ${value * 20}%"></div>
                    </div>
                    <span class="char-value">${value}/5</span>
                </div>
            `).join('');
        
        content.innerHTML = `
            <h2>${cacao.name}</h2>
            <p>${cacao.description}</p>
            
            <p><strong>Вкусовой профиль:</strong> ${cacao.taste}</p>
            
            ${characteristicsHTML ? `
                <h3>Характеристики:</h3>
                <div class="characteristics">
                    ${characteristicsHTML}
                </div>
            ` : ''}
            
            <h3>Способ приготовления:</h3>
            <ol>
                ${cacao.preparation.map(step => `<li>${step}</li>`).join('')}
            </ol>
            
            ${cacao.tip ? `
                <div class="tip-box">
                    <p>${cacao.tip}</p>
                </div>
            ` : ''}
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Ошибка показа инструкции:', error);
    }
}

// ===== НАСТРОЙКА ПОИСКА =====
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            displayCacaos(allCacaos);
            clearBtn.style.display = 'none';
            return;
        }
        
        clearBtn.style.display = 'flex';
        
        const filtered = allCacaos.filter(cacao => 
            cacao.name.toLowerCase().includes(searchTerm) ||
            cacao.description.toLowerCase().includes(searchTerm) ||
            cacao.taste.toLowerCase().includes(searchTerm) ||
            Object.keys(cacao.characteristics || {}).some(key => 
                key.toLowerCase().includes(searchTerm)
            )
        );
        
        displayCacaos(filtered);
    });
    
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        displayCacaos(allCacaos);
        clearBtn.style.display = 'none';
        searchInput.focus();
    });
    
    clearBtn.style.display = 'none';
}

// ===== ОБНОВЛЕНИЕ СЧЁТЧИКА =====
function updateCounter(count) {
    const counter = document.querySelector('.catalog-count');
    if (counter) {
        counter.textContent = `${count} ${getCountWord(count)}`;
    }
}

function getCountWord(count) {
    if (count % 10 === 1 && count % 100 !== 11) return 'сорт';
    if (count % 10 >= 2 && count % 10 <= 4 && 
        (count % 100 < 10 || count % 100 >= 20)) return 'сорта';
    return 'сортов';
}

// ===== ТЕМНАЯ/СВЕТЛАЯ ТЕМА =====
function setupTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const themeText = themeToggle.querySelector('.theme-text');
    
    // Проверяем сохранённую тему
    const savedTheme = localStorage.getItem('cacao-theme');
    if (savedTheme) {
        currentTheme = savedTheme;
        document.body.setAttribute('data-theme', currentTheme);
        updateThemeButton(themeIcon, themeText);
    }
    
    themeToggle.addEventListener('click', function() {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', currentTheme);
        localStorage.setItem('cacao-theme', currentTheme);
        updateThemeButton(themeIcon, themeText);
    });
}

function updateThemeButton(icon, text) {
    if (currentTheme === 'dark') {
        icon.textContent = '☀️';
        text.textContent = 'Светлая тема';
    } else {
        icon.textContent = '🌙';
        text.textContent = 'Тёмная тема';
    }
}

// ===== ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА =====
function setupModalClose() {
    const modal = document.getElementById('cacaoModal');
    const closeBtn = document.getElementById('closeModal');
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// ===== ЗАГРУЗКА ПРИ ЗАГРУЗКЕ СТРАНИЦЫ =====
document.addEventListener('DOMContentLoaded', function() {
    loadCacaos();
    setupModalClose();
});
