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
    const btnAdicionarDespesa = document.getElementById('btn-adicionar-despesa');
    const modalDespesa = document.getElementById('modal-despesa');
    const closeModalButton = document.querySelector('.close-button');
    const formAdicionarDespesa = document.getElementById('form-adicionar-despesa');

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

    // Função para abrir a modal
    function abrirModal() {
        modalDespesa.classList.remove('hidden');
    }

    // Função para fechar a modal
    function fecharModal() {
        modalDespesa.classList.add('hidden');
    }

    // Evento de clique para abrir a modal
    btnAdicionarDespesa.addEventListener('click', abrirModal);

    // Evento de clique para fechar a modal
    closeModalButton.addEventListener('click', fecharModal);

    // Função para buscar despesas
    async function buscarDespesas() {
        const dataInicio = dataInicioInput.value;
        const dataFim = dataFimInput.value;
        const tipo = tipoSelect.value;
        const referencia = referenciaInput.value.trim();

        let query = `${apiUrl}?`;
        if (dataInicio) query += `data_inicio=${dataInicio}&`;
        if (dataFim) query += `data_fim=${dataFim}&`;
        if (tipo) query += `tipo=${tipo}&`;
        if (referencia) query += `referencia=${encodeURIComponent(referencia)}&`;

        query = query.slice(0, -1);

        mostrarSpinner();
        tabelaDespesas.innerHTML = '';

        try {
            const response = await fetch(query);
            const despesas = await response.json();

            tabelaDespesas.innerHTML = '';
            let somaTotal = 0;

            if (despesas.length === 0) {
                tabelaDespesas.innerHTML = '<tr><td colspan="4">Nenhuma despesa encontrada.</td></tr>';
                somaTotalDiv.classList.add('hidden');
                return;
            }

            despesas.forEach(despesa => {
                const row = tabelaDespesas.insertRow();
                row.insertCell(0).textContent = despesa.data;
                row.insertCell(1).textContent = `R$ ${despesa.valor.toFixed(2)}`;
                row.insertCell(2).textContent = despesa.tipo;
                row.insertCell(3).textContent = despesa.referencia || 'Sem referência';
                somaTotal += despesa.valor;
            });

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

    // Função para adicionar despesa
    async function adicionarDespesa(event) {
        event.preventDefault();

        const valor = document.getElementById('valor').value;
        const data = document.getElementById('data-despesa').value;
        const tipo = document.getElementById('tipo-despesa').value;
        const referencia = document.getElementById('referencia-despesa').value;

        const novaDespesa = {
            valor: parseFloat(valor),
            data: data,
            tipo: tipo,
            referencia: referencia || null
        };

        try {
            const response = await fetch(`${apiUrl}/adicionar-despesa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(novaDespesa)
            });

            if (!response.ok) {
                throw new Error('Erro ao adicionar despesa');
            }

            alert('Despesa adicionada com sucesso!');
            fecharModal();
            buscarDespesas();  // Atualiza a tabela após adicionar a despesa
        } catch (error) {
            console.error('Erro ao adicionar despesa:', error);
            alert('Erro ao adicionar despesa');
        }
    }

    // Adicionar evento ao formulário para enviar a nova despesa
    formAdicionarDespesa.addEventListener('submit', adicionarDespesa);

    // Adicionar evento ao botão de pesquisar
    btnPesquisar.addEventListener('click', buscarDespesas);
});
