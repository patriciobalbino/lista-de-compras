// Configuração inicial
document.addEventListener('DOMContentLoaded', function() {
    const addItemBtn = document.getElementById('addItemBtn');
    const printBtn = document.getElementById('printBtn');
    const clearBtn = document.getElementById('clearBtn');
    const savePdfBtn = document.getElementById('savePdfBtn');
    const productInput = document.getElementById('productName');
    
    // Foca no campo de nome do produto ao carregar a página
    productInput.focus();
    
    // Atualiza a data no rodapé
    updateCurrentDate();
    
    // Carrega dados salvos do localStorage ao iniciar
    loadSavedData();
    
    // --- Adiciona os Event Listeners para os botões ---
    
    // Adiciona item à lista
    addItemBtn.addEventListener('click', addItem);
    
    // Configuração para o botão de imprimir
    printBtn.addEventListener('click', function(event) {
        // Log para verificar se o listener está ativo
        console.log('Evento de clique no printBtn capturado!'); 
        
        // Tenta chamar a função de impressão do navegador
        try {
            console.log('Tentando chamar window.print()...');
            window.print(); // Esta linha abre a caixa de diálogo de impressão
            console.log('window.print() chamado com sucesso (ou a caixa de diálogo deveria ter aparecido).');
        } catch (e) {
            // Captura qualquer erro que possa ocorrer durante a chamada de window.print()
            console.error('Erro ao tentar chamar window.print():', e); 
        }
        
        // Descomente a linha abaixo se você suspeitar que o evento de clique está
        // acionando um comportamento padrão indesejado que você precisa parar.
        // Geralmente não é necessário para window.print(), mas pode ser útil para depuração.
        // event.preventDefault(); 
    });
    
    // Limpa todos os dados
    clearBtn.addEventListener('click', clearAll);
    
    // Salva o orçamento como PDF
    savePdfBtn.addEventListener('click', saveAsPdf);
    
    // Configura a navegação por 'Enter' entre os campos
    setupEnterNavigation();
    
    // Configura atualizações em tempo real para os campos do orçamento
    setupRealTimeUpdates();
    
    // Aplica a máscara de telefone
    setupPhoneMask();
});

// =====================================================================
// FUNÇÕES PRINCIPAIS
// =====================================================================

// Função para adicionar item à tabela
function addItem() {
    const productInput = document.getElementById('productName');
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('unitPrice');
    
    const product = productInput.value.trim();
    const quantity = parseFloat(quantityInput.value);
    const price = parseFloat(priceInput.value);
    
    // Limpa as mensagens de erro de validação anteriores
    resetValidation();
    
    // Valida os campos antes de adicionar
    if (!validateItem(product, quantity, price)) return;
    
    // Adiciona o item à tabela
    addItemToTable(product, quantity, price);
    
    // Limpa os campos de entrada para o próximo item
    clearItemFields();
    
    // Atualiza o total geral da lista
    updateGrandTotal();
    
    // Salva os dados no localStorage
    saveData();
}

// Função para validar os campos de um item
function validateItem(product, quantity, price) {
    let isValid = true;
    
    if (!product) {
        showValidationError(document.getElementById('productName'), document.getElementById('productValidation'));
        isValid = false;
    }
    
    if (isNaN(quantity) || quantity <= 0) {
        showValidationError(document.getElementById('quantity'), document.getElementById('quantityValidation'));
        isValid = false;
    }
    
    if (isNaN(price) || price <= 0) {
        showValidationError(document.getElementById('unitPrice'), document.getElementById('priceValidation'));
        isValid = false;
    }
    
    return isValid;
}

// Função para adicionar uma nova linha de item à tabela HTML
function addItemToTable(product, quantity, price) {
    const total = (quantity * price).toFixed(2); // Calcula o total do item
    const tableBody = document.getElementById('shoppingListBody');
    const newRow = tableBody.insertRow(); // Insere uma nova linha no tbody
    
    // Define o HTML para a nova linha
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
    
    // Adiciona uma classe para destacar a nova linha (opcional)
    newRow.classList.add('highlight');
    
    // Adiciona listeners para os botões de editar e excluir desta linha específica
    newRow.querySelector('.edit-btn').addEventListener('click', function() {
        editItem(newRow);
    });
    
    newRow.querySelector('.delete-btn').addEventListener('click', function() {
        deleteItem(newRow);
    });
}

// Função para editar um item existente (o usuário seleciona para editar e os dados vão para os campos de entrada)
function editItem(row) {
    const cells = row.cells;
    
    // Preenche os campos de entrada com os dados do item
    document.getElementById('productName').value = cells[0].textContent;
    document.getElementById('quantity').value = cells[1].textContent;
    // Usa o atributo data-price para pegar o valor original do preço unitário
    document.getElementById('unitPrice').value = parseFloat(cells[2].getAttribute('data-price')); 
    
    // Remove a linha da tabela enquanto o item está sendo editado
    row.remove();
    
    // Atualiza o total geral e salva os dados
    updateGrandTotal();
    saveData();
}

// Função para deletar um item da tabela
function deleteItem(row) {
    // Confirmação antes de remover
    if (confirm('Tem certeza que deseja remover este item?')) {
        row.remove(); // Remove a linha da tabela
        updateGrandTotal(); // Atualiza o total geral
        saveData(); // Salva os dados após a remoção
    }
}

// Função para limpar todos os campos e a lista
function clearAll() {
    // Confirmação antes de limpar tudo
    if (confirm('Tem certeza que deseja limpar TODOS os dados? Isso não pode ser desfeito.')) {
        // Limpa o corpo da tabela
        document.getElementById('shoppingListBody').innerHTML = '';
        
        // Limpa os campos de entrada de itens
        document.getElementById('productName').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('unitPrice').value = '';
        
        // Limpa os campos de dados do orçamento
        document.getElementById('cliente').value = '';
        document.getElementById('data').value = '';
        document.getElementById('endereco').value = '';
        document.getElementById('telefone').value = '';
        
        // Limpa os spans onde os dados são impressos/exibidos
        document.getElementById('cliente-print').textContent = '';
        document.getElementById('data-print').textContent = '';
        document.getElementById('endereco-print').textContent = '';
        document.getElementById('telefone-print').textContent = '';
        
        // Atualiza o total geral para zero
        updateGrandTotal();
        
        // Remove os dados salvos do localStorage
        localStorage.removeItem('shoppingListData');
        
        // Volta o foco para o campo de nome do produto
        document.getElementById('productName').focus();
        
        // Limpa quaisquer mensagens de validação que possam estar visíveis
        resetValidation();
    }
}

// Função para atualizar o total geral de todos os itens na lista
function updateGrandTotal() {
    let grandTotal = 0;
    // Seleciona todas as linhas do corpo da tabela
    const rows = document.querySelectorAll('#shoppingListBody tr');
    
    rows.forEach(row => {
        // Pega o valor total do item do atributo data-total
        const totalValue = parseFloat(row.cells[3].getAttribute('data-total'));
        grandTotal += totalValue; // Soma ao total geral
    });
    
    // Atualiza o elemento que exibe o total geral
    document.getElementById('grandTotal').textContent = `R$ ${grandTotal.toFixed(2)}`;
}

// Função para salvar os dados atuais (itens da lista e informações do orçamento) no localStorage
function saveData() {
    const data = {
        cliente: document.getElementById('cliente').value,
        data: document.getElementById('data').value,
        endereco: document.getElementById('endereco').value,
        telefone: document.getElementById('telefone').value,
        items: []
    };
    
    // Itera sobre cada linha da tabela para coletar os dados dos itens
    document.querySelectorAll('#shoppingListBody tr').forEach(row => {
        data.items.push({
            product: row.cells[0].textContent,
            quantity: row.cells[1].textContent,
            price: parseFloat(row.cells[2].getAttribute('data-price')), // Pega o preço unitário original
            total: parseFloat(row.cells[3].getAttribute('data-total')) // Pega o total do item
        });
    });
    
    // Salva a estrutura de dados no localStorage como uma string JSON
    localStorage.setItem('shoppingListData', JSON.stringify(data));
}

// Função para carregar os dados salvos do localStorage e preencher a interface
function loadSavedData() {
    const savedData = localStorage.getItem('shoppingListData');
    // Se não houver dados salvos, retorna sem fazer nada
    if (!savedData) return;
    
    // Converte a string JSON de volta para um objeto JavaScript
    const data = JSON.parse(savedData);
    
    // Preenche os campos de entrada e os spans de exibição com os dados carregados
    document.getElementById('cliente').value = data.cliente || '';
    document.getElementById('data').value = data.data || '';
    document.getElementById('endereco').value = data.endereco || '';
    document.getElementById('telefone').value = data.telefone || '';
    
    document.getElementById('cliente-print').textContent = data.cliente || '';
    document.getElementById('data-print').textContent = data.data || '';
    document.getElementById('endereco-print').textContent = data.endereco || '';
    document.getElementById('telefone-print').textContent = data.telefone || '';
    
    const tableBody = document.getElementById('shoppingListBody');
    tableBody.innerHTML = ''; // Limpa a tabela antes de adicionar os itens salvos
    
    // Adiciona cada item salvo de volta à tabela
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
        
        // Adiciona listeners para os botões de editar e excluir para os itens recarregados
        newRow.querySelector('.edit-btn').addEventListener('click', function() {
            editItem(newRow);
        });
        
        newRow.querySelector('.delete-btn').addEventListener('click', function() {
            deleteItem(newRow);
        });
    });
    
    // Atualiza o total geral com base nos itens carregados
    updateGrandTotal();
}

// Função para salvar o conteúdo da página como um arquivo PDF
function saveAsPdf() {
    const { jsPDF } = window.jspdf; // Importa jsPDF
    const doc = new jsPDF(); // Cria uma nova instância do PDF
    
    // Usa html2canvas para capturar o conteúdo da página como uma imagem
    html2canvas(document.querySelector('.container')).then(canvas => {
        const imgData = canvas.toDataURL('image/png'); // Converte o canvas para uma URL de dados PNG
        const imgWidth = 210; // Largura do papel A4 em mm
        // Calcula a altura da imagem proporcionalmente para caber no A4
        const imgHeight = canvas.height * imgWidth / canvas.width; 
        
        // Adiciona a imagem ao PDF
        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight); // Posição (0,0), largura e altura
        
        // Salva o arquivo PDF com o nome "orcamento.pdf"
        doc.save('orcamento.pdf');
    });
}

// =====================================================================
// FUNÇÕES AUXILIARES
// =====================================================================

// Função para exibir mensagens de erro de validação abaixo dos campos
function showValidationError(inputElement, messageElement) {
    inputElement.classList.add('input-error'); // Adiciona uma classe CSS para estilizar o campo com erro
    messageElement.style.display = 'block'; // Torna a mensagem de erro visível
}

// Função para limpar todas as marcações de erro de validação
function resetValidation() {
    // Oculta todas as mensagens de validação
    document.querySelectorAll('.validation-message').forEach(el => el.style.display = 'none');
    // Remove a classe de erro de todos os campos que a possuírem
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

// Função para limpar os campos de entrada de um item após adicionar um novo item
function clearItemFields() {
    document.getElementById('productName').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('unitPrice').value = '';
    document.getElementById('productName').focus(); // Coloca o foco de volta no campo do nome do produto
}

// Função para atualizar o texto do span no rodapé com a data atual
function updateCurrentDate() {
    const currentDate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    document.getElementById('currentDate').textContent = currentDate;
}

// Configura a navegação entre os campos de entrada usando a tecla Enter
function setupEnterNavigation() {
    const inputs = ['productName', 'quantity', 'unitPrice', 'cliente', 'data', 'endereco', 'telefone'];
    inputs.forEach((id, index) => {
        const input = document.getElementById(id);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Impede o comportamento padrão do Enter (como submeter um formulário)
                
                // Se o campo atual for o de preço unitário, tenta adicionar o item
                if (id === 'unitPrice') {
                    addItem();
                } 
                // Se não for o último campo, move o foco para o próximo campo
                else if (index < inputs.length - 1) {
                    document.getElementById(inputs[index + 1]).focus();
                } 
                // Se for o último campo (telefone), volta o foco para o nome do produto
                else {
                    document.getElementById('productName').focus();
                }
            }
        });
    });
}

// Configura listeners para atualizar os spans de exibição em tempo real à medida que os campos são alterados
function setupRealTimeUpdates() {
    ['cliente', 'data', 'endereco', 'telefone'].forEach(id => {
        document.getElementById(id).addEventListener('input', function() {
            document.getElementById(`${id}-print`).textContent = this.value; // Atualiza o span correspondente
            saveData(); // Salva os dados sempre que um campo é alterado
        });
    });
}

// Aplica uma máscara de formato para números de telefone (ex: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX)
function setupPhoneMask() {
    const telefoneInput = document.getElementById('telefone');
    telefoneInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
        
        // Limita o número de dígitos para 11 (para celular com nono dígito)
        if (value.length > 11) value = value.slice(0, 11);
        
        // Aplica a máscara com base no número de dígitos
        if (value.length > 10) { // Formato de celular (DD) XXXXX-XXXX
            value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (value.length > 6) { // Formato de celular (DD) XXXX-XXXX (se ainda não atingiu 11 dígitos)
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        } else if (value.length > 2) { // Formato de DDD (DD) XXXXX... ou (DD) XXXX...
            value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
        }
        
        this.value = value; // Atualiza o valor do campo de entrada com a máscara aplicada
    });
}