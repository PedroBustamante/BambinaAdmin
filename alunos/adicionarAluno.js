document.addEventListener('DOMContentLoaded', function() {
    const turmasSelect = document.getElementById('turmas');
    const turmasContainer = document.getElementById('turmas-container');
    const adicionarTurmaButton = document.getElementById('adicionar-turma');
    const removerTurmaButton = document.getElementById('remover-turma'); // Botão de remover turma

    function toNull(value) {
        return value === '' ? null : value;
    }

    // Função para mostrar ou esconder o botão "Remover Última Turma"
    function verificarBotaoRemover() {
        const selects = turmasContainer.querySelectorAll('select[name="turmas"]');
        if (selects.length > 1) {
            removerTurmaButton.classList.remove('hidden');
        } else {
            removerTurmaButton.classList.add('hidden');
        }
    }

    // Carregar turmas disponíveis
    fetch('https://bambina-admin-back.vercel.app/turmas')
        .then(response => response.json())
        .then(data => {
            const turmas = data;
            turmas.forEach(turma => {
                const option = document.createElement('option');
                option.value = turma.id;
                option.textContent = `${turma.nome} (${turma.horario})`;
                turmasSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar turmas:', error);
            alert('Erro ao carregar turmas. Tente novamente mais tarde.');
        });

    document.getElementById('form-adicionar-aluno').addEventListener('submit', function(event) {
        event.preventDefault();

        // Pega todos os valores selecionados nas turmas
        const selects = document.querySelectorAll('#turmas-container select[name="turmas"]');

        // Filtra as opções que foram selecionadas e não são vazias
        const turmasSelecionadas = Array.from(selects)
            .map(select => select.value)  // Obtém o valor selecionado de cada <select>
            .filter(value => value !== '');  // Filtra os valores vazios

        const novoAluno = {
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
            data_saida: toNull(document.getElementById('data_saida').value),
            uso_imagem: document.getElementById('uso_imagem').checked,
            ids_turmas: turmasSelecionadas // Lista de IDs das turmas selecionadas
        };

        // Enviar dados para o servidor
        fetch('https://bambina-admin-back.vercel.app/alunos/adicionar-aluno', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoAluno)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error || 'Erro ao adicionar aluno');
                });
            }
            return response.json();
        })
        .then(_ => {
            alert('Aluno adicionado com sucesso!');
        })
        .catch(error => {
            console.log({error});
            alert('Erro ao adicionar aluno. Tente novamente mais tarde.');
        });
    });

    // Função para adicionar um novo campo de seleção de turma
    adicionarTurmaButton.addEventListener('click', function() {
        const novaDiv = document.createElement('div');
        novaDiv.classList.add('turma-selecionada');

        const novoSelect = document.createElement('select');
        novoSelect.name = 'turmas';  // Note que estamos utilizando um array para o name
        novoSelect.required = true;

        // Copiar as opções do primeiro select
        const opcoes = turmasSelect.innerHTML;
        novoSelect.innerHTML = opcoes;

        // Adiciona o novo select no container
        novaDiv.appendChild(novoSelect);
        turmasContainer.appendChild(novaDiv);

        // Verifica se deve mostrar o botão "Remover Última Turma"
        verificarBotaoRemover();
    });

    // Função para remover o último campo de seleção de turma
    removerTurmaButton.addEventListener('click', function() {
        const selects = turmasContainer.querySelectorAll('select[name="turmas"]');
        if (selects.length > 1) {
            selects[selects.length - 1].parentElement.remove();  // Remove a última div com o select
        }

        // Verifica se deve esconder o botão "Remover Última Turma"
        verificarBotaoRemover();
    });

    // Verifica o estado inicial do botão de remover
    verificarBotaoRemover();
});
