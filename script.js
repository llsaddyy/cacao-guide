// Загружаем данные о какао
async function loadCacaos() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        displayCacaos(data.cacaos);
        updateCounter(data.cacaos.length);
        setupSearch(data.cacaos);
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        document.getElementById('cacaoList').innerHTML = 
            '<div class="loading"><div class="spinner"></div><p>Не удалось загрузить какао</p></div>';
    }
}

// Обновляем счётчик какао
function updateCounter(count) {
    const counter = document.querySelector('.catalog-count');
    if (counter) {
        counter.textContent = `${count} сортов`;
    }
}

// Отображаем карточки какао
function displayCacaos(cacaos) {
    const container = document.getElementById('cacaoList');
    
    if (!cacaos || cacaos.length === 0) {
        container.innerHTML = '<p style="color: #ccc; text-align: center; grid-column: 1/-1; padding: 40px;">Какао не найдены</p>';
        return;
    }
    
    container.innerHTML = '';
    
    cacaos.forEach(cacao => {
        const card = document.createElement('div');
        card.className = 'cacao-card';
        card.innerHTML = createCardHTML(cacao);
        container.appendChild(card);
    });
}

// Создаём HTML для карточки
function createCardHTML(cacao) {
    const characteristicsHTML = Object.entries(cacao.characteristics || {})
        .map(([key, value]) => `
            <div class="char-item">
                <span class="char-name">${key}</span>
                <div class="char-bar">
                    <div class="char-fill" style="width: ${value * 20}%"></div>
                </div>
            </div>
        `).join('');
    
    return `
        <h3>${cacao.name}</h3>
        <p>${cacao.description}</p>
        <p><strong>Вкус:</strong> ${cacao.taste}</p>
        
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

// Показываем инструкцию в модальном окне
async function showInstruction(id) {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        const cacao = data.cacaos.find(c => c.id === id);
        
        if (cacao) {
            const modal = document.getElementById('instructionModal');
            const content = document.getElementById('modalContent');
            
            const characteristicsHTML = Object.entries(cacao.characteristics || {})
                .map(([key, value]) => `
                    <div class="char-item">
                        <span class="char-name">${key}</span>
                        <div class="char-bar">
                            <div class="char-fill" style="width: ${value * 20}%"></div>
                        </div>
                        <span style="color: #D4AF37; margin-left: 10px; font-weight: bold;">${value}/5</span>
                    </div>
                `).join('');
            
            content.innerHTML = `
                <h2>${cacao.name}</h2>
                <p>${cacao.description}</p>
                
                <p><strong>Вкусовой профиль:</strong> ${cacao.taste}</p>
                
                ${characteristicsHTML ? `
                    <h3>Характеристики:</h3>
                    <div class="characteristics" style="margin: 20px 0;">
                        ${characteristicsHTML}
                    </div>
                ` : ''}
                
                <h3>Способ приготовления:</h3>
                <ol>
                    ${cacao.preparation.map(step => `<li>${step}</li>`).join('')}
                </ol>
                
                ${cacao.tip ? `
                    <div class="tip-box">
                        <p>💡 ${cacao.tip}</p>
                    </div>
                ` : ''}
            `;
            
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    } catch (error) {
        console.error('Ошибка загрузки инструкции:', error);
    }
}

// Настраиваем поиск
function setupSearch(cacaos) {
    const searchInput = document.getElementById('search');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            displayCacaos(cacaos);
            updateCounter(cacaos.length);
            return;
        }
        
        const filtered = cacaos.filter(cacao => 
            cacao.name.toLowerCase().includes(searchTerm) ||
            cacao.description.toLowerCase().includes(searchTerm) ||
            cacao.taste.toLowerCase().includes(searchTerm)
        );
        
        displayCacaos(filtered);
        updateCounter(filtered.length);
    });
}

// Закрываем модальное окно
document.getElementById('closeModal').addEventListener('click', function() {
    closeModal();
});

// Закрываем модальное окно при клике вне его
document.getElementById('instructionModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Закрываем модальное окно при нажатии ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

function closeModal() {
    document.getElementById('instructionModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Загружаем какао при загрузке страницы
document.addEventListener('DOMContentLoaded', loadCacaos);
