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
        
        // Разделяем на группы
        const cacaoWithPrep = allCacaos.filter(c => c.hasPreparation && c.preparation.length > 0);
        const cacaoWithoutPrep = allCacaos.filter(c => !c.hasPreparation || c.preparation.length === 0);
        
        displayCacaos(cacaoWithPrep, cacaoWithoutPrep);
        updateCounter(allCacaos.length);
        setupSearch();
        setupTheme();
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        document.getElementById('cacaoGrid').innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <p>Не удалось загрузить коллекцию какао</p>
                <p style="margin-top: 10px; font-size: 1rem;">Попробуйте обновить страницу</p>
            </div>
        `;
    }
}

// ===== ОТОБРАЖЕНИЕ КАКАО С ГРУППИРОВКОЙ =====
function displayCacaos(withPrep, withoutPrep) {
    const container = document.getElementById('cacaoGrid');
    container.innerHTML = '';
    
    // Первая группа: с инструкциями
    if (withPrep.length > 0) {
        const groupHeader = document.createElement('div');
        groupHeader.className = 'group-header';
        groupHeader.innerHTML = `
            <h3 class="group-title">С ИНСТРУКЦИЕЙ ПРИГОТОВЛЕНИЯ</h3>
            <div class="group-count">${withPrep.length} сортов</div>
        `;
        container.appendChild(groupHeader);
        
        withPrep.forEach((cacao, index) => {
            const card = document.createElement('div');
            card.className = 'cacao-card';
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = createCardHTML(cacao, true);
            container.appendChild(card);
        });
    }
    
    // Вторая группа: без инструкций
    if (withoutPrep.length > 0) {
        const groupHeader = document.createElement('div');
        groupHeader.className = 'group-header no-prep-header';
        groupHeader.innerHTML = `
            <h3 class="group-title">ДЛЯ ОПЫТА</h3>
            <div class="group-count">${withoutPrep.length} сортов</div>
        `;
        container.appendChild(groupHeader);
        
        withoutPrep.forEach((cacao, index) => {
            const card = document.createElement('div');
            card.className = 'cacao-card no-prep-card';
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = createCardHTML(cacao, false);
            container.appendChild(card);
        });
    }
    
    updateCounter(allCacaos.length);
}

// ===== СОЗДАНИЕ HTML ДЛЯ КАРТОЧКИ =====
function createCardHTML(cacao, hasButton) {
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
    
    // Добавляем категорию, если есть
    const categoryHTML = cacao.category ? `
        <div class="cacao-category">
            <span class="category-tag">${cacao.category}</span>
        </div>
    ` : '';
    
    // Кнопка показывается только если есть инструкция
    const buttonHTML = hasButton ? `
        <button class="show-btn" onclick="showInstruction(${cacao.id})">
            Инструкция приготовления
        </button>
    ` : `
        <div class="no-prep-note">
            <i class="fas fa-mortar-pestle"></i>
            <span>Спросите у бариста о способе приготовления</span>
        </div>
    `;
    
    return `
        ${categoryHTML}
        <h4>${cacao.name}</h4>
        <p>${cacao.description}</p>
        <p class="taste">${cacao.taste}</p>
        
        ${characteristicsHTML ? `
            <div class="characteristics">
                ${characteristicsHTML}
            </div>
        ` : ''}
        
        ${buttonHTML}
    `;
}

// ===== ПОКАЗ ТОЛЬКО ИНСТРУКЦИИ =====
async function showInstruction(id) {
    try {
        const cacao = allCacaos.find(c => c.id === id);
        if (!cacao || !cacao.preparation || cacao.preparation.length === 0) return;
        
        const modal = document.getElementById('cacaoModal');
        const content = document.getElementById('modalBody');
        
        content.innerHTML = `
            <div class="instructions-only">
                <ol>
                    ${cacao.preparation.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
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
            const withPrep = allCacaos.filter(c => c.hasPreparation && c.preparation.length > 0);
            const withoutPrep = allCacaos.filter(c => !c.hasPreparation || c.preparation.length === 0);
            displayCacaos(withPrep, withoutPrep);
            clearBtn.style.display = 'none';
            return;
        }
        
        clearBtn.style.display = 'flex';
        
        const filtered = allCacaos.filter(cacao => 
            cacao.name.toLowerCase().includes(searchTerm) ||
            cacao.description.toLowerCase().includes(searchTerm) ||
            cacao.taste.toLowerCase().includes(searchTerm) ||
            (cacao.category && cacao.category.toLowerCase().includes(searchTerm)) ||
            Object.keys(cacao.characteristics || {}).some(key => 
                key.toLowerCase().includes(searchTerm)
            )
        );
        
        const filteredWithPrep = filtered.filter(c => c.hasPreparation && c.preparation.length > 0);
        const filteredWithoutPrep = filtered.filter(c => !c.hasPreparation || c.preparation.length === 0);
        
        displayCacaos(filteredWithPrep, filteredWithoutPrep);
    });
    
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        const withPrep = allCacaos.filter(c => c.hasPreparation && c.preparation.length > 0);
        const withoutPrep = allCacaos.filter(c => !c.hasPreparation || c.preparation.length === 0);
        displayCacaos(withPrep, withoutPrep);
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
