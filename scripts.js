document.addEventListener('DOMContentLoaded', function() {
    // Seleciona os botões de despesas e leads
    const btnDespesas = document.getElementById('btn-despesas');
    const btnLeads = document.getElementById('btn-leads');
    
    // Redireciona para a página de despesas
    btnDespesas.addEventListener('click', function() {
        window.location.href = 'despesas/despesa.html';
    });
    
    // Redireciona para a página de leads
    btnLeads.addEventListener('click', function() {
        window.location.href = 'leads/lead.html';
    });
    
    const alunoFiltro = document.getElementById('aluno-filtro');
    const filtroExperimental = document.getElementById('filtro-experimental'); // Seleciona o checkbox de experimental
    const filtroExAlunos = document.getElementById('filtro-ex-alunos'); // Seleciona o checkbox de ex-alunos
    const professorFiltro = document.getElementById('professor-filtro');
    const turmaFiltro = document.getElementById('turma-filtro');
    const resultadosLista = document.getElementById('resultados-lista');
    const loadingSpinner = document.getElementById('loading-spinner'); // Seleciona o spinner
    const alunoTurmaFiltro = document.getElementById('aluno-turma-filtro');

    const menuAlunos = document.getElementById('menu-alunos');
    const menuProfessores = document.getElementById('menu-professores');
    const menuTurmas = document.getElementById('menu-turmas');

    const filtroAlunos = document.getElementById('filtro-alunos');
    const filtroProfessores = document.getElementById('filtro-professores');
    const filtroTurmas = document.getElementById('filtro-turmas');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const paginationInfo = document.getElementById('pagination-info');
    const paginationControls = document.getElementById('pagination-controls');

    const mainContent = document.querySelector('main');
    const btnAdd = document.getElementById('btn-add'); // Seleciona o botão de adicionar

    // Variáveis para armazenar os dados
    let alunos = [];
    let professores = [];
    let turmas = [];
    let currentPage = 1;
    let totalResults = 0;
    const limit = 10; // Número de alunos por página
    let debounceTimeout;

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

    // Função de debounce
    function debounce(func, delay) {
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    function atualizarTotalResultados() {
        const totalResultadosSpan = document.getElementById('total-resultados');
        if (filtroAlunos.style.display !== 'none') {
            totalResultadosSpan.textContent = `(${totalResults} resultados)`;
        } else {
            totalResultadosSpan.textContent = ''; // Limpa se não estamos mostrando alunos
        }
    }

    // Função para carregar alunos com base no filtro de experimentais, ex-alunos, paginação e filtro
    async function carregarAlunos(page = 1) {
        mostrarSpinner();
        const offset = (page - 1) * limit;
        const filter = alunoFiltro.value.trim().toLowerCase();
        const turmaSelecionada = alunoTurmaFiltro.value; // Captura o valor selecionado no filtro de turma
    
        let url = `${alunosUrl}?limit=${limit}&offset=${offset}`;
    
        if (filter) {
            url += `&filtro=${filter}`;
        }
    
        if (turmaSelecionada) {
            url += `&nome_da_turma=${encodeURIComponent(turmaSelecionada)}`; // Adiciona o filtro de turma à URL
        }
    
        if (filtroExperimental.checked) {
            url += `&experimental=true`;
        }
    
        if (filtroExAlunos.checked) {
            url += `&data_saida=true`;
        }
    
        try {
            const response = await fetch(url);
            const data = await response.json();
            alunos = data.data; // Supondo que a resposta tem uma chave "data"
            totalResults = data.total; // Supondo que a resposta tem uma chave "total"
            atualizarPaginacao(); // Atualiza a paginação conforme os resultados
            filtrarResultados();  // Atualiza os resultados filtrados
            atualizarTotalResultados();
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
        } finally {
            esconderSpinner();
        }
    }    

    // Função para atualizar a exibição da paginação
    function atualizarPaginacao() {
        paginationInfo.textContent = `Página ${currentPage} de ${Math.ceil(totalResults / limit)}`;
        btnPrev.classList.toggle('hidden', currentPage === 1);
        btnNext.classList.toggle('hidden', currentPage >= Math.ceil(totalResults / limit));
        paginationControls.classList.remove('hidden');
    }

    // Eventos de paginação
    btnPrev.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            carregarAlunos(currentPage);
        }
    });

    btnNext.addEventListener('click', function() {
        if (currentPage < Math.ceil(totalResults / limit)) {
            currentPage++;
            carregarAlunos(currentPage);
        }
    });

    // Atualizar a chamada do filtro de alunos para usar o debounce
    alunoFiltro.addEventListener('input', debounce(function() {
        currentPage = 1;
        carregarAlunos(currentPage);
    }, 300)); // 300ms de atraso

    // Recarregar alunos ao modificar o filtro experimental
    filtroExperimental.addEventListener('change', function() {
        currentPage = 1;
        carregarAlunos(currentPage);
    });

    // Recarregar alunos ao modificar o filtro de ex-alunos
    filtroExAlunos.addEventListener('change', function() {
        currentPage = 1;
        carregarAlunos(currentPage);
    });

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
        atualizarTotalResultados();
        btnAdd.onclick = function() {
            window.location.href = 'alunos/adicionarAluno.html';
        };
    });

    menuProfessores.addEventListener('click', function() {
        mostrarConteudo(); // Exibir o conteúdo
        selecionarFiltro('professores');
        btnAdd.textContent = 'Adicionar Professor';
        btnAdd.classList.remove('hidden');
        atualizarTotalResultados();
        btnAdd.onclick = function() {
            window.location.href = 'professores/adicionarProfessor.html';
        };
    });

    menuTurmas.addEventListener('click', function() {
        mostrarConteudo(); // Exibir o conteúdo
        selecionarFiltro('turmas');
        btnAdd.textContent = 'Adicionar Turma';
        btnAdd.classList.remove('hidden');
        atualizarTotalResultados();
        btnAdd.onclick = function() {
            window.location.href = 'adicionarTurma.html';
        };
    });

    // Função para selecionar e exibir o filtro correto
    function selecionarFiltro(filtro) {
        filtroAlunos.style.display = filtro === 'alunos' ? 'block' : 'none';
        paginationControls.style.display = filtro === 'alunos' ? 'block' : 'none';
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
                const alunoTurmas = aluno.ids_turmas.map(id => turmas.find(turma => turma.id === id).nome);
                resultados.push({
                    id: aluno.id,
                    tipo: 'Aluno',
                    nome: aluno.nome,
                    detalhes: `Turmas: ${alunoTurmas.join(', ')}`
                });
            });
        } else if (filtroProfessores.style.display === 'block') {
            professores.forEach(professor => {
                const professorNome = professor.nome_completo.toLowerCase();

                if (professorNome.includes(professorFiltroValue) || professorFiltroValue === '') {
                    resultados.push({
                        id: professor.id,
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
                ${r.tipo === 'Aluno' ? `<button onclick="location.href='alunos/aluno.html?id=${r.id}'">Ver Detalhes</button>` : ''}
                ${r.tipo === 'Turma' ? `<button onclick="location.href='turma.html?id=${r.id}'">Ver Detalhes</button>` : ''}
                ${r.tipo === 'Professor' ? `<button onclick="location.href='professores/professor.html?id=${r.id}'">Ver Detalhes</button>` : ''}
            </div>
        `).join('') : '<p>Nenhum resultado encontrado.</p>';
    }

    // Adicionar eventos de filtro
    alunoFiltro.addEventListener('input', filtrarResultados);
    professorFiltro.addEventListener('input', filtrarResultados);
    turmaFiltro.addEventListener('change', filtrarResultados);
    alunoTurmaFiltro.addEventListener('change', function() {
        currentPage = 1; // Reseta para a primeira página sempre que o filtro de turma mudar
        carregarAlunos(currentPage); // Chama a função de carregar alunos com a nova turma selecionada
    });

    // Adicionar evento ao checkbox de "alunos experimentais" e "ex-alunos"
    filtroExperimental.addEventListener('change', recarregarDados);
    filtroExAlunos.addEventListener('change', recarregarDados);

    // Inicialmente, o conteúdo principal fica oculto
    mainContent.classList.add('hidden');
});
