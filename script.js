// Configuração inicial
document.addEventListener('DOMContentLoaded', function() {
    const addItemBtn = document.getElementById('addItemBtn');
    const printBtn = document.getElementById('printBtn');
    const clearBtn = document.getElementById('clearBtn');
    const savePdfBtn = document.getElementById('savePdfBtn');
    const productInput = document.getElementById('productName');
    
    productInput.focus();
    updateCurrentDate();
    loadSavedData();
    
    addItemBtn.addEventListener('click', addItem);
    printBtn.addEventListener('click', window.print);
    clearBtn.addEventListener('click', clearAll);
    savePdfBtn.addEventListener('click', saveAsPdf);
    
    setupEnterNavigation();
    setupRealTimeUpdates();
    setupPhoneMask();
});

// Função para adicionar item
function addItem() {
    const productInput = document.getElementById('productName');
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('unitPrice');
    
    const product = productInput.value.trim();
    const quantity = parseFloat(quantityInput.value);
    const price = parseFloat(priceInput.value);
    
    resetValidation();
    
    if (!validateItem(product, quantity, price)) return;
    
    addItemToTable(product, quantity, price);
    clearItemFields();
    updateGrandTotal();
    saveData();
}

// Função para validar item
function validateItem(product, quantity, price) {
    let isValid = true;
    
    if (!product) {
        showValidationError(document.getElementById('productName'), 
                          document.getElementById('productValidation'));
        isValid = false;
    }
    
    if (isNaN(quantity) || quantity <= 0) {
        showValidationError(document.getElementById('quantity'), 
                          document.getElementById('quantityValidation'));
        isValid = false;
    }
    
    if (isNaN(price) || price <= 0) {
        showValidationError(document.getElementById('unitPrice'), 
                          document.getElementById('priceValidation'));
        isValid = false;
    }
    
    return isValid;
}

// Função para adicionar item à tabela
function addItemToTable(product, quantity, price) {
    const total = (quantity * price).toFixed(2);
    const tableBody = document.getElementById('shoppingListBody');
    const newRow = tableBody.insertRow();
    
    newRow.innerHTML = `
        <td>${product}</td>
        <td>${quantity}</td>
        <td data-price="${price.toFixed(2)}">R$ ${price.toFixed(2)}</td>
        <td data-total="${total}">R$ ${total}</td>
        <td class="actions-buttons">
            <button class="edit-btn">✏️</button>
            <button class="delete-btn">❌</button>
        </td>
    `;
    
    newRow.classList.add('highlight');
    
    newRow.querySelector('.edit-btn').addEventListener('click', function() {
        editItem(newRow);
    });
    
    newRow.querySelector('.delete-btn').addEventListener('click', function() {
        deleteItem(newRow);
    });
}

// Função para editar item
function editItem(row) {
    const cells = row.cells;
    
    document.getElementById('productName').value = cells[0].textContent;
    document.getElementById('quantity').value = cells[1].textContent;
    document.getElementById('unitPrice').value = parseFloat(cells[2].getAttribute('data-price'));
    
    row.remove();
    updateGrandTotal();
    saveData();
}

// Função para deletar item
function deleteItem(row) {
    if (confirm('Tem certeza que deseja remover este item?')) {
        row.remove();
        updateGrandTotal();
        saveData();
    }
}

// Função para limpar tudo
function clearAll() {
    if (confirm('Tem certeza que deseja limpar TODOS os dados? Isso não pode ser desfeito.')) {
        document.getElementById('shoppingListBody').innerHTML = '';
        document.getElementById('productName').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('unitPrice').value = '';
        document.getElementById('cliente').value = '';
        document.getElementById('data').value = '';
        document.getElementById('endereco').value = '';
        document.getElementById('telefone').value = '';
        
        document.getElementById('cliente-print').textContent = '';
        document.getElementById('data-print').textContent = '';
        document.getElementById('endereco-print').textContent = '';
        document.getElementById('telefone-print').textContent = '';
        
        updateGrandTotal();
        localStorage.removeItem('shoppingListData');
        document.getElementById('productName').focus();
        resetValidation();
    }
}

// Função para atualizar o total geral
function updateGrandTotal() {
    let grandTotal = 0;
    const rows = document.querySelectorAll('#shoppingListBody tr');
    
    rows.forEach(row => {
        const totalValue = parseFloat(row.cells[3].getAttribute('data-total'));
        grandTotal += totalValue;
    });
    
    document.getElementById('grandTotal').textContent = `R$ ${grandTotal.toFixed(2)}`;
}

// Função para salvar dados no localStorage
function saveData() {
    const data = {
        cliente: document.getElementById('cliente').value,
        data: document.getElementById('data').value,
        endereco: document.getElementById('endereco').value,
        telefone: document.getElementById('telefone').value,
        items: []
    };
    
    document.querySelectorAll('#shoppingListBody tr').forEach(row => {
        data.items.push({
            product: row.cells[0].textContent,
            quantity: row.cells[1].textContent,
            price: parseFloat(row.cells[2].getAttribute('data-price')),
            total: parseFloat(row.cells[3].getAttribute('data-total'))
        });
    });
    
    localStorage.setItem('shoppingListData', JSON.stringify(data));
}

// Função para carregar dados salvos
function loadSavedData() {
    const savedData = localStorage.getItem('shoppingListData');
    if (!savedData) return;
    
    const data = JSON.parse(savedData);
    
    document.getElementById('cliente').value = data.cliente || '';
    document.getElementById('data').value = data.data || '';
    document.getElementById('endereco').value = data.endereco || '';
    document.getElementById('telefone').value = data.telefone || '';
    
    document.getElementById('cliente-print').textContent = data.cliente || '';
    document.getElementById('data-print').textContent = data.data || '';
    document.getElementById('endereco-print').textContent = data.endereco || '';
    document.getElementById('telefone-print').textContent = data.telefone || '';
    
    const tableBody = document.getElementById('shoppingListBody');
    tableBody.innerHTML = '';
    
    data.items.forEach(item => {
        const newRow = tableBody.insertRow();
        newRow.innerHTML = `
            <td>${item.product}</td>
            <td>${item.quantity}</td>
            <td data-price="${item.price.toFixed(2)}">R$ ${item.price.toFixed(2)}</td>
            <td data-total="${item.total.toFixed(2)}">R$ ${item.total.toFixed(2)}</td>
            <td class="actions-buttons">
                <button class="edit-btn">✏️</button>
                <button class="delete-btn">❌</button>
            </td>
        `;
        
        newRow.querySelector('.edit-btn').addEventListener('click', function() {
            editItem(newRow);
        });
        
        newRow.querySelector('.delete-btn').addEventListener('click', function() {
            deleteItem(newRow);
        });
    });
    
    updateGrandTotal();
}

// Função para salvar como PDF
function saveAsPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    html2canvas(document.querySelector('.container')).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        doc.save('orcamento.pdf');
    });
}

// Funções auxiliares
function showValidationError(inputElement, messageElement) {
    inputElement.classList.add('input-error');
    messageElement.style.display = 'block';
}

function resetValidation() {
    document.querySelectorAll('.validation-message').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

function clearItemFields() {
    document.getElementById('productName').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('unitPrice').value = '';
    document.getElementById('productName').focus();
}

function updateCurrentDate() {
    const currentDate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    document.getElementById('currentDate').textContent = currentDate;
}

function setupEnterNavigation() {
    const inputs = ['productName', 'quantity', 'unitPrice', 'cliente', 'data', 'endereco', 'telefone'];
    inputs.forEach((id, index) => {
        const input = document.getElementById(id);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (id === 'unitPrice') {
                    addItem();
                } else if (index < inputs.length - 1) {
                    document.getElementById(inputs[index + 1]).focus();
                } else {
                    document.getElementById('productName').focus();
                }
            }
        });
    });
}

function setupRealTimeUpdates() {
    ['cliente', 'data', 'endereco', 'telefone'].forEach(id => {
        document.getElementById(id).addEventListener('input', function() {
            document.getElementById(`${id}-print`).textContent = this.value;
            saveData();
        });
    });
}

function setupPhoneMask() {
    const telefoneInput = document.getElementById('telefone');
    telefoneInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (value.length > 6) {
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
        }
        
        this.value = value;
    });
}