// Загружаем данные о какао
async function loadCacaos() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        displayCacaos(data.cacaos);
        setupSearch(data.cacaos);
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        document.getElementById('cacaoList').innerHTML = 
            '<p style="color: #ccc;">Не удалось загрузить какао. Попробуйте обновить страницу.</p>';
    }
}

// Отображаем карточки какао
function displayCacaos(cacaos) {
    const container = document.getElementById('cacaoList');
    container.innerHTML = '';
    
    cacaos.forEach(cacao => {
        const card = document.createElement('div');
        card.className = 'cacao-card';
        card.innerHTML = `
            <h3>${cacao.name}</h3>
            <p>${cacao.description}</p>
            <p><strong>Вкус:</strong> ${cacao.taste}</p>
            <button class="show-btn" onclick="showInstruction(${cacao.id})">
                Инструкция приготовления
            </button>
        `;
        container.appendChild(card);
    });
}

// Показываем инструкцию в модальном окне
function showInstruction(id) {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const cacao = data.cacaos.find(c => c.id === id);
            if (cacao) {
                const modal = document.getElementById('instructionModal');
                const content = document.getElementById('modalContent');
                
                content.innerHTML = `
                    <h2>${cacao.name}</h2>
                    <p>${cacao.description}</p>
                    <p><strong>Вкусовой профиль:</strong> ${cacao.taste}</p>
                    <h3 style="margin-top: 20px; color: #D4AF37;">Способ приготовления:</h3>
                    <ol style="margin-left: 20px; margin-top: 10px;">
                        ${cacao.preparation.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                `;
                
                modal.style.display = 'flex';
            }
        });
}

// Настраиваем поиск
function setupSearch(cacaos) {
    const searchInput = document.getElementById('search');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            displayCacaos(cacaos);
            return;
        }
        
        const filtered = cacaos.filter(cacao => 
            cacao.name.toLowerCase().includes(searchTerm) ||
            cacao.description.toLowerCase().includes(searchTerm) ||
            cacao.taste.toLowerCase().includes(searchTerm)
        );
        
        displayCacaos(filtered);
    });
}

// Закрываем модальное окно
document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('instructionModal').style.display = 'none';
});

// Закрываем модальное окно при клике вне его
document.getElementById('instructionModal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
    }
});

// Загружаем какао при загрузке страницы
document.addEventListener('DOMContentLoaded', loadCacaos);
