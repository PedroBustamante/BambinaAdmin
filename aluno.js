document.addEventListener('DOMContentLoaded', function() {
    const detalhesAluno = document.getElementById('detalhes-aluno');
    const menuOverview = document.getElementById('menu-overview');
    const menuDados = document.getElementById('menu-dados');
    const menuPagamentos = document.getElementById('menu-pagamentos');

    const urlParams = new URLSearchParams(window.location.search);
    const alunoId = urlParams.get('id');

    let alunoSelecionado = null;
    let alunos = [];
    let turmas = [];
    let pagamentos = [];
    const alunosUrl = `https://bambina-admin-back.vercel.app/alunos`;
    const turmasUrl = `https://bambina-admin-back.vercel.app/turmas`;

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
                <p><strong>Responsável:</strong> ${aluno.responsavel}</p>
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
                    return `${turma.nome} (${turma.horario})`;
                }).join(', ');
        
                detalhesAluno.innerHTML = `
                    <form id="form-editar-aluno">
                        <label for="nome">Nome:</label>
                        <input type="text" id="nome" name="nome" value="${aluno.nome}" disabled>
                        
                        <label for="responsavel">Responsável:</label>
                        <input type="text" id="responsavel" name="responsavel" value="${aluno.responsavel}" disabled>
                        
                        <label for="turmas">Turmas:</label>
                        <input type="text" id="turmas" name="turmas" value="${turmasDoAluno}" disabled>
                        
                        <label for="telefone">Telefone:</label>
                        <input type="text" id="telefone" name="telefone" value="${aluno.telefone}" disabled>
                        
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" value="${aluno.email}" disabled>
                        
                        <label for="data_nascimento">Data de Nascimento:</label>
                        <input type="date" id="data_nascimento" name="data_nascimento" value="${aluno.data_nascimento}" disabled>
                        
                        <label for="pais_nascimento">País de Nascimento:</label>
                        <input type="text" id="pais_nascimento" name="pais_nascimento" value="${aluno.pais_nascimento}" disabled>
                        
                        <label for="escola_profissao">Escola/Profissão:</label>
                        <input type="text" id="escola_profissao" name="escola_profissao" value="${aluno.escola_profissao}" disabled>
                        
                        <label for="cep">CEP:</label>
                        <input type="text" id="cep" name="cep" value="${aluno.cep}" disabled>
                        
                        <label for="endereco">Endereço:</label>
                        <input type="text" id="endereco" name="endereco" value="${aluno.endereco}" disabled>
                        
                        <label for="contato_emergencia">Contato de Emergência:</label>
                        <input type="text" id="contato_emergencia" name="contato_emergencia" value="${aluno.contato_emergencia}" disabled>
                        
                        <label for="convenio_saude">Convênio de Saúde:</label>
                        <input type="text" id="convenio_saude" name="convenio_saude" value="${aluno.convenio_saude}" disabled>
                        
                        <label for="doencas_necessidades_especiais">Doenças e Necessidades Especiais:</label>
                        <input type="text" id="doencas_necessidades_especiais" name="doencas_necessidades_especiais" value="${aluno.doencas_necessidades_especiais}" disabled>
                        
                        <label for="alergias">Alergias:</label>
                        <input type="text" id="alergias" name="alergias" value="${aluno.alergias}" disabled>
                        
                        <label for="forma_pagamento">Forma de Pagamento:</label>
                        <input type="text" id="forma_pagamento" name="forma_pagamento" value="${aluno.forma_pagamento}" disabled>
                        
                        <label for="data_ingresso">Data de Ingresso:</label>
                        <input type="date" id="data_ingresso" name="data_ingresso" value="${aluno.data_ingresso}" disabled>
                        
                        <label for="data_saida">Data de Saída:</label>
                        <input type="date" id="data_saida" name="data_saida" value="${aluno.data_saida || ''}" disabled>
                        
                        <label for="uso_imagem">Permite Uso de Imagem:</label>
                        <input type="checkbox" id="uso_imagem" name="uso_imagem" ${aluno.uso_imagem ? 'checked' : ''} disabled>
                        
                        <label for="experimental">Período Experimental:</label>
                        <input type="checkbox" id="experimental" name="experimental" ${aluno.experimental ? 'checked' : ''} disabled>
                        
                        <button type="button" id="editar-dados">Editar Dados</button>
                        <button type="submit" id="salvar-dados" disabled>Salvar Alterações</button>
                    </form>
                `;
        
                // Adicionar funcionalidade ao botão "Editar Dados"
                const editarButton = document.getElementById('editar-dados');
                const salvarButton = document.getElementById('salvar-dados');
                editarButton.addEventListener('click', function() {
                    const inputs = document.querySelectorAll('#form-editar-aluno input');
                    inputs.forEach(input => input.disabled = false);
                    salvarButton.disabled = false;
                });
            }
        
            // Carregar os dados e exibir o formulário de edição
            Promise.all([
                fetch(alunosUrl).then(response => response.json()).then(data => alunos = data),
                fetch(turmasUrl).then(response => response.json()).then(data => turmas = data)
            ]).then(() => {
                alunoSelecionado = alunos.find(a => a.id == alunoId);
                if (alunoSelecionado) {
                    exibirOverview(alunoSelecionado);
                } else {
                    detalhesAluno.innerHTML = '<p>Aluno não encontrado.</p>';
                }
            }).catch(error => {
                console.error('Erro ao carregar os dados:', error);
                detalhesAluno.innerHTML = '<p>Erro ao carregar os dados.</p>';
            });

    function exibirPagamentos(alunoId) {
        const pagamentosDoAluno = pagamentos.filter(p => p.aluno_id == alunoId);

        if (pagamentosDoAluno.length === 0) {
            detalhesAluno.innerHTML = '<p>Nenhum pagamento registrado para este aluno.</p>';
        } else {
            detalhesAluno.innerHTML = pagamentosDoAluno.map(p => `
                <div class="pagamento-item">
                    <p><strong>Data do Pagamento:</strong> ${p.data_pagamento}</p>
                    <p><strong>Valor:</strong> R$ ${p.valor.toFixed(2)}</p>
                    <p><strong>Referência:</strong> ${p.referencia}</p>
                </div>
            `).join('');
        }
    }

    function selecionarAba(aba) {
        menuOverview.classList.remove('active');
        menuDados.classList.remove('active');
        menuPagamentos.classList.remove('active');

        if (aba === 'overview') {
            menuOverview.classList.add('active');
            exibirOverview(alunoSelecionado);
        } else if (aba === 'dados') {
            menuDados.classList.add('active');
            exibirDados(alunoSelecionado);
        } else if (aba === 'pagamentos') {
            menuPagamentos.classList.add('active');
            exibirPagamentos(alunoSelecionado.id);
        }
    }

    Promise.all([
        fetch(alunosUrl).then(response => response.json()).then(data => alunos = data),
        fetch(turmasUrl).then(response => response.json()).then(data => turmas = data),
        fetch('pagamentos.json').then(response => response.json()).then(data => pagamentos = data.pagamentos)
    ]).then(() => {
        alunoSelecionado = alunos.find(a => a.id == alunoId);
        if (alunoSelecionado) {
            selecionarAba('overview'); // Exibe o overview por padrão
        } else {
            detalhesAluno.innerHTML = '<p>Aluno não encontrado.</p>';
        }
    });

    menuOverview.addEventListener('click', () => selecionarAba('overview'));
    menuDados.addEventListener('click', () => selecionarAba('dados'));
    menuPagamentos.addEventListener('click', () => selecionarAba('pagamentos'));
});
