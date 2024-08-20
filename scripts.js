document.addEventListener('DOMContentLoaded', function() {
    const alunoFiltro = document.getElementById('aluno-filtro');
    const professorFiltro = document.getElementById('professor-filtro');
    const turmaFiltro = document.getElementById('turma-filtro');
    const resultadosLista = document.getElementById('resultados-lista');

    const menuAlunos = document.getElementById('menu-alunos');
    const menuProfessores = document.getElementById('menu-professores');
    const menuTurmas = document.getElementById('menu-turmas');

    const filtroAlunos = document.getElementById('filtro-alunos');
    const filtroProfessores = document.getElementById('filtro-professores');
    const filtroTurmas = document.getElementById('filtro-turmas');

    const mainContent = document.querySelector('main'); // Seleciona o conteúdo principal

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

    // Alternar filtros ao clicar no menu
    menuAlunos.addEventListener('click', function() {
        mostrarConteudo(); // Exibir o conteúdo
        selecionarFiltro('alunos');
    });

    menuProfessores.addEventListener('click', function() {
        mostrarConteudo(); // Exibir o conteúdo
        selecionarFiltro('professores');
    });

    menuTurmas.addEventListener('click', function() {
        mostrarConteudo(); // Exibir o conteúdo
        selecionarFiltro('turmas');
    });

    // Função para selecionar e exibir o filtro correto
    function selecionarFiltro(filtro) {
        filtroAlunos.style.display = filtro === 'alunos' ? 'block' : 'none';
        filtroProfessores.style.display = filtro === 'professores' ? 'block' : 'none';
        filtroTurmas.style.display = filtro === 'turmas' ? 'block' : 'none';

        filtrarResultados(); // Atualizar os resultados com base no filtro selecionado
    }

    // Função para exibir o conteúdo principal
    function mostrarConteudo() {
        mainContent.classList.remove('hidden');
    }

    // Filtrar e exibir resultados
    function filtrarResultados() {
        const alunoFiltroValue = alunoFiltro.value.toLowerCase();
        const professorFiltroValue = professorFiltro.value.toLowerCase();
        const turmaFiltroValue = turmaFiltro.value;

        let resultados = [];

        if (filtroAlunos.style.display === 'block') {
            // Filtrar alunos
            alunos.forEach(aluno => {
                const alunoNome = aluno.nome.toLowerCase();
                const alunoTurmas = aluno.ids_turmas.map(id => turmas.find(turma => turma.id === id).nome);

                if (alunoNome.includes(alunoFiltroValue) || alunoFiltroValue === '') {
                    resultados.push({
                        tipo: 'Aluno',
                        nome: aluno.nome,
                        detalhes: `Turmas: ${alunoTurmas.join(', ')}`
                    });
                }
            });
        } else if (filtroProfessores.style.display === 'block') {
            // Filtrar professores
            professores.forEach(professor => {
                const professorNome = professor.nome_completo.toLowerCase();

                if (professorNome.includes(professorFiltroValue) || professorFiltroValue === '') {
                    resultados.push({
                        tipo: 'Professor',
                        nome: professor.nome_completo,
                        detalhes: `Telefone: ${professor.telefone}`
                    });
                }
            });
        } else if (filtroTurmas.style.display === 'block') {
            // Filtrar turmas
            turmas.forEach(turma => {
                if (!turmaFiltroValue || turma.nome === turmaFiltroValue) {
                    const professorResponsavel = professores.find(prof => prof.id === turma.professor_responsavel_id);
                    const aide = professores.find(prof => prof.id === turma.aide_id);
                    resultados.push({
                        tipo: 'Turma',
                        nome: turma.nome,
                        detalhes: `Horário: ${turma.horario}, Professor: ${professorResponsavel.nome_completo}, Aide: ${aide ? aide.nome_completo : 'Nenhum'}`
                    });
                }
            });
        }

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

    // Inicialmente, o conteúdo principal fica oculto
    mainContent.classList.add('hidden');
});
