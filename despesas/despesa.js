document.addEventListener('DOMContentLoaded', function() {
    const btnPesquisar = document.getElementById('btn-pesquisar');
    const tabelaDespesas = document.getElementById('tabela-despesas').getElementsByTagName('tbody')[0];
    const dataInicioInput = document.getElementById('data-inicio');
    const dataFimInput = document.getElementById('data-fim');
    const tipoSelect = document.getElementById('tipo');
    const referenciaInput = document.getElementById('referencia');
    const loadingSpinner = document.getElementById('loading-spinner');
    const somaTotalDiv = document.getElementById('soma-total');
    const totalValorSpan = document.getElementById('total-valor');

    // URL base do backend
    const apiUrl = 'https://bambina-admin-back.vercel.app/despesas';

    // Função para mostrar o spinner
    function mostrarSpinner() {
        loadingSpinner.classList.remove('hidden');
    }

    // Função para esconder o spinner
    function esconderSpinner() {
        loadingSpinner.classList.add('hidden');
    }

    // Função para buscar despesas
    async function buscarDespesas() {
        const dataInicio = dataInicioInput.value;
        const dataFim = dataFimInput.value;
        const tipo = tipoSelect.value;
        const referencia = referenciaInput.value.trim();

        // Montar query string
        let query = `${apiUrl}?`;
        if (dataInicio) query += `data_inicio=${dataInicio}&`;
        if (dataFim) query += `data_fim=${dataFim}&`;
        if (tipo) query += `tipo=${tipo}&`;
        if (referencia) query += `referencia=${encodeURIComponent(referencia)}&`;

        // Remover o último & se existir
        query = query.slice(0, -1);

        mostrarSpinner();
        tabelaDespesas.innerHTML = '';  // Limpar a tabela antes da nova pesquisa

        try {
            const response = await fetch(query);
            const despesas = await response.json();

            // Limpar a tabela antes de inserir os novos resultados
            tabelaDespesas.innerHTML = '';
            let somaTotal = 0;

            if (despesas.length === 0) {
                tabelaDespesas.innerHTML = '<tr><td colspan="4">Nenhuma despesa encontrada.</td></tr>';
                somaTotalDiv.classList.add('hidden');
                return;
            }

            // Preencher a tabela com os resultados
            despesas.forEach(despesa => {
                const row = tabelaDespesas.insertRow();
                row.insertCell(0).textContent = despesa.data;
                row.insertCell(1).textContent = `R$ ${despesa.valor.toFixed(2)}`;
                row.insertCell(2).textContent = despesa.tipo;
                row.insertCell(3).textContent = despesa.referencia || 'Sem referência';

                // Somar o valor da despesa
                somaTotal += despesa.valor;
            });

            // Exibir a soma total
            totalValorSpan.textContent = `R$ ${somaTotal.toFixed(2)}`;
            somaTotalDiv.classList.remove('hidden');
        } catch (error) {
            console.error('Erro ao buscar despesas:', error);
            tabelaDespesas.innerHTML = '<tr><td colspan="4">Erro ao buscar despesas.</td></tr>';
            somaTotalDiv.classList.add('hidden');
        } finally {
            esconderSpinner();
        }
    }

    // Adicionar evento ao botão de pesquisar
    btnPesquisar.addEventListener('click', buscarDespesas);
});
