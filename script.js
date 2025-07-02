<script>
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
            document.getElementById('quantity').value = '1';
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

        // Inicializa o total geral ao carregar a página
        document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);

    </script>