// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let allCacaos = [];

// ===== ОСНОВНАЯ ЗАГРУЗКА =====
document.addEventListener('DOMContentLoaded', function() {
    loadCacaos();
    setupModal();
    setupTheme();
    setupSearch();
});

// ===== ЗАГРУЗКА ДАННЫХ =====
async function loadCacaos() {
    try {
        // Показываем загрузку
        document.getElementById('cacaoGrid').innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Загружаем коллекцию какао...</p>
            </div>
        `;
        
        // Загружаем данные
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        const data = await response.json();
        allCacaos = data.cacaos || [];
        
        // Отображаем какао
        displayCacaos(allCacaos);
        
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('cacaoGrid').innerHTML = `
            <div style="text-align: center; padding: 60px; color: var(--text-tertiary);">
                <p>Не удалось загрузить коллекцию какао</p>
                <p>Попробуйте обновить страницу</p>
            </div>
        `;
    }
}

// ===== ОТОБРАЖЕНИЕ КАКАО =====
function displayCacaos(cacaos) {
    const container = document.getElementById('cacaoGrid');
    container.innerHTML = '';
    
    if (!cacaos || cacaos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary);">Какао не найдены</p>';
        updateCounter(0);
        return;
    }
    
    // Группируем
    const hotChocolate = cacaos.filter(c => c.type === "горячий шоколад");
    const pieces = cacaos.filter(c => c.type === "кусочки");
    
    // Горячий шоколад
    if (hotChocolate.length > 0) {
        const header = document.createElement('div');
        header.className = 'group-header';
        header.innerHTML = `
            <h3 class="group-title">ГОРЯЧИЙ ШОКОЛАД</h3>
            <div class="group-count">${hotChocolate.length} сортов</div>
        `;
        container.appendChild(header);
        
        hotChocolate.forEach(cacao => {
            container.appendChild(createCard(cacao));
        });
    }
    
    // Кусочки
    if (pieces.length > 0) {
        const header = document.createElement('div');
        header.className = 'group-header pieces-header';
        header.innerHTML = `
            <h3 class="group-title">В КУСОЧКАХ</h3>
            <div class="group-count">${pieces.length} сортов</div>
        `;
        container.appendChild(header);
        
        pieces.forEach(cacao => {
            const card = createCard(cacao);
            card.classList.add('pieces-card');
            container.appendChild(card);
        });
    }
    
    updateCounter(cacaos.length);
}

// ===== СОЗДАНИЕ КАРТОЧКИ =====
function createCard(cacao) {
    const card = document.createElement('div');
    card.className = 'cacao-card';
    
    // Характеристики
    let charsHTML = '';
    if (cacao.characteristics) {
        charsHTML = Object.entries(cacao.characteristics)
            .map(([key, value]) => `
                <div class="char-item">
                    <span class="char-name">${key}</span>
                    <div class="char-bar">
                        <div class="char-fill" style="width: ${value * 20}%"></div>
                    </div>
                    <span class="char-value">${value}/5</span>
                </div>
            `).join('');
    }
    
    // Кнопка
    let buttonHTML = '';
    if (cacao.type === "кусочки") {
        buttonHTML = '<div class="no-prep-btn">Спросите у бариста</div>';
    } else if (cacao.preparation && cacao.preparation.length > 0) {
        buttonHTML = `<button class="show-btn" onclick="showInstruction(${cacao.id})">Инструкция по приготовлению</button>`;
    } else {
        buttonHTML = '<div class="no-prep-btn">Инструкция уточняется</div>';
    }
    
    card.innerHTML = `
        <h4>${cacao.name}</h4>
        <p>${cacao.description}</p>
        ${cacao.taste ? `<p class="taste">${cacao.taste}</p>` : ''}
        ${charsHTML ? `<div class="characteristics">${charsHTML}</div>` : ''}
        ${buttonHTML}
    `;
    
    return card;
}

// ===== ПОКАЗ ИНСТРУКЦИИ =====
function showInstruction(id) {
    const cacao = allCacaos.find(c => c.id === id);
    if (!cacao || !cacao.preparation) return;
    
    const modal = document.getElementById('cacaoModal');
    const content = document.getElementById('modalBody');
    
    content.innerHTML = `
        <div class="instructions-only">
            <h3>${cacao.name}</h3>
            <ol>
                ${cacao.preparation.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// ===== ПОИСК =====
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const term = this.value.toLowerCase().trim();
        
        if (term === '') {
            displayCacaos(allCacaos);
            clearBtn.style.display = 'none';
            return;
        }
        
        clearBtn.style.display = 'flex';
        
        const filtered = allCacaos.filter(cacao => {
            const searchText = [
                cacao.name || '',
                cacao.description || '',
                cacao.taste || '',
                cacao.type || ''
            ].join(' ').toLowerCase();
            
            return searchText.includes(term);
        });
        
        displayCacaos(filtered);
    });
    
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        displayCacaos(allCacaos);
        clearBtn.style.display = 'none';
        searchInput.focus();
    });
}

// ===== ТЕМА =====
function setupTheme() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    
    // Восстанавливаем сохранённую тему
    const saved = localStorage.getItem('cacao-theme');
    if (saved) {
        document.body.setAttribute('data-theme', saved);
        updateThemeButton(saved === 'light');
    }
    
    toggle.addEventListener('click', function() {
        const current = document.body.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('cacao-theme', newTheme);
        updateThemeButton(newTheme === 'light');
    });
}

function updateThemeButton(isLight) {
    const toggle = document.getElementById('themeToggle');
    const icon = toggle.querySelector('.theme-icon');
    const text = toggle.querySelector('.theme-text');
    
    if (icon) icon.textContent = isLight ? '🌙' : '☀️';
    if (text) text.textContent = isLight ? 'Тёмная тема' : 'Светлая тема';
}

// ===== МОДАЛЬНОЕ ОКНО =====
function setupModal() {
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

// ===== СЧЁТЧИК =====
function updateCounter(count) {
    const counter = document.getElementById('catalogCounter');
    if (counter) {
        counter.textContent = `${count} сортов`;
    }
}
