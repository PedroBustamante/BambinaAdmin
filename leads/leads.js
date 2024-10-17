document.getElementById('search-button').addEventListener('click', async () => {
    const nome_responsavel = document.getElementById('nome_responsavel').value;
    const nome_aluno = document.getElementById('nome_aluno').value;
    const telefone = document.getElementById('telefone').value;
    const origem = document.getElementById('origem').value;
    const status = document.getElementById('status').value;
    // Convertendo os valores booleanos em string para os parâmetros da URL

    const params = new URLSearchParams({
        nome_responsavel,
        nome_aluno,
        telefone,
        origem,
        status,
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
    

// Função para exibir os leads retornados com botão "Ver Detalhes"
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
            <button class="view-details" data-id="${lead.id}">Ver Detalhes</button>
        `;
        leadsResults.appendChild(leadItem);
    });

    // Adiciona event listener aos botões "Ver Detalhes"
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', () => {
            const leadId = button.getAttribute('data-id');
            window.location.href = `/leads/lead.html?id=${leadId}`;
        });
    });
}

// Abrir/Fechar Modal para adicionar leads
const modal = document.getElementById('add-lead-modal');
const addLeadButton = document.getElementById('add-lead-button');
const closeButton = document.querySelector('.close-button');

addLeadButton.addEventListener('click', () => {
    modal.classList.remove('hidden');
    modal.style.display = 'block';
});

closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Adicionar um novo lead (a partir da modal)
document.getElementById('add-lead-submit').addEventListener('click', async () => {
    const nome_responsavel = document.getElementById('modal-nome-responsavel').value;
    const nome_aluno = document.getElementById('modal-nome-aluno').value;
    const telefone = document.getElementById('modal-telefone').value;
    const origem = document.getElementById('modal-origem').value;
    const status = document.getElementById('modal-status').value;

    const novoLead = {
        nome_responsavel,
        nome_aluno,
        telefone,
        origem_aluno: origem,
        status_aluno: status,
    };

    try {
        const response = await fetch('https://bambina-admin-back.vercel.app/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoLead)
        });

        if (!response.ok) {
            throw new Error('Erro ao adicionar lead');
        }

        alert('Lead adicionado com sucesso!');
        modal.style.display = 'none'; // Fecha a modal após adicionar
    } catch (error) {
        console.error('Erro ao adicionar lead:', error);
    }
});
