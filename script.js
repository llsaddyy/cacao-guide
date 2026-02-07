// ===== НАСТРОЙКА ПРИ ЗАГРУЗКЕ =====
document.addEventListener('DOMContentLoaded', function() {
    loadCacaos();
    setupModalClose();
    setupTheme();
    setupSearch();
});

// ===== ЗАГРУЗКА ДАННЫХ =====
async function loadCacaos() {
    try {
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error('Не удалось загрузить данные');
        }
        
        const data = await response.json();
        
        // Проверяем, что данные есть
        if (!data.cacaos || !Array.isArray(data.cacaos)) {
            throw new Error('Некорректный формат данных');
        }
        
        displayCacaos(data.cacaos);
        
    } catch (error) {
        console.error('Ошибка загрузки какао:', error);
        document.getElementById('cacaoGrid').innerHTML = `
            <div class="error-message">
                <p>Не удалось загрузить коллекцию какао</p>
                <p>Попробуйте обновить страницу</p>
            </div>
        `;
    }
}

// ===== ОТОБРАЖЕНИЕ КАКАО С ГРУППИРОВКОЙ =====
function displayCacaos(cacaos) {
    const container = document.getElementById('cacaoGrid');
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Проверяем, что есть что показывать
    if (!cacaos || cacaos.length === 0) {
        container.innerHTML = '<p class="no-results">Какао не найдены</p>';
        return;
    }
    
    // Группируем какао (с защитой от отсутствия type)
    const hotChocolate = cacaos.filter(c => c.type && c.type === "горячий шоколад");
    const pieces = cacaos.filter(c => c.type && c.type === "кусочки");
    
    // Показываем горячий шоколад
    if (hotChocolate.length > 0) {
        // Заголовок группы
        const groupHeader = document.createElement('div');
        groupHeader.className = 'group-header';
        groupHeader.innerHTML = `
            <h3 class="group-title">ГОРЯЧИЙ ШОКОЛАД</h3>
            <div class="group-count">${hotChocolate.length} сортов</div>
        `;
        container.appendChild(groupHeader);
        
        // Карточки горячего шоколада
        hotChocolate.forEach(cacao => {
            const card = document.createElement('div');
            card.className = 'cacao-card';
            card.innerHTML = createCardHTML(cacao);
            container.appendChild(card);
        });
    }
    
    // Показываем кусочки
    if (pieces.length > 0) {
        // Заголовок группы
        const groupHeader = document.createElement('div');
        groupHeader.className = 'group-header pieces-header';
        groupHeader.innerHTML = `
            <h3 class="group-title">В КУСОЧКАХ</h3>
            <div class="group-count">${pieces.length} сортов</div>
        `;
        container.appendChild(groupHeader);
        
        // Карточки кусочков
        pieces.forEach(cacao => {
            const card = document.createElement('div');
            card.className = 'cacao-card pieces-card';
            card.innerHTML = createCardHTML(cacao);
            container.appendChild(card);
        });
    }
    
    // Обновляем общий счётчик
    updateCounter(cacaos.length);
}

// ===== СОЗДАНИЕ КАРТОЧКИ =====
function createCardHTML(cacao) {
    // Проверяем наличие данных
    const name = cacao.name || 'Без названия';
    const description = cacao.description || '';
    const taste = cacao.taste || '';
    
    // Характеристики (с защитой)
    let characteristicsHTML = '';
    if (cacao.characteristics && typeof cacao.characteristics === 'object') {
        characteristicsHTML = Object.entries(cacao.characteristics)
            .map(([key, value]) => {
                const numValue = Number(value) || 0;
                return `
                    <div class="char-item">
                        <span class="char-name">${key}</span>
                        <div class="char-bar">
                            <div class="char-fill" style="width: ${numValue * 20}%"></div>
                        </div>
                        <span class="char-value">${numValue}/5</span>
                    </div>
                `;
            })
            .join('');
    }
    
    // Определяем тип кнопки
    const hasPreparation = cacao.preparation && Array.isArray(cacao.preparation) && cacao.preparation.length > 0;
    const isPieces = cacao.type === 'кусочки';
    
    let buttonHTML = '';
    if (isPieces) {
        buttonHTML = '<div class="no-prep-btn">Спросите у бариста</div>';
    } else if (hasPreparation) {
        buttonHTML = `<button class="show-btn" onclick="showInstruction(${cacao.id})">Инструкция по приготовлению</button>`;
    } else {
        buttonHTML = '<div class="no-prep-btn">Инструкция уточняется</div>';
    }
    
    // Собираем карточку
    return `
        <h4>${name}</h4>
        <p>${description}</p>
        ${taste ? `<p class="taste">${taste}</p>` : ''}
        ${characteristicsHTML ? `<div class="characteristics">${characteristicsHTML}</div>` : ''}
        ${buttonHTML}
    `;
}

// ===== ПОКАЗ ИНСТРУКЦИИ =====
async function showInstruction(id) {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        const cacao = data.cacaos.find(c => c.id === id);
        
        if (!cacao || !cacao.preparation || !Array.isArray(cacao.preparation)) {
            return;
        }
        
        const modal = document.getElementById('cacaoModal');
        const content = document.getElementById('modalBody');
        
        content.innerHTML = `
            <div class="instructions-only">
                <h3>${cacao.name || ''}</h3>
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

// ===== ПОИСК =====
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    if (!searchInput) return;
    
    let allCacaos = [];
    
    // Загружаем данные для поиска
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            allCacaos = data.cacaos || [];
        })
        .catch(error => {
            console.error('Ошибка загрузки для поиска:', error);
        });
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (!allCacaos.length) return;
        
        if (searchTerm === '') {
            loadCacaos(); // Перезагружаем оригинальные данные
            clearBtn.style.display = 'none';
            return;
        }
        
        clearBtn.style.display = 'flex';
        
        const filtered = allCacaos.filter(cacao => {
            const searchIn = [
                cacao.name || '',
                cacao.description || '',
                cacao.taste || '',
                cacao.type || ''
            ].join(' ').toLowerCase();
            
            return searchIn.includes(searchTerm);
        });
        
        displayCacaos(filtered);
    });
    
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        loadCacaos();
        clearBtn.style.display = 'none';
        searchInput.focus();
    });
    
    clearBtn.style.display = 'none';
}

// ===== ОБНОВЛЕНИЕ СЧЁТЧИКА =====
function updateCounter(count) {
    const counter = document.querySelector('.catalog-count');
    if (counter) {
        counter.textContent = `${count} сортов`;
    }
}

// ===== ТЕМА =====
function setupTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    // Восстанавливаем сохранённую тему
    const savedTheme = localStorage.getItem('cacao-theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        updateThemeButton(savedTheme === 'light');
    }
    
    themeToggle.addEventListener('click', function() {
        const current = document.body.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('cacao-theme', newTheme);
        updateThemeButton(newTheme === 'light');
    });
}

function updateThemeButton(isLight) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('.theme-icon');
    const text = themeToggle.querySelector('.theme-text');
    
    if (icon) icon.textContent = isLight ? '🌙' : '☀️';
    if (text) text.textContent = isLight ? 'Тёмная тема' : 'Светлая тема';
}

// ===== МОДАЛЬНОЕ ОКНО =====
function setupModalClose() {
    const modal = document.getElementById('cacaoModal');
    const closeBtn = document.getElementById('closeModal');
    
    if (!modal || !closeBtn) return;
    
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
