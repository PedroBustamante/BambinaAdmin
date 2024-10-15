document.getElementById('search-button').addEventListener('click', async () => {
    const nome_responsavel = document.getElementById('nome_responsavel').value;
    const nome_aluno = document.getElementById('nome_aluno').value;
    const telefone = document.getElementById('telefone').value;
    const origem = document.getElementById('origem').value;
    const status = document.getElementById('status').value;
    const ex_aluno = document.getElementById('ex_aluno').checked;
    const colonia_ferias = document.getElementById('colonia_ferias').checked;

    // Convertendo os valores booleanos em string para os parâmetros da URL
    const ex_aluno_param = ex_aluno ? 'true' : 'false';
    const colonia_ferias_param = colonia_ferias ? 'true' : 'false';

    const params = new URLSearchParams({
        nome_responsavel,
        nome_aluno,
        telefone,
        origem,
        status,
        ex_aluno: ex_aluno_param,
        colonia_ferias: colonia_ferias_param
    });

    // Mostrar a roda de carregamento
    document.getElementById('loading-spinner').classList.remove('hidden');
    document.getElementById('leads-results').style.display = 'none'; // Esconder os resultados enquanto carrega

    try {
        // Fazendo a requisição GET para a API de leads com os parâmetros de filtro
        const response = await fetch(`https://bambina-admin-back.vercel.app/leads?${params}`, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        const data = await response.json();
        displayLeads(data.data);  // Exibe os leads atualizados
    } catch (error) {
        console.error('Erro ao buscar leads:', error);
    } finally {
        // Ocultar a roda de carregamento após a conclusão
        document.getElementById('loading-spinner').classList.add('hidden');
        document.getElementById('leads-results').style.display = 'block'; // Mostrar os resultados
    }
});

// Função para exibir os leads retornados (apenas 4 informações: nome do aluno, nome do responsável, telefone e status)
function displayLeads(leads) {
    const leadsResults = document.getElementById('leads-results');
    leadsResults.innerHTML = ''; // Limpa os resultados anteriores

    if (leads.length === 0) {
        leadsResults.innerHTML = '<p>Nenhum lead encontrado.</p>';
        return;
    }

    leads.forEach(lead => {
        const firstName = lead.nome_aluno ? lead.nome_aluno.split(' ')[0] : 'Sem Nome';

        const leadItem = document.createElement('div');
        leadItem.classList.add('lead-item');
        leadItem.innerHTML = `
            <h3>${firstName}</h3>
            <p><strong>Responsável:</strong> ${lead.nome_responsavel || 'Sem Responsável'}</p>
            <p><strong>Telefone:</strong> ${lead.telefone}</p>
            <p><strong>Status:</strong> ${lead.status_aluno}</p>
        `;
        leadsResults.appendChild(leadItem);
    });
}
