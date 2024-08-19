document.addEventListener('DOMContentLoaded', function() {
    const alunoFiltro = document.getElementById('aluno-filtro');
    const professorFiltro = document.getElementById('professor-filtro');
    const turmaFiltro = document.getElementById('turma-filtro');
    const resultadosLista = document.getElementById('resultados-lista');

    // Carregar dados dos JSONs
    let alunos = [];
    let professores = [];
    let turmas = [];

    fetch('alunos.json')
        .then(response => response.json())
        .then(data => alunos = data.alunos);

    fetch('professores.json')
        .then(response => response.json())
        .then(data => professores = data.professores);

    fetch('turmas.json')
        .then(response => response.json())
        .then(data => turmas = data.turmas);

    // Filtrar e exibir resultados
    function filtrarResultados() {
        const alunoFiltroValue = alunoFiltro.value.toLowerCase();
        const professorFiltroValue = professorFiltro.value.toLowerCase();
        const turmaFiltroValue = turmaFiltro.value;

        let resultados = [];

        // Filtrar alunos
        alunos.forEach(aluno => {
            const alunoNome = aluno.nome.toLowerCase();
            const alunoTurmas = aluno.ids_turmas.map(id => turmas.find(turma => turma.id === id).nome);

            if (alunoNome.includes(alunoFiltroValue) &&
                (!turmaFiltroValue || alunoTurmas.includes(turmaFiltroValue))) {
                resultados.push({
                    tipo: 'Aluno',
                    nome: aluno.nome,
                    detalhes: `Turmas: ${alunoTurmas.join(', ')}`
                });
            }
        });

        // Filtrar professores
        professores.forEach(professor => {
            const professorNome = professor.nome_completo.toLowerCase();

            if (professorNome.includes(professorFiltroValue)) {
                resultados.push({
                    tipo: 'Professor',
                    nome: professor.nome_completo,
                    detalhes: `Telefone: ${professor.telefone}`
                });
            }
        });

        // Exibir resultados
        resultadosLista.innerHTML = resultados.length > 0 ? resultados.map(r => `
            <div class="resultado-item">
                <h3>${r.tipo}: ${r.nome}</h3>
                <p>${r.detalhes}</p>
            </div>
        `).join('') : '<p>Nenhum resultado encontrado.</p>';
    }

    // Adicionar eventos de filtro
    alunoFiltro.addEventListener('input', filtrarResultados);
    professorFiltro.addEventListener('input', filtrarResultados);
    turmaFiltro.addEventListener('change', filtrarResultados);
});