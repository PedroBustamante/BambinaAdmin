document.addEventListener('DOMContentLoaded', function() {
    const detalhesTurma = document.getElementById('detalhes-turma');
    const menuOverview = document.getElementById('menu-overview');
    const menuAlunos = document.getElementById('menu-alunos');

    const urlParams = new URLSearchParams(window.location.search);
    const turmaId = urlParams.get('id');

    let turmaEspecifica = null;
    let professor = null;
    let aide = null;
    let alunos = [];
    const turmaEspecificaUrl = `https://bambina-admin-back.vercel.app/turmas/${turmaId}`;
    const alunosTurmaUrl = `https://bambina-admin-back.vercel.app/alunos/turma/${turmaId}`;
    const professorUrlBase = `https://bambina-admin-back.vercel.app/professores/professor/`;

    // Função para carregar dados do professor
    function carregarProfessor(professorId) {
        if (!professorId) return null;
        return fetch(`${professorUrlBase}${professorId}`)
            .then(response => response.json())
            .then(data => data)
            .catch(error => {
                console.error(`Erro ao carregar professor com ID ${professorId}:`, error);
                return null;
            });
    }

    // Função para exibir os detalhes da turma
    function exibirOverview(turma) {
        const professorNome = professor ? professor.nome_completo : 'Sem professor';
        const aideNome = aide ? aide.nome_completo : 'Sem Aide';
        const totalAlunos = alunos.length;
        const alunosMatriculados = alunos.filter(aluno => !aluno.experimental).length;
        const alunosExperimentais = alunos.filter(aluno => aluno.experimental).length;

        detalhesTurma.innerHTML = `
            <div class="overview-content">
                <h2>${turma.nome}</h2>
                <p><strong>Horário:</strong> ${turma.horario}</p>
                <p><strong>Professor:</strong> ${professorNome}</p>
                <p><strong>Aide:</strong> ${aideNome}</p>
                <p><strong>Total de Alunos:</strong> ${totalAlunos}</p>
                <p><strong>Alunos Matriculados:</strong> ${alunosMatriculados}</p>
                <p><strong>Alunos em Período Experimental:</strong> ${alunosExperimentais}</p>
            </div>
        `;
    }

    // Função para exibir a lista de alunos da turma
    function exibirAlunos() {
        detalhesTurma.innerHTML = alunos.length > 0 ? alunos.map(aluno => `
            <div class="resultado-item">
                <h3>${aluno.nome}</h3>
                <p>Responsável: ${aluno.responsavel}</p>
                <button onclick="location.href='alunos/aluno.html?id=${aluno.id}'">Ver Detalhes</button>
            </div>
        `).join('') : '<p>Nenhum aluno encontrado para essa turma.</p>';
    }

    // Função para alternar entre overview e lista de alunos
    function selecionarAba(aba) {
        if (aba === 'overview') {
            exibirOverview(turmaEspecifica);
        } else if (aba === 'alunos') {
            exibirAlunos();
        }
    }

    // Carregar os dados da turma, professor, aide e os alunos
    Promise.all([
        fetch(turmaEspecificaUrl)
            .then(response => response.json())
            .then(async data => {
                turmaEspecifica = data;
                // Carregar professor e aide simultaneamente
                console.log(turmaEspecifica.professor_responsavel_id);
                professor = await carregarProfessor(turmaEspecifica.professor_responsavel_id);
                console.log({professor});
                aide = await carregarProfessor(turmaEspecifica.aide_id);
            }),
        fetch(alunosTurmaUrl)
            .then(response => response.json())
            .then(data => alunos = data)
    ]).then(() => {
        selecionarAba('overview'); // Exibe o overview por padrão
    }).catch(error => {
        console.error('Erro ao carregar os dados:', error);
        detalhesTurma.innerHTML = '<p>Erro ao carregar os dados da turma.</p>';
    });

    menuOverview.addEventListener('click', () => selecionarAba('overview'));
    menuAlunos.addEventListener('click', () => selecionarAba('alunos'));
});
