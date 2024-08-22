document.addEventListener('DOMContentLoaded', function() {
    const turmasSelect = document.getElementById('turmas');

    // Carregar turmas disponíveis
    fetch('turmas.json')
        .then(response => response.json())
        .then(data => {
            const turmas = data.turmas;
            turmas.forEach(turma => {
                const option = document.createElement('option');
                option.value = turma.id;
                option.textContent = `${turma.nome} (${turma.horario})`;
                turmasSelect.appendChild(option);
            });
        });

    document.getElementById('form-adicionar-aluno').addEventListener('submit', function(event) {
        event.preventDefault();

        const novoAluno = {
            nome: document.getElementById('nome').value,
            responsavel: document.getElementById('responsavel').value,
            telefone: document.getElementById('telefone').value,
            email: document.getElementById('email').value,
            data_nascimento: document.getElementById('data_nascimento').value,
            pais_nascimento: document.getElementById('pais_nascimento').value,
            escola_profissao: document.getElementById('escola_profissao').value,
            cep: document.getElementById('cep').value,
            endereco: document.getElementById('endereco').value,
            contato_emergencia: document.getElementById('contato_emergencia').value,
            convenio_saude: document.getElementById('convenio_saude').value,
            doencas_necessidades_especiais: document.getElementById('doencas_necessidades_especiais').value,
            alergias: document.getElementById('alergias').value,
            forma_pagamento: document.getElementById('forma_pagamento').value,
            data_ingresso: document.getElementById('data_ingresso').value,
            data_saida: document.getElementById('data_saida').value,
            uso_imagem: document.getElementById('uso_imagem').checked,
            experimental: document.getElementById('experimental').checked,
            ids_turmas: [parseInt(document.getElementById('turmas').value)] // Seleciona apenas uma turma
        };

        console.log('Novo Aluno Adicionado:', novoAluno);

        // Aqui, você pode enviar os dados para um servidor ou salvá-los localmente
        alert('Aluno adicionado com sucesso!');
    });
});
