// Простой рабочий скрипт с группировкой
let allCacaos = [];

async function loadCacaos() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allCacaos = data.cacaos;
        displayCacaos(allCacaos);
        setupSearch();
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('cacaoGrid').innerHTML = '<p>Ошибка загрузки</p>';
    }
}

function displayCacaos(cacaos) {
    const container = document.getElementById('cacaoGrid');
    container.innerHTML = '';
    
    // Группируем по типу
    const hotChocolate = cacaos.filter(c => c.type === "горячий шоколад");
    const pieces = cacaos.filter(c => c.type === "кусочки");
    
    // Показываем горячий шоколад
    if (hotChocolate.length > 0) {
        const groupHeader = document.createElement('div');
        groupHeader.className = 'group-header';
        groupHeader.innerHTML = `
            <h3 class="group-title">ГОРЯЧИЙ ШОКОЛАД</h3>
            <div class="group-count">${hotChocolate.length} сортов</div>
        `;
        container.appendChild(groupHeader);
        
        hotChocolate.forEach(cacao => {
            const card = document.createElement('div');
            card.className = 'cacao-card';
            card.innerHTML = createCardHTML(cacao);
            container.appendChild(card);
        });
    }
    
    // Показываем кусочки
    if (pieces.length > 0) {
        const groupHeader = document.createElement('div');
        groupHeader.className = 'group-header pieces-header';
        groupHeader.innerHTML = `
            <h3 class="group-title">В КУСОЧКАХ</h3>
            <div class="group-count">${pieces.length} сортов</div>
        `;
        container.appendChild(groupHeader);
        
        pieces.forEach(cacao => {
            const card = document.createElement('div');
            card.className = 'cacao-card pieces-card';
            card.innerHTML = createCardHTML(cacao);
            container.appendChild(card);
        });
    }
}

function createCardHTML(cacao) {
    const hasPrep = cacao.preparation && cacao.preparation.length > 0;
    
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
    
    // Разные кнопки в зависимости от наличия инструкции
    const buttonHTML = hasPrep ? 
        `<button class="show-btn" onclick="showInstruction(${cacao.id})">Инструкция по приготовлению</button>` :
        `<div class="no-prep-btn">Спросите у бариста</div>`;
    
    return `
        <h4>${cacao.name}</h4>
        <p>${cacao.description}</p>
        <p class="taste">${cacao.taste}</p>
        <div class="characteristics">${characteristicsHTML}</div>
        ${buttonHTML}
    `;
}

function showInstruction(id) {
    const cacao = allCacaos.find(c => c.id === id);
    if (!cacao || !cacao.preparation || cacao.preparation.length === 0) return;
    
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
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    searchInput.addEventListener('input', function() {
        const term = this.value.toLowerCase();
        if (term === '') {
            displayCacaos(allCacaos);
            clearBtn.style.display = 'none';
            return;
        }
        
        clearBtn.style.display = 'block';
        const filtered = allCacaos.filter(c => 
            c.name.toLowerCase().includes(term) ||
            c.description.toLowerCase().includes(term) ||
            c.taste.toLowerCase().includes(term) ||
            c.type.toLowerCase().includes(term)
        );
        displayCacaos(filtered);
    });
    
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        displayCacaos(allCacaos);
        clearBtn.style.display = 'none';
    });
    
    clearBtn.style.display = 'none';
}

// Закрытие модального окна
document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('cacaoModal').style.display = 'none';
});

document.getElementById('cacaoModal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
    }
});

// Тема
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', function() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    const icon = this.querySelector('.theme-icon');
    const text = this.querySelector('.theme-text');
    icon.textContent = isDark ? '🌙' : '☀️';
    text.textContent = isDark ? 'Тёмная тема' : 'Светлая тема';
});

// Загрузка
document.addEventListener('DOMContentLoaded', loadCacaos);
