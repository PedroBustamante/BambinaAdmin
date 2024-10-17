document.addEventListener('DOMContentLoaded', function() {
    const detalhesLead = document.getElementById('detalhes-lead');
    const menuOverview = document.getElementById('menu-overview');
    const menuDados = document.getElementById('menu-dados');

    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('id');

    let leadEspecifico = null;
    const leadEspecificoUrl =  `https://bambina-admin-back.vercel.app/leads/${leadId}`;

    function handleNull(value) {
        return (value === null) || (value === 'null') ? '' : value;
    }

    function toNull(value) {
        return value === '' ? null : value;
    }

    function exibirOverview(lead) {
        const origem = lead.origem_aluno || 'Não informada';
        const status = lead.status_aluno || 'Não informado';
        const idade = lead.idade_aluno ? `${lead.idade_aluno} anos` : 'Não informada'; // Verifica se a idade está disponível

        detalhesLead.innerHTML = `
            <div class="overview-content">
                <h2>${lead.nome_aluno || 'Sem Nome'}</h2>
                <p><strong>Responsável:</strong> ${handleNull(lead.nome_responsavel)}</p>
                <p><strong>Idade:</strong> ${idade}</p> <!-- Adiciona a idade -->
                <p><strong>Telefone:</strong> ${handleNull(lead.telefone)}</p>
                <p><strong>Origem:</strong> ${origem}</p>
                <p><strong>Status:</strong> ${status}</p>
                <p><strong>Data do Último Contato:</strong> ${handleNull(lead.data_ultimo_contato)}</p>
                <p><strong>Observações:</strong> ${handleNull(lead.observacoes)}</p>
            </div>
        `;
    }

    function exibirDados(lead) {
        detalhesLead.innerHTML = `
            <form id="form-editar-lead">
                <label for="nome_aluno">Nome do Aluno:</label>
                <input type="text" id="nome_aluno" name="nome_aluno" value="${handleNull(lead.nome_aluno)}" disabled>
                
                <label for="nome_responsavel">Nome do Responsável:</label>
                <input type="text" id="nome_responsavel" name="nome_responsavel" value="${handleNull(lead.nome_responsavel)}" disabled>

                <label for="idade_aluno">Idade do Aluno:</label>
                <input type="number" id="idade_aluno" name="idade_aluno" value="${handleNull(lead.idade_aluno)}" disabled> <!-- Campo para idade -->
                
                <label for="telefone">Telefone:</label>
                <input type="text" id="telefone" name="telefone" value="${handleNull(lead.telefone)}" disabled>
                
                <label for="origem">Origem:</label>
                <select id="origem" name="origem" disabled>
                    <option value="">Selecione</option>
                    <option value="indicação" ${lead.origem_aluno === 'indicação' ? 'selected' : ''}>Indicação</option>
                    <option value="instagram" ${lead.origem_aluno === 'instagram' ? 'selected' : ''}>Instagram</option>
                    <option value="anúncio" ${lead.origem_aluno === 'anúncio' ? 'selected' : ''}>Anúncio</option>
                    <option value="visita" ${lead.origem_aluno === 'visita' ? 'selected' : ''}>Visita</option>
                    <option value="Julia" ${lead.origem_aluno === 'Julia' ? 'selected' : ''}>Julia</option>
                    <option value="outros" ${lead.origem_aluno === 'outros' ? 'selected' : ''}>Outros</option>
                </select>
                
                <label for="status">Status:</label>
                <select id="status" name="status" disabled>
                    <option value="">Selecione</option>
                    <option value="aguardando resposta" ${lead.status_aluno === 'aguardando resposta' ? 'selected' : ''}>Aguardando Resposta</option>
                    <option value="não tem interesse" ${lead.status_aluno === 'não tem interesse' ? 'selected' : ''}>Não tem Interesse</option>
                    <option value="entrar em contato em data específica" ${lead.status_aluno === 'entrar em contato em data específica' ? 'selected' : ''}>Entrar em Contato em Data Específica</option>
                    <option value="experimental agendada" ${lead.status_aluno === 'experimental agendada' ? 'selected' : ''}>Experimental Agendada</option>
                    <option value="problema de logística" ${lead.status_aluno === 'problema de logística' ? 'selected' : ''}>Problema de Logística</option>
                    <option value="matrículado" ${lead.status_aluno === 'matrículado' ? 'selected' : ''}>Matrículado</option>
                </select>

                <label for="data_ultimo_contato">Data do Último Contato:</label>
                <input type="date" id="data_ultimo_contato" name="data_ultimo_contato" value="${lead.data_ultimo_contato}" disabled>

                <label for="observacoes">Observações:</label>
                <textarea id="observacoes" name="observacoes" disabled>${handleNull(lead.observacoes)}</textarea>
    
                <button type="button" id="editar-dados">Editar Dados</button>
                <button type="submit" id="salvar-dados" disabled>Salvar Alterações</button>
            </form>
        `;

        const editarButton = document.getElementById('editar-dados');
        const salvarButton = document.getElementById('salvar-dados');

        // Habilitar edição ao clicar no botão "Editar Dados"
        editarButton.addEventListener('click', function() {
            const inputs = document.querySelectorAll('#form-editar-lead input, #form-editar-lead select, #form-editar-lead textarea');
            inputs.forEach(input => input.disabled = false);
            salvarButton.disabled = false;
            editarButton.disabled = true;
        });

        // Enviar os dados editados para o servidor ao clicar em "Salvar Alterações"
        document.getElementById('form-editar-lead').addEventListener('submit', function(event) {
            event.preventDefault();

            const dadosEditados = {
                nome_aluno: toNull(document.getElementById('nome_aluno').value),
                nome_responsavel: toNull(document.getElementById('nome_responsavel').value),
                idade_aluno: toNull(document.getElementById('idade_aluno').value), // Adiciona o campo de idade no envio
                telefone: toNull(document.getElementById('telefone').value),
                origem_aluno: toNull(document.getElementById('origem').value),
                status_aluno: toNull(document.getElementById('status').value),
                data_ultimo_contato: toNull(document.getElementById('data_ultimo_contato').value),
                observacoes: toNull(document.getElementById('observacoes').value)
            };

            fetch(`https://bambina-admin-back.vercel.app/leads/editar-lead/${leadId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosEditados)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao salvar os dados.');
                }
                return response.json();
            })
            .then(data => {
                alert('Dados salvos com sucesso!');
                fetch(leadEspecificoUrl).then(response => response.json()).then(data => {
                    leadEspecifico = data;
                    selecionarAba('dados');
                });
            })
            .catch(error => {
                console.error('Erro ao salvar os dados:', error);
                alert('Erro ao salvar os dados. Tente novamente mais tarde.');
            });
        });
    }

    function selecionarAba(aba) {
        menuOverview.classList.remove('active');
        menuDados.classList.remove('active');

        if (aba === 'overview') {
            menuOverview.classList.add('active');
            exibirOverview(leadEspecifico);
        } else if (aba === 'dados') {
            menuDados.classList.add('active');
            exibirDados(leadEspecifico);
        }
    }

    // Carregar dados iniciais
    fetch(leadEspecificoUrl)
        .then(response => response.json())
        .then(data => {
            leadEspecifico = data;
            if (leadEspecifico) {
                selecionarAba('overview'); // Exibe o overview por padrão
            } else {
                detalhesLead.innerHTML = '<p>Lead não encontrado.</p>';
            }
        })
        .catch(error => {
            console.error('Erro ao carregar os dados do lead:', error);
            detalhesLead.innerHTML = '<p>Erro ao carregar os dados do lead.</p>';
        });

    // Event listeners para alternar entre as abas de overview e dados
    menuOverview.addEventListener('click', () => selecionarAba('overview'));
    menuDados.addEventListener('click', () => selecionarAba('dados'));
});
