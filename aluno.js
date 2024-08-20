document.addEventListener('DOMContentLoaded', function() {
    const detalhesAluno = document.getElementById('detalhes-aluno');
    
    // Obter o ID do aluno da URL
    const urlParams = new URLSearchParams(window.location.search);
    const alunoId = urlParams.get('id');

    // Carregar dados dos JSONs
    let alunos = [];
    let turmas = [];

    // Função para exibir detalhes do aluno
    function exibirDetalhesAluno(aluno) {
        const turmasDoAluno = aluno.ids_turmas.map(id => {
            const turma = turmas.find(turma => turma.id === id);
            return `${turma.nome} (${turma.horario})`;
        }).join(', ');

        detalhesAluno.innerHTML = `
            <h2>${aluno.nome}</h2>
            <p><strong>Responsável:</strong> ${aluno.responsavel}</p>
            <p><strong>Turmas:</strong> ${turmasDoAluno}</p>
            <p><strong>Telefone:</strong> ${aluno.telefone}</p>
            <p><strong>Email:</strong> ${aluno.email}</p>
            <p><strong>Data de Nascimento:</strong> ${aluno.data_nascimento}</p>
            <p><strong>País de Nascimento:</strong> ${aluno.pais_nascimento}</p>
            <p><strong>Escola/Profissão:</strong> ${aluno.escola_profissao}</p>
            <p><strong>CEP:</strong> ${aluno.cep}</p>
            <p><strong>Endereço:</strong> ${aluno.endereco}</p>
            <p><strong>Contato de Emergência:</strong> ${aluno.contato_emergencia}</p>
            <p><strong>Convênio de Saúde:</strong> ${aluno.convenio_saude}</p>
            <p><strong>Doenças e Necessidades Especiais:</strong> ${aluno.doencas_necessidades_especiais}</p>
            <p><strong>Alergias:</strong> ${aluno.alergias}</p>
            <p><strong>Forma de Pagamento:</strong> ${aluno.forma_pagamento}</p>
            <p><strong>Data de Ingresso:</strong> ${aluno.data_ingresso}</p>
            <p><strong>Data de Saída:</strong> ${aluno.data_saida ? aluno.data_saida : 'Ainda matriculado'}</p>
            <p><strong>Uso de Imagem:</strong> ${aluno.uso_imagem ? 'Sim' : 'Não'}</p>
            <p><strong>Período Experimental:</strong> ${aluno.experimental ? 'Sim' : 'Não'}</p>
        `;
    }

    // Carregar os dados e exibir os detalhes
    Promise.all([
        fetch('alunos.json').then(response => response.json()).then(data => alunos = data.alunos),
        fetch('turmas.json').then(response => response.json()).then(data => turmas = data.turmas)
    ]).then(() => {
        const aluno = alunos.find(a => a.id == alunoId);
        if (aluno) {
            exibirDetalhesAluno(aluno);
        } else {
            detalhesAluno.innerHTML = '<p>Aluno não encontrado.</p>';
        }
    });
});