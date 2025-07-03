
        let grandTotal = 0;

        function formatCurrency(value) {
            return `R$ ${value.toFixed(2).replace('.', ',')}`;
        }

        function addItem() {
            const productName = document.getElementById('productName').value;
            const quantity = parseInt(document.getElementById('quantity').value);
            const unitPrice = parseFloat(document.getElementById('unitPrice').value);

            // Validação básica
            if (productName === "" || isNaN(quantity) || quantity <= 0 || isNaN(unitPrice) || unitPrice < 0) {
                alert("Por favor, preencha todos os campos corretamente.");
                return;
            }

            const totalItem = quantity * unitPrice;
            grandTotal += totalItem;

            const tableBody = document.getElementById('shoppingListBody');
            const newRow = tableBody.insertRow();

            newRow.innerHTML = `
                <td>${productName}</td>
                <td>${quantity}</td>
                <td>${formatCurrency(unitPrice)}</td>
                <td>${formatCurrency(totalItem)}</td>
            `;

            document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);

            // Limpar campos após adicionar
            document.getElementById('productName').value = '';
            document.getElementById('quantity').value = ''; // Ou '0' se preferir começar com zero
            document.getElementById('unitPrice').value = '';
            document.getElementById('productName').focus(); // Volta o foco para o campo de produto
        }

        // Para permitir adicionar item pressionando Enter no campo de preço
        document.getElementById('unitPrice').addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Impede o comportamento padrão (submit de formulário)
                addItem();
            }
        });
// Lógica para pular para o próximo campo com Enter no campo de produto
document.getElementById('productName').addEventListener('keypress', function(event) {
    // Verifica se a tecla pressionada foi Enter (código 13 ou a propriedade 'Enter')
    if (event.key === 'Enter') {
        event.preventDefault(); // Impede o comportamento padrão de submit (se houvesse um formulário)
        document.getElementById('quantity').focus(); // Foca no campo de quantidade
    }
});

// Para pular de quantidade para preço unitário com Enter
document.getElementById('quantity').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('unitPrice').focus(); // Foca no campo de preço unitário
    }
});

// O código para pular do preço unitário para adicionar item (apertando Enter) já existe!
// Se você apertar Enter no campo de preço, ele chamará a função addItem().
// Não precisamos adicionar nada para esse, pois já está lá.
        // Inicializa o total geral ao carregar a página
        document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);

