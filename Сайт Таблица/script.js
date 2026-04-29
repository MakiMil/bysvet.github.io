// Инициализация данных
let currentUser = null;
let tasks = JSON.parse(localStorage.getItem('shiftTasks')) || [];
let users = JSON.parse(localStorage.getItem('shiftUsers')) || [
    { id: 1, name: 'Иванов Иван Иванович', role: 'worker' },
    { id: 2, name: 'Петров Петр Петрович', role: 'worker' },
    { id: 3, name: 'Сидоров Сидор Сидорович', role: 'worker' },
    { id: 4, name: 'Козлов Константин Константинович', role: 'otk' },
    { id: 5, name: 'Мастеров Мастер Мастерович', role: 'master' },
    { id: 6, name: 'Админ Админович Админ', role: 'admin' },
    { id: 7, name: 'Директор Директорович Директор', role: 'director' }
];

let taskItemCounter = 0;

// Сохранение данных
function saveData() {
    localStorage.setItem('shiftTasks', JSON.stringify(tasks));
    localStorage.setItem('shiftUsers', JSON.stringify(users));
}

// Загрузка пользователей
function loadUsers() {
    const userList = document.getElementById('userList');
    if (!userList) return;
    
    userList.innerHTML = '';
    
    users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.onclick = () => selectUser(user);
        
        const roleClass = `role-${user.role}`;
        const roleText = getRoleText(user.role);
        
        card.innerHTML = `
            <div>
                <div class="user-name">${user.name}</div>
            </div>
            <span class="user-role ${roleClass}">${roleText}</span>
        `;
        
        userList.appendChild(card);
    });
}

function getRoleText(role) {
    switch(role) {
        case 'worker': return 'Рабочий';
        case 'otk': return 'ОТК';
        case 'master': return 'Мастер';
        case 'admin': return 'Админ';
        case 'director': return 'Начальник';
        default: return role;
    }
}

// Выбор пользователя
function selectUser(user) {
    currentUser = user;
    
    document.querySelectorAll('.user-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    
    setTimeout(() => {
        if (user.role === 'worker' || user.role === 'master') {
            showTaskPage();
        } else {
            showViewPage();
        }
    }, 300);
}

// Показать страницу задания
function showTaskPage() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('taskPage').classList.add('active');
    
    document.getElementById('currentUserInfo').textContent = currentUser.name;
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDate').value = today;
    
    // Очищаем контейнер строк
    document.getElementById('tasksListContainer').innerHTML = '';
    taskItemCounter = 0;
    
    // Проверяем, есть ли уже задание на сегодня
    const todayTask = tasks.find(t => 
        t.workerId === currentUser.id && 
        t.date === today
    );
    
    if (todayTask) {
        // Загружаем существующие строки
        todayTask.items.forEach(item => {
            addTaskItem(item);
        });
        
        document.getElementById('taskArea').value = todayTask.area || '';
        document.getElementById('taskMaster').value = todayTask.master || '';
        document.getElementById('taskShift').value = todayTask.shift || '';
    } else {
        // Добавляем пустую строку
        addTaskItem();
    }
}

// Добавление строки задания
function addTaskItem(itemData = null) {
    taskItemCounter++;
    const container = document.getElementById('tasksListContainer');
    const itemId = `item_${Date.now()}_${taskItemCounter}`;
    
    const isReadOnly = currentUser.role === 'otk' || currentUser.role === 'master';
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'task-item-row';
    itemDiv.id = itemId;
    
    itemDiv.innerHTML = `
        <div class="task-item-row-header">
            <span class="task-item-number">Задание ${taskItemCounter}</span>
        </div>
        <div class="task-item-row-content">
            <div class="task-item-field">
                <label>ФИО сотрудника</label>
                <input type="text" value="${itemData ? itemData.workerName : currentUser.name}" 
                    ${isReadOnly ? 'readonly' : ''}
                    placeholder="ФИО сотрудника">
            </div>
            <div class="task-item-field">
                <label>Специальность по ТЗ</label>
                <input type="text" value="${itemData ? itemData.specialty : ''}" 
                    ${isReadOnly ? 'readonly' : ''}
                    placeholder="Например: токарь, фрезеровщик">
            </div>
            <div class="task-item-field">
                <label>ЦКП на смену (Ценный Конечный Продукт)</label>
                <textarea rows="2" ${isReadOnly ? 'readonly' : ''}
                    placeholder="Опишите ценный конечный продукт...">${itemData ? itemData.product : ''}</textarea>
            </div>
            <div class="task-item-field">
                <label>План Т/Ч</label>
                <input type="number" min="0" step="0.5" value="${itemData ? itemData.planHours : ''}" 
                    ${isReadOnly ? 'readonly' : ''}
                    placeholder="Тайминг">
            </div>
            <div class="task-item-field">
                <label>Факт Т/Ч</label>
                <input type="number" min="0" step="0.5" value="${itemData ? itemData.factHours : ''}" 
                    ${isReadOnly ? 'readonly' : ''}
                    placeholder="Фактически отработано">
            </div>
            <div class="task-item-field">
                <label>"С ЦКП Согласен (выполню)" (ДА/Подпись)</label>
                <select ${isReadOnly ? 'disabled' : ''}>
                    <option value="" ${!itemData || !itemData.agreement ? 'selected' : ''}>Выберите</option>
                    <option value="ДА" ${itemData && itemData.agreement === 'ДА' ? 'selected' : ''}>ДА</option>
                </select>
            </div>
            <div class="task-item-field">
                <label>Примечание</label>
                <textarea rows="2" ${isReadOnly ? 'readonly' : ''}
                    placeholder="Дополнительная информация...">${itemData ? itemData.notes : ''}</textarea>
            </div>
            ${currentUser.role === 'otk' ? `
            <div class="task-item-field">
                <label>ОТК (галочка согласия)</label>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" ${itemData && itemData.otkApproved ? 'checked' : ''} 
                        style="width: 20px; height: 20px;">
                    <span style="font-size: 12px; color: #666;">Проставить галочку ОТК</span>
                </div>
            </div>
            ` : ''}
            ${currentUser.role === 'master' ? `
            <div class="task-item-field">
                <label>Отметка выполнения мастера</label>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" ${itemData && itemData.masterApproved ? 'checked' : ''}
                        style="width: 20px; height: 20px;">
                    <span style="font-size: 12px; color: #666;">Проставить отметку мастера</span>
                </div>
            </div>
            ` : ''}
        </div>
        ${!isReadOnly ? `
        <div class="task-item-actions">
            <button type="button" class="btn-delete-row" onclick="deleteTaskItem('${itemId}')">Удалить задание</button>
        </div>
        ` : ''}
    `;
    
    container.appendChild(itemDiv);
}

// Удаление строки задания
function deleteTaskItem(itemId) {
    const item = document.getElementById(itemId);
    const container = document.getElementById('tasksListContainer');
    
    if (container.children.length > 1) {
        item.remove();
        // Переименовываем оставшиеся
        updateTaskNumbers();
    } else {
        alert('Нельзя удалить последнее задание!');
    }
}

// Обновление номеров заданий
function updateTaskNumbers() {
    const items = document.querySelectorAll('.task-item-row');
    items.forEach((item, index) => {
        const numberSpan = item.querySelector('.task-item-number');
        if (numberSpan) {
            numberSpan.textContent = `Задание ${index + 1}`;
        }
    });
}

// Сохранение черновика
function saveDraft() {
    saveTaskData(true);
}

// Сохранение задания
function saveTask(e) {
    if (e) e.preventDefault();
    saveTaskData(false);
}

function saveTaskData(isDraft) {
    const today = new Date().toISOString().split('T')[0];
    const taskDate = document.getElementById('taskDate').value;
    
    if (taskDate > today && !isDraft) {
        alert('Нельзя сохранять задания на будущие дни!');
        return;
    }
    
    // Собираем строки заданий
    const items = [];
    const itemRows = document.querySelectorAll('.task-item-row');
    
    itemRows.forEach(row => {
        const fields = row.querySelectorAll('.task-item-field');
        const inputs = row.querySelectorAll('input, select, textarea');
        
        const item = {
            workerName: inputs[0] ? inputs[0].value : '',
            specialty: inputs[1] ? inputs[1].value : '',
            product: inputs[2] ? inputs[2].value : '',
            planHours: inputs[3] ? inputs[3].value : '',
            factHours: inputs[4] ? inputs[4].value : '',
            agreement: inputs[5] ? inputs[5].value : '',
            notes: inputs[6] ? inputs[6].value : '',
            otkApproved: false,
            masterApproved: false
        };
        
        // Проверяем чекбоксы ОТК и мастера
        const checkboxes = row.querySelectorAll('input[type="checkbox"]');
        if (checkboxes.length > 0) {
            if (currentUser.role === 'otk') {
                item.otkApproved = checkboxes[0].checked;
            }
            if (currentUser.role === 'master') {
                item.masterApproved = checkboxes[0].checked;
            }
        }
        
        // Если есть сохраненные данные, берем их
        const existingOtk = row.querySelector('input[type="checkbox"]');
        if (existingOtk) {
            if (currentUser.role === 'otk') item.otkApproved = existingOtk.checked;
            if (currentUser.role === 'master') item.masterApproved = existingOtk.checked;
        }
        
        items.push(item);
    });
    
    const existingIndex = tasks.findIndex(t => 
        t.workerId === currentUser.id && t.date === taskDate
    );
    
    const taskData = {
        id: existingIndex >= 0 ? tasks[existingIndex].id : Date.now(),
        workerId: currentUser.id,
        workerName: currentUser.name,
        workerRole: currentUser.role,
        date: taskDate,
        area: document.getElementById('taskArea').value,
        master: document.getElementById('taskMaster').value,
        shift: document.getElementById('taskShift').value,
        items: items,
        isDraft: isDraft,
        createdAt: existingIndex >= 0 ? tasks[existingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
        // Сохраняем чекбоксы из старой версии
        const oldTask = tasks[existingIndex];
        taskData.items.forEach((newItem, idx) => {
            if (oldTask.items && oldTask.items[idx]) {
                if (currentUser.role !== 'otk') {
                    newItem.otkApproved = oldTask.items[idx].otkApproved || false;
                }
                if (currentUser.role !== 'master') {
                    newItem.masterApproved = oldTask.items[idx].masterApproved || false;
                }
            }
        });
        tasks[existingIndex] = taskData;
    } else {
        tasks.push(taskData);
    }
    
    saveData();
    
    if (isDraft) {
        alert('Черновик сохранен!');
    } else {
        alert('Задание успешно сохранено!');
    }
}

// Показать страницу просмотра
function showViewPage() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('viewPage').classList.add('active');
    
    document.getElementById('currentViewUser').textContent = currentUser.name;
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('viewDate').value = today;
    
    loadAreas();
    loadDepartments();
    renderTasks();
    updateStats();
}

// Загрузка участков
function loadAreas() {
    const areas = [...new Set(tasks.map(t => t.area).filter(Boolean))];
    const filter = document.getElementById('viewArea');
    const currentValue = filter.value;
    
    filter.innerHTML = '<option value="all">Все</option>';
    
    areas.forEach(area => {
        const option = document.createElement('option');
        option.value = area;
        option.textContent = area;
        filter.appendChild(option);
    });
    
    filter.value = currentValue;
}

// Загрузка отделений
function loadDepartments() {
    const departments = [...new Set(tasks.map(t => t.area).filter(Boolean))];
    const filter = document.getElementById('viewDepartment');
    const currentValue = filter.value;
    
    filter.innerHTML = '<option value="all">Все</option>';
    
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        filter.appendChild(option);
    });
    
    filter.value = currentValue;
}

// Рендеринг заданий
function renderTasks() {
    const filterDate = document.getElementById('viewDate').value;
    const filterArea = document.getElementById('viewArea').value;
    const filterDept = document.getElementById('viewDepartment').value;
    
    let filteredTasks = tasks.filter(t => !t.isDraft);
    
    if (filterDate) {
        filteredTasks = filteredTasks.filter(t => t.date === filterDate);
    }
    
    if (filterArea && filterArea !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.area === filterArea);
    }
    
    if (filterDept && filterDept !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.area === filterDept);
    }
    
    // Сортировка по дате (новые сверху)
    filteredTasks.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const container = document.getElementById('tasksContainer');
    
    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Нет заданий</h3>
                <p>На выбранную дату нет заполненных сменных заданий</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredTasks.map(task => `
        <div class="task-card">
            <div class="task-card-header">
                <div>
                    <div class="task-card-title">${task.area || 'Без участка'} - ${task.master || 'Без мастера'}</div>
                    <div class="task-card-meta">
                        <span>${formatDate(task.date)}</span>
                        <span>Смена: ${getShiftText(task.shift)}</span>
                        <span>Заполнил: ${getRoleText(task.workerRole)}</span>
                    </div>
                </div>
            </div>
            <div class="task-card-body">
                <table class="task-table-view">
                    <thead>
                        <tr>
                            <th>ФИО</th>
                            <th>ЦКП</th>
                            <th>Специальность</th>
                            <th>План Т/Ч</th>
                            <th>Факт Т/Ч</th>
                            <th>Согласен</th>
                            <th>ОТК</th>
                            <th>Мастер</th>
                            <th>Примечание</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${task.items.map(item => `
                            <tr>
                                <td>${item.workerName}</td>
                                <td>${item.product}</td>
                                <td>${item.specialty}</td>
                                <td>${item.planHours}</td>
                                <td>${item.factHours}</td>
                                <td>${item.agreement || '-'}</td>
                                <td class="checkbox-cell">
                                    ${item.otkApproved ? '<span class="yes">✓</span>' : ''}
                                </td>
                                <td class="checkbox-cell">
                                    ${item.masterApproved ? '<span class="yes">✓</span>' : ''}
                                </td>
                                <td>${item.notes}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `).join('');
}

// Обновление статистики
function updateStats() {
    const filterDate = document.getElementById('viewDate').value;
    const filterArea = document.getElementById('viewArea').value;
    const filterDept = document.getElementById('viewDepartment').value;
    
    let filteredTasks = tasks.filter(t => !t.isDraft);
    
    if (filterDate) {
        filteredTasks = filteredTasks.filter(t => t.date === filterDate);
    }
    
    if (filterArea && filterArea !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.area === filterArea);
    }
    
    if (filterDept && filterDept !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.area === filterDept);
    }
    
    let totalRecords = 0;
    let otkCount = 0;
    let masterCount = 0;
    
    filteredTasks.forEach(task => {
        totalRecords += task.items.length;
        task.items.forEach(item => {
            if (item.otkApproved) otkCount++;
            if (item.masterApproved) masterCount++;
        });
    });
    
    document.getElementById('totalTasksCount').textContent = filteredTasks.length;
    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('otkApproved').textContent = otkCount;
    document.getElementById('masterApproved').textContent = masterCount;
}

// Выход
function logout() {
    currentUser = null;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('loginPage').classList.add('active');
    document.querySelectorAll('.user-card').forEach(c => c.classList.remove('selected'));
}

// Модальное окно
function openModal() {
    document.getElementById('userModal').classList.add('active');
}

function closeModal() {
    document.getElementById('userModal').classList.remove('active');
    document.getElementById('addUserForm').reset();
}

// Добавление пользователя
function addUser(e) {
    e.preventDefault();
    
    const name = document.getElementById('newUserName').value.trim();
    const role = document.getElementById('newUserRole').value;
    
    if (!name) {
        alert('Введите ФИО');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name: name,
        role: role
    };
    
    users.push(newUser);
    saveData();
    loadUsers();
    closeModal();
    alert('Пользователь успешно добавлен!');
}

// Закрытие модального окна по клику вне
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Экспорт в Excel
function exportToExcel() {
    const filterDate = document.getElementById('viewDate').value;
    const filterArea = document.getElementById('viewArea').value;
    const filterDept = document.getElementById('viewDepartment').value;
    
    let filteredTasks = tasks.filter(t => !t.isDraft);
    
    if (filterDate) {
        filteredTasks = filteredTasks.filter(t => t.date === filterDate);
    }
    
    if (filterArea && filterArea !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.area === filterArea);
    }
    
    if (filterDept && filterDept !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.area === filterDept);
    }
    
    if (filteredTasks.length === 0) {
        alert('Нет данных для экспорта');
        return;
    }
    
    // Собираем все строки
    let csvRows = [];
    const headers = ['Дата', 'Участок', 'Мастер', 'ФИО', 'ЦКП', 'Специальность', 'План Т/Ч', 'Факт Т/Ч', 'Согласен', 'ОТК', 'Мастер', 'Примечание'];
    csvRows.push(headers.join(';'));
    
    filteredTasks.forEach(task => {
        task.items.forEach(item => {
            csvRows.push([
                formatDate(task.date),
                task.area || '',
                task.master || '',
                item.workerName,
                item.product,
                item.specialty,
                item.planHours,
                item.factHours,
                item.agreement || '',
                item.otkApproved ? 'Да' : '',
                item.masterApproved ? 'Да' : '',
                item.notes
            ].map(field => `"${field}"`).join(';'));
        });
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `smena_${filterDate || 'all'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Вспомогательные функции
function getShiftText(shift) {
    switch(shift) {
        case '1': return '1 смена';
        case '2': return '2 смена';
        case '3': return '3 смена';
        default: return '-';
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Обработчики событий
document.getElementById('taskForm').addEventListener('submit', saveTask);
document.getElementById('addUserForm').addEventListener('submit', addUser);

document.getElementById('viewDate').addEventListener('change', () => {
    renderTasks();
    updateStats();
});
document.getElementById('viewArea').addEventListener('change', () => {
    renderTasks();
    updateStats();
});
document.getElementById('viewDepartment').addEventListener('change', () => {
    renderTasks();
    updateStats();
});

// Инициализация
loadUsers();
    closeModal();
    {alert('Пользователь успешно добавлен!');
}

// Закрытие модального окна по клику вне
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Экспорт в Excel
function exportToExcel() {
    const filterDate = document.getElementById('viewDate').value;
    const filterArea = document.getElementById('viewArea').value;
    const filterDept = document.getElementById('viewDepartment').value;
    
    let filteredTasks = tasks.filter(t => !t.isDraft);
    
    if (filterDate) {
        filteredTasks = filteredTasks.filter(t => t.date === filterDate);
    }
    
    if (filterArea && filterArea !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.area === filterArea);
    }
    
    if (filterDept && filterDept !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.department === filterDept);
    }
    
    if (filteredTasks.length === 0) {
        alert('Нет данных для экспорта');
        return;
    }
    
    // Собираем все строки
    let csvRows = [];
    const headers = ['Дата', 'Участок', 'Цех', 'Смена', 'Мастер', '№', 'ФИО', 'ЦКП', 'Специальность', 'План Т/Ч', 'Факт Т/Ч', 'ОТК', 'Согласен', 'Мастер', 'Примечание'];
    csvRows.push(headers.join(';'));
    
    filteredTasks.forEach(task => {
        task.rows.forEach(row => {
            csvRows.push([
                formatDate(task.date),
                task.area || '',
                task.department || '',
                getShiftText(task.shift),
                task.master || '',
                row.number,
                row.workerName,
                row.product,
                row.specialty,
                row.planHours,
                row.factHours,
                row.otkApproved ? 'Да' : '',
                row.agreement || '',
                row.masterApproved ? 'Да' : '',
                row.notes
            ].map(field => `"${field}"`).join(';'));
        });
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `smena_${filterDate || 'all'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Вспомогательные функции
function getShiftText(shift) {
    switch(shift) {
        case '1': return '1 смена';
        default: return '-';
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Обработчики событий
document.getElementById('taskForm').addEventListener('submit', saveTask);
document.getElementById('addUserForm').addEventListener('submit', addUser);

document.getElementById('viewDate').addEventListener('change', () => {
    renderTasks();
    updateStats();
});
document.getElementById('viewArea').addEventListener('change', () => {
    renderTasks();
    updateStats();
});
document.getElementById('viewDepartment').addEventListener('change', () => {
    renderTasks();
    updateStats();
});

// Инициализация
loadUsers();
    closeModal();
    alert('Пользователь успешно добавлен!');


// Закрытие модального окна по клику вне
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Экспорт в Excel
function exportToExcel() {
    const filterDate = document.getElementById('filterDate').value;
    const filterDept = document.getElementById('filterDepartment').value;
    
    let filteredTasks = tasks;
    
    if (filterDate) {
        filteredTasks = filteredTasks.filter(t => t.date === filterDate);
    }
    
    if (filterDept && filterDept !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.department === filterDept);
    }
    
    if (filteredTasks.length === 0) {
        alert('Нет данных для экспорта');
        return;
    }
    
    // Создаем CSV
    const headers = ['Дата', 'Смена', 'Отделение', 'Рабочий', 'Задание', 'План', 'Факт', 'Статус', 'Комментарии'];
    const csvContent = [
        headers.join(';'),
        ...filteredTasks.map(t => [
            formatDate(t.date),
            getShiftText(t.shift),
            t.department || '',
            t.workerName || '',
            t.description || '',
            t.plan || '',
            t.result || '',
            t.status || '',
            t.comments || ''
        ].map(field => `"${field}"`).join(';'))
    ].join('\n');
    
    // Скачиваем файл
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `smena_${filterDate || 'all'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Обработчики событий
document.getElementById('taskForm').addEventListener('submit', saveTask);
document.getElementById('addUserForm').addEventListener('submit', addUser);
document.getElementById('filterDate').addEventListener('change', () => {
    renderTasks();
    updateStats();
});
document.getElementById('filterDepartment').addEventListener('change', () => {
    renderTasks();
    updateStats();
});

// Инициализация
loadUsers();