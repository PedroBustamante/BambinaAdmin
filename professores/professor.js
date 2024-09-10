document.addEventListener('DOMContentLoaded', function () {
    const detalhesProfessor = document.getElementById('informacoes-professor');
    const calendarioMesAtual = document.getElementById('calendario-mes-atual');
    const calendarioMesAnterior = document.getElementById('calendario-mes-anterior');
    const turmasSolo = document.getElementById('turmas-solo');
    const turmasComAide = document.getElementById('turmas-com-aide');
    const turmasComoAide = document.getElementById('turmas-como-aide');
    
    const urlParams = new URLSearchParams(window.location.search);
    const professorId = urlParams.get('id');

    const professorUrl = `https://bambina-admin-back.vercel.app/professores/professor/${professorId}`;
    const turmasUrl = `https://bambina-admin-back.vercel.app/turmas/professor/${professorId}`;
    
    function gerarCalendario(mes, ano) {
        const diasDoMes = new Date(ano, mes + 1, 0).getDate(); // Obtém o número de dias do mês
        const primeiroDiaSemana = new Date(ano, mes, 1).getDay(); // Primeiro dia da semana (0=Domingo, 6=Sábado)
        
        let calendarioHtml = '<table style="border-collapse: collapse; width: 100%;">';
    
        // Cabeçalho do calendário: Primeira letra dos dias da semana
        const diasSemana = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        calendarioHtml += '<tr>';
    
        // Adiciona as iniciais dos dias da semana a partir do primeiro dia do mês
        for (let i = primeiroDiaSemana; i < primeiroDiaSemana + diasDoMes; i++) {
            calendarioHtml += `<th style="border: 1px solid black; padding: 5px; text-align: center;">${diasSemana[i % 7]}</th>`;
        }
    
        calendarioHtml += '</tr><tr>';
    
        // Preenche os dias do mês
        for (let dia = 1; dia <= diasDoMes; dia++) {
            calendarioHtml += `<td style="border: 1px solid black; padding: 5px; text-align: center;">${dia}</td>`;
        }
    
        calendarioHtml += '</tr></table>';
        return calendarioHtml;
    }    
    
    // Função para carregar as informações do professor
    fetch(professorUrl)
        .then(response => response.json())
        .then(data => {
            const { nome_completo, data_nascimento, data_entrada, telefone, chaves } = data;
            detalhesProfessor.innerHTML = `
                <h2>${nome_completo}</h2>
                <p><strong>Data de Nascimento:</strong> ${data_nascimento}</p>
                <p><strong>Data de Entrada:</strong> ${data_entrada}</p>
                <p><strong>Telefone:</strong> ${telefone}</p>
                <p><strong>Chaves:</strong> ${chaves.join(', ')}</p>
            `;
        })
        .catch(error => {
            console.error('Erro ao carregar as informações do professor:', error);
            detalhesProfessor.innerHTML = '<p>Erro ao carregar os dados do professor.</p>';
        });

    // Função para carregar as turmas do professor
    fetch(turmasUrl)
        .then(response => response.json())
        .then(turmas => {
            const solo = turmas.filter(turma => turma.aide_id === null);
            const comAide = turmas.filter(turma => turma.aide_id !== null && turma.professor_responsavel_id === parseInt(professorId));
            const comoAide = turmas.filter(turma => turma.aide_id === parseInt(professorId));
            
            // Exibir turmas solo
            if(solo.length){
                turmasSolo.innerHTML = '<h3>Turmas Solo</h3>';
                solo.forEach(turma => {
                    turmasSolo.innerHTML += `<p>${turma.nome} - ${turma.horario}</p>`;
                });
            }

            // Exibir turmas com aide
            if(comAide.length){
                turmasComAide.innerHTML = '<h3>Turmas com Aide</h3>';
                comAide.forEach(turma => {
                    turmasComAide.innerHTML += `<p>${turma.nome} - ${turma.horario} (Aide: ${turma.aide_id})</p>`;
                });
            }

            // Exibir turmas como aide
            if(comoAide.length){
                turmasComoAide.innerHTML = '<h3>Turmas como Aide</h3>';
                comoAide.forEach(turma => {
                    turmasComoAide.innerHTML += `<p>${turma.nome} - ${turma.horario} </p>`;
                });
            }
        })
        .catch(error => {
            console.error('Erro ao carregar as turmas do professor:', error);
        });

    // Carregar o calendário do mês atual e do mês anterior
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth();
    const anoAtual = dataAtual.getFullYear();
    
    // Mês atual
    calendarioMesAtual.innerHTML = gerarCalendario(mesAtual, anoAtual);
    
    // Mês anterior
    const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
    const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
    calendarioMesAnterior.innerHTML = gerarCalendario(mesAnterior, anoAnterior);
});
