document.addEventListener('DOMContentLoaded', function() {
    const detalhesAluno = document.getElementById('detalhes-aluno');
    
    // Obter o ID do aluno da URL
    const urlParams = new URLSearchParams(window.location.search);
    const alunoId = urlParams.get('id');

    // Carregar dados dos JSONs
    let alunos = [];
    let turmas = [];

    // Função para exibir os campos de edição do aluno
    function exibirFormularioEdicao(aluno) {
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
        fetch('alunos.json').then(response => response.json()).then(data => alunos = data.alunos),
        fetch('turmas.json').then(response => response.json()).then(data => turmas = data.turmas)
    ]).then(() => {
        const aluno = alunos.find(a => a.id == alunoId);
        if (aluno) {
            exibirFormularioEdicao(aluno);
        } else {
            detalhesAluno.innerHTML = '<p>Aluno não encontrado.</p>';
        }
    });
});
