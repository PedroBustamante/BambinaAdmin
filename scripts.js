document.addEventListener('DOMContentLoaded', function() {
    const alunoFiltro = document.getElementById('aluno-filtro');
    const professorFiltro = document.getElementById('professor-filtro');
    const turmaFiltro = document.getElementById('turma-filtro');
    const resultadosLista = document.getElementById('resultados-lista');
    const loadingSpinner = document.getElementById('loading-spinner'); // Seleciona o spinner

    const menuAlunos = document.getElementById('menu-alunos');
    const menuProfessores = document.getElementById('menu-professores');
    const menuTurmas = document.getElementById('menu-turmas');

    const filtroAlunos = document.getElementById('filtro-alunos');
    const filtroProfessores = document.getElementById('filtro-professores');
    const filtroTurmas = document.getElementById('filtro-turmas');

    const mainContent = document.querySelector('main');
    const btnAdd = document.getElementById('btn-add'); // Seleciona o botão de adicionar

    // Variáveis para armazenar os dados
    let alunos = [];
    let professores = [];
    let turmas = [];

    // URLs dos endpoints
    const alunosUrl = `https://bambina-admin-back.vercel.app/alunos`;
    const professoresUrl = `https://bambina-admin-back.vercel.app/professores`;
    const turmasUrl = `https://bambina-admin-back.vercel.app/turmas`;

    // Função para mostrar o spinner
    function mostrarSpinner() {
        loadingSpinner.classList.remove('hidden');
    }

    // Função para esconder o spinner
    function esconderSpinner() {
        loadingSpinner.classList.add('hidden');
    }

    // Funções para carregar os dados das APIs
    async function carregarAlunos() {
        try {
            const response = await fetch(alunosUrl);
            const data = await response.json();
            alunos = data;
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
        }
    }

    async function carregarProfessores() {
        try {
            const response = await fetch(professoresUrl);
            const data = await response.json();
            professores = data;
        } catch (error) {
            console.error('Erro ao carregar professores:', error);
        }
    }

    async function carregarTurmas() {
        try {
            const response = await fetch(turmasUrl);
            const data = await response.json();
            turmas = data;
        } catch (error) {
            console.error('Erro ao carregar turmas:', error);
        }
    }

    // Função para recarregar os dados sempre que a página for mostrada
    function recarregarDados() {
        mostrarSpinner(); // Mostrar o spinner antes de carregar os dados
        Promise.all([carregarAlunos(), carregarProfessores(), carregarTurmas()])
            .then(() => {
                esconderSpinner(); // Esconder o spinner após carregar os dados
                filtrarResultados(); // Atualizar os resultados com os dados recarregados
            })
            .catch(error => {
                esconderSpinner(); // Esconder o spinner em caso de erro
                console.error('Erro ao recarregar os dados:', error);
            });
    }

    // Chamar recarregarDados quando a página for mostrada novamente
    window.addEventListener('pageshow', function(event) {      
        recarregarDados();
    });

    // Alternar filtros ao clicar no menu
    menuAlunos.addEventListener('click', function() {
        mostrarConteudo(); // Exibir o conteúdo
        selecionarFiltro('alunos');
        btnAdd.textContent = 'Adicionar Aluno';
        btnAdd.classList.remove('hidden');
        btnAdd.onclick = function() {
            window.location.href = 'adicionarAluno.html';
        };
    });

    menuProfessores.addEventListener('click', function() {
        mostrarConteudo(); // Exibir o conteúdo
        selecionarFiltro('professores');
        btnAdd.textContent = 'Adicionar Professor';
        btnAdd.classList.remove('hidden');
        btnAdd.onclick = function() {
            window.location.href = 'adicionarProfessor.html';
        };
    });

    menuTurmas.addEventListener('click', function() {
        mostrarConteudo(); // Exibir o conteúdo
        selecionarFiltro('turmas');
        btnAdd.textContent = 'Adicionar Turma';
        btnAdd.classList.remove('hidden');
        btnAdd.onclick = function() {
            window.location.href = 'adicionarTurma.html';
        };
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
            alunos.forEach(aluno => {
                const alunoNome = aluno.nome.toLowerCase();
                const alunoTurmas = aluno.ids_turmas.map(id => turmas.find(turma => turma.id === id).nome);

                if (alunoNome.includes(alunoFiltroValue) || alunoFiltroValue === '') {
                    resultados.push({
                        id: aluno.id,
                        tipo: 'Aluno',
                        nome: aluno.nome,
                        detalhes: `Turmas: ${alunoTurmas.join(', ')}`
                    });
                }
            });
        } else if (filtroProfessores.style.display === 'block') {
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
            turmas.forEach(turma => {
                if (!turmaFiltroValue || turma.nome === turmaFiltroValue) {
                    const professorResponsavel = professores.find(prof => prof.id === turma.professor_responsavel_id);
                    const aide = professores.find(prof => prof.id === turma.aide_id);
                    resultados.push({
                        id: turma.id,
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
            ${r.tipo === 'Aluno' ? `<button onclick="location.href='aluno.html?id=${r.id}'">Ver Detalhes</button>` : ''}
            ${r.tipo === 'Turma' ? `<button onclick="location.href='turma.html?id=${r.id}'">Ver Detalhes</button>` : ''}
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
