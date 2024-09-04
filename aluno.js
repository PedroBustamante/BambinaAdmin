document.addEventListener('DOMContentLoaded', function() {
    const detalhesAluno = document.getElementById('detalhes-aluno');
    const menuOverview = document.getElementById('menu-overview');
    const menuDados = document.getElementById('menu-dados');
    const menuPagamentos = document.getElementById('menu-pagamentos');

    const urlParams = new URLSearchParams(window.location.search);
    const alunoId = urlParams.get('id');

    let turmas = [];
    let pagamentos = [];
    let alunoEspecifico = null;
    const alunoEspecificoUrl =  `https://bambina-admin-back.vercel.app/alunos/aluno/${alunoId}`;
    const turmasUrl = `https://bambina-admin-back.vercel.app/turmas`;
    const pagamentosUrl = `https://bambina-admin-back.vercel.app/pagamentos/aluno/${alunoId}`;

    function handleNull(value) {
        return (value === null) || (value === 'null') ? '' : value;
    }

    function toNull(value) {
        return value === '' ? null : value;
    }

    function calcularIdade(dataNascimento) {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        return idade;
    }

    function exibirOverview(aluno) {
        const turmasDoAluno = aluno.ids_turmas.map(id => {
            const turma = turmas.find(turma => turma.id === id);
            return `${turma.nome} (${turma.horario})`;
        }).join(', ');

        const idade = calcularIdade(aluno.data_nascimento);
        const status = aluno.data_saida ? 'Ex Aluno' : (aluno.experimental ? 'Aluno em Período Experimental' : 'Aluno Ativo');
        const usoImagem = aluno.uso_imagem ? 'Permite uso de imagem' : 'Não permite uso de imagem';

        detalhesAluno.innerHTML = `
            <div class="overview-content">
                <h2>${aluno.nome}</h2>
                <p><strong>Responsável:</strong> ${handleNull(aluno.responsavel)}</p>
                <p><strong>Turmas:</strong> ${turmasDoAluno}</p>
                <p><strong>Idade:</strong> ${idade} anos</p>
                <p><strong>Status:</strong> ${status}</p>
                <p><strong>Uso de Imagem:</strong> ${usoImagem}</p>
            </div>
        `;
    }

    function exibirDados(aluno) {
        const turmasDoAluno = aluno.ids_turmas.map(id => {
            const turma = turmas.find(turma => turma.id === id);
            return turma ? turma.id : ''; // Seleciona o ID da turma para usar no dropdown
        });
    
        // Gerar as opções do dropdown com todas as turmas disponíveis
        const turmasOptions = turmas.map(turma => {
            const selected = turmasDoAluno.includes(turma.id) ? 'selected' : ''; // Marca como selecionada se o aluno estiver nessa turma
            return `<option value="${turma.id}" ${selected}>${turma.nome} (${turma.horario})</option>`;
        }).join('');
    
        detalhesAluno.innerHTML = `
            <form id="form-editar-aluno">
                <label for="nome">Nome:</label>
                <input type="text" id="nome" name="nome" value="${handleNull(aluno.nome)}" disabled required>
                
                <label for="responsavel">Responsável:</label>
                <input type="text" id="responsavel" name="responsavel" value="${handleNull(aluno.responsavel)}" disabled>
                
                <label for="turmas">Turmas:</label>
                <select id="turmas" name="turmas" disabled required>
                    ${turmasOptions}
                </select>
                
                <label for="telefone">Telefone:</label>
                <input type="text" id="telefone" name="telefone" value="${handleNull(aluno.telefone)}" disabled required>

                <label for="data_nascimento">Data de Nascimento:</label>
                <input type="date" id="data_nascimento" name="data_nascimento" value="${aluno.data_nascimento}" disabled required>

                <label for="data_ingresso">Data de Ingresso:</label>
                <input type="date" id="data_ingresso" name="data_ingresso" value="${aluno.data_ingresso}" disabled required>
                
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" value="${handleNull(aluno.email)}" disabled>
                
                <label for="pais_nascimento">País de Nascimento:</label>
                <input type="text" id="pais_nascimento" name="pais_nascimento" value="${handleNull(aluno.pais_nascimento)}" disabled>
                
                <label for="escola_profissao">Escola/Profissão:</label>
                <input type="text" id="escola_profissao" name="escola_profissao" value="${handleNull(aluno.escola_profissao)}" disabled>
                
                <label for="cep">CEP:</label>
                <input type="text" id="cep" name="cep" value="${handleNull(aluno.cep)}" disabled>
                
                <label for="endereco">Endereço:</label>
                <input type="text" id="endereco" name="endereco" value="${handleNull(aluno.endereco)}" disabled>
                
                <label for="contato_emergencia">Contato de Emergência:</label>
                <input type="text" id="contato_emergencia" name="contato_emergencia" value="${handleNull(aluno.contato_emergencia)}" disabled>
                
                <label for="convenio_saude">Convênio de Saúde:</label>
                <input type="text" id="convenio_saude" name="convenio_saude" value="${handleNull(aluno.convenio_saude)}" disabled>
                
                <label for="doencas_necessidades_especiais">Doenças e Necessidades Especiais:</label>
                <input type="text" id="doencas_necessidades_especiais" name="doencas_necessidades_especiais" value="${handleNull(aluno.doencas_necessidades_especiais)}" disabled>
                
                <label for="alergias">Alergias:</label>
                <input type="text" id="alergias" name="alergias" value="${handleNull(aluno.alergias)}" disabled>
                
                <label for="forma_pagamento">Forma de Pagamento:</label>
                <input type="text" id="forma_pagamento" name="forma_pagamento" value="${handleNull(aluno.forma_pagamento)}" disabled>
                
                <label for="data_saida">Data de Saída:</label>
                <input type="date" id="data_saida" name="data_saida" value="${aluno.data_saida}" disabled>
                
                <label for="uso_imagem">Permite Uso de Imagem:</label>
                <input type="checkbox" id="uso_imagem" name="uso_imagem" ${aluno.uso_imagem ? 'checked' : ''} disabled>
                
                <label for="experimental">Período Experimental:</label>
                <input type="checkbox" id="experimental" name="experimental" ${aluno.experimental ? 'checked' : ''} disabled>
                
                <button type="button" id="editar-dados">Editar Dados</button>
                <button type="button" id="cancelar-edicao" class="hidden">Cancelar Edição</button>
                <button type="submit" id="salvar-dados" disabled>Salvar Alterações</button>
            </form>
        `;
    
        const editarButton = document.getElementById('editar-dados');
        const salvarButton = document.getElementById('salvar-dados');
        const cancelarButton = document.getElementById('cancelar-edicao');
    
        // Habilitar edição ao clicar no botão "Editar Dados"
        editarButton.addEventListener('click', function() {
            const inputs = document.querySelectorAll('#form-editar-aluno input, #form-editar-aluno select');
            inputs.forEach(input => input.disabled = false);
            salvarButton.disabled = false;
            cancelarButton.classList.remove('hidden');
            editarButton.disabled = true; // Desabilita o botão de edição enquanto a edição está ativa
        });
    
        // Cancelar edição e restaurar os valores originais
        cancelarButton.addEventListener('click', function() {
            exibirDados(alunoEspecifico); // Restaura os dados originais
            cancelarButton.classList.add('hidden'); // Esconde o botão "Cancelar Edição"
            editarButton.disabled = false; // Reabilita o botão de edição
        });
    
        // Enviar os dados editados para o servidor ao clicar em "Salvar Alterações"
        document.getElementById('form-editar-aluno').addEventListener('submit', function(event) {
            event.preventDefault();
        
            const dadosEditados = {
                nome: toNull(document.getElementById('nome').value),
                responsavel: toNull(document.getElementById('responsavel').value),
                telefone: toNull(document.getElementById('telefone').value),
                email: toNull(document.getElementById('email').value),
                data_nascimento: toNull(document.getElementById('data_nascimento').value),
                pais_nascimento: toNull(document.getElementById('pais_nascimento').value),
                escola_profissao: toNull(document.getElementById('escola_profissao').value),
                cep: toNull(document.getElementById('cep').value),
                endereco: toNull(document.getElementById('endereco').value),
                contato_emergencia: toNull(document.getElementById('contato_emergencia').value),
                convenio_saude: toNull(document.getElementById('convenio_saude').value),
                doencas_necessidades_especiais: toNull(document.getElementById('doencas_necessidades_especiais').value),
                alergias: toNull(document.getElementById('alergias').value),
                forma_pagamento: toNull(document.getElementById('forma_pagamento').value),
                data_ingresso: toNull(document.getElementById('data_ingresso').value),
                data_saida: toNull(document.getElementById('data_saida').value) || null,
                uso_imagem: document.getElementById('uso_imagem').checked,
                experimental: document.getElementById('experimental').checked,
                ids_turmas: Array.from(document.getElementById('turmas').selectedOptions).map(option => parseInt(option.value))
            };
    
            fetch(`https://bambina-admin-back.vercel.app/alunos/editar-aluno/${alunoId}`, {
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
                fetch(alunoEspecificoUrl).then(response => response.json()).then(data =>    {
                    alunoEspecifico = data;
                    selecionarAba('dados');
                });
            })
            .catch(error => {
                console.error('Erro ao salvar os dados:', error);
                alert('Erro ao salvar os dados. Tente novamente mais tarde.');
            });
        });
    }

    function exibirPagamentos() {
        fetch(pagamentosUrl)
            .then(response => response.json())
            .then(data => {
                pagamentos = data;
                detalhesAluno.innerHTML = `
                    <div class="pagamentos-header">
                        <h3>Pagamentos</h3>
                        <button id="btn-adicionar-pagamento">Adicionar Pagamento</button>
                    </div>
                    ${pagamentos.length === 0 ? '<p>Nenhum pagamento registrado para este aluno.</p>' : pagamentos.map(p => `
                        <div class="pagamento-item">
                            <p><strong>Data do Pagamento:</strong> ${p.data_pagamento}</p>
                            <p><strong>Valor:</strong> R$ ${p.valor.toFixed(2)}</p>
                            <p><strong>Referência:</strong> ${p.referencia}</p>
                            <p><strong>Observações:</strong> ${p.observacoes || ''}</p>
                        </div>
                    `).join('')}
                `;
    
                // Adicionar funcionalidade ao botão de adicionar pagamento
                const btnAdicionarPagamento = document.getElementById('btn-adicionar-pagamento');
                btnAdicionarPagamento.addEventListener('click', function() {
                    exibirModalPagamento(); // Função para exibir a modal de pagamento
                });
            })
            .catch(error => {
                console.error('Erro ao carregar pagamentos:', error);
                detalhesAluno.innerHTML = '<p>Erro ao carregar os pagamentos.</p>';
            });
    }

    function exibirModalPagamento() {
        // Cria a estrutura HTML para a modal
        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal">
                    <h3>Adicionar Pagamento</h3>
                    <form id="form-adicionar-pagamento">
                        <label for="data_pagamento">Data do Pagamento:</label>
                        <input type="date" id="data_pagamento" name="data_pagamento" required>
    
                        <label for="valor">Valor:</label>
                        <input type="number" id="valor" name="valor" step="0.01" required>
    
                        <label for="referencia">Referência:</label>
                        <input type="text" id="referencia" name="referencia" required>
    
                        <label for="observacoes">Observações:</label>
                        <textarea id="observacoes" name="observacoes"></textarea>
    
                        <button type="submit">Adicionar</button>
                        <button type="button" id="btn-cancelar">Cancelar</button>
                    </form>
                </div>
            </div>
        `;
    
        // Adiciona a modal ao body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    
        // Função para remover a modal
        function fecharModal() {
            const modalOverlay = document.querySelector('.modal-overlay');
            if (modalOverlay) {
                modalOverlay.remove();
            }
        }
    
        // Adiciona evento para fechar a modal ao clicar em cancelar
        document.getElementById('btn-cancelar').addEventListener('click', fecharModal);
    
        // Adiciona evento para processar o formulário de pagamento
        document.getElementById('form-adicionar-pagamento').addEventListener('submit', function(event) {
            event.preventDefault();
    
            const novoPagamento = {
                aluno_id: alunoId, // ID do aluno atual
                data_pagamento: document.getElementById('data_pagamento').value,
                valor: parseFloat(document.getElementById('valor').value),
                referencia: document.getElementById('referencia').value,
                observacoes: document.getElementById('observacoes').value || null
            };
    
            // Envia o novo pagamento para o servidor
            fetch('https://bambina-admin-back.vercel.app/pagamentos/adicionar-pagamento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(novoPagamento)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao adicionar pagamento.');
                }
                return response.json();
            })
            .then(data => {
                alert('Pagamento adicionado com sucesso!');
                fecharModal();
                selecionarAba('pagamentos'); // Recarrega os pagamentos após adicionar um novo
            })
            .catch(error => {
                console.error('Erro ao adicionar pagamento:', error);
                alert('Erro ao adicionar pagamento. Tente novamente mais tarde.');
            });
        });
    }
    
    
    function selecionarAba(aba) {
        menuOverview.classList.remove('active');
        menuDados.classList.remove('active');
        menuPagamentos.classList.remove('active');

        if (aba === 'overview') {
            menuOverview.classList.add('active');
            exibirOverview(alunoEspecifico);
        } else if (aba === 'dados') {
            menuDados.classList.add('active');
            exibirDados(alunoEspecifico);
        } else if (aba === 'pagamentos') {
            menuPagamentos.classList.add('active');
            exibirPagamentos();
        }
    }

    // Carregar dados iniciais
    Promise.all([
        fetch(alunoEspecificoUrl).then(response => response.json()).then(data => alunoEspecifico = data),
        fetch(turmasUrl).then(response => response.json()).then(data => turmas = data)
    ]).then(() => {
        if (alunoEspecifico) {
            selecionarAba('overview'); // Exibe o overview por padrão
        } else {
            detalhesAluno.innerHTML = '<p>Aluno não encontrado.</p>';
        }
    });

    menuOverview.addEventListener('click', () => selecionarAba('overview'));
    menuDados.addEventListener('click', () => selecionarAba('dados'));
    menuPagamentos.addEventListener('click', () => selecionarAba('pagamentos'));
});
