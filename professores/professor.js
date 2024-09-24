document.addEventListener('DOMContentLoaded', function () {
    const detalhesProfessor = document.getElementById('informacoes-professor');
    const calendarioMesAtual = document.getElementById('calendario-mes-atual');
    const calendarioMesAnterior = document.getElementById('calendario-mes-anterior');
    const turmasSolo = document.getElementById('turmas-solo');
    const turmasComAide = document.getElementById('turmas-com-aide');
    const turmasComoAide = document.getElementById('turmas-como-aide');
    const salarioMesAtual = document.getElementById('salario-mes-atual');
    const salarioMesAnterior = document.getElementById('salario-mes-anterior');
    
    const urlParams = new URLSearchParams(window.location.search);
    const professorId = urlParams.get('id');

    const professorUrl = `https://bambina-admin-back.vercel.app/professores/professor/${professorId}`;
    const turmasUrl = `https://bambina-admin-back.vercel.app/turmas/professor/${professorId}`;
    const aulasExtraUrl = `https://bambina-admin-back.vercel.app/aulasExtra`;

    let senior = false;

    // Função para obter aulas extras de várias turmas
    async function obterTodasAulasExtras(turmas) {
        const aulasExtrasPorTurma = {};

        // Realiza uma chamada para cada turma
        for (let turma of turmas) {
            const response = await fetch(`${aulasExtraUrl}?id_turma=${turma.id}`);
            const data = await response.json();
            aulasExtrasPorTurma[turma.id] = data;  // Armazena as aulas extras por turma
        }

        return aulasExtrasPorTurma;
    }

    async function gerarCalendario(mes, ano, turmas, aulasExtrasPorTurma) {
        const diasDoMes = new Date(ano, mes + 1, 0).getDate(); // Número de dias do mês
        const primeiroDiaSemana = new Date(ano, mes, 1).getDay(); // Primeiro dia da semana (0=Domingo, 6=Sábado)
    
        let calendarioHtml = '<table style="border-collapse: collapse; width: 100%;">';
    
        // Cabeçalho do calendário: Primeira letra dos dias da semana
        const diasSemana = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        calendarioHtml += '<tr><th></th>'; // Primeira célula vazia para alinhar o nome da turma
        for (let i = primeiroDiaSemana; i < primeiroDiaSemana + diasDoMes; i++) {
            calendarioHtml += `<th style="border: 1px solid black; padding: 5px; text-align: center;">${diasSemana[i % 7]}</th>`;
        }
    
        calendarioHtml += '</tr>';
    
        // Usando for...of para lidar com operações assíncronas
        for (let turma of turmas) {
            const aulasExtrasTurma = aulasExtrasPorTurma[turma.id] || []; // Usa as aulas extras armazenadas
    
            calendarioHtml += `<tr><td style="border: 1px solid black; padding: 5px; text-align: left;">${turma.nome} - ${turma.horario}</td>`; // Nome da turma e horário
            for (let dia = 1; dia <= diasDoMes; dia++) {
                const dataAtual = new Date(ano, mes, dia);
                const diaSemana = dataAtual.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
                const diaAula = dataAtual.toISOString().split('T')[0]; // Formata a data como 'YYYY-MM-DD'
    
                let horasAula = turma.dias_semana.includes(diaSemana) ? turma.horas_por_dia : 0;
    
                // Verifica se há aulas extras para a data atual
                const aulasExtrasDia = aulasExtrasTurma.filter(aulaExtra => aulaExtra.dia_aula === diaAula);
    
                if (aulasExtrasDia.length > 0) {
                    aulasExtrasDia.forEach(aulaExtra => {
                        horasAula += aulaExtra.horas_extra; // Soma as horas extras às horas regulares
                    });
                }
    
                // Preenche com as horas de aula (se houver) ou vazio
                calendarioHtml += `<td style="border: 1px solid black; padding: 5px; text-align: center;">${horasAula > 0 ? horasAula : ''}</td>`;
            }
            calendarioHtml += '</tr>';
        }
    
        calendarioHtml += '</table>';
        return calendarioHtml;
    }
    

    async function calcularSalario(turmas, mes, ano, aulasExtrasPorTurma) {
        let salarioTotal = 0;
        let salarioDetalhado = '';

        const diasTrabalhados = new Set(); // Para calcular transporte, dia único em que ele esteve na escola

        for (let turma of turmas) {
            const horasPorDia = turma.horas_por_dia;
            const diasSemana = turma.dias_semana;
            let salarioPorTurma = 0;

            // Define o salário por hora baseado no tipo da turma e se o professor é sênior
            let salarioHora;
            if (turma.nome === "ENGLISH") {
                salarioHora = senior ? 75 : 60; // Salário específico para turmas de inglês
            } else if (turma.aide_id === null) {
                salarioHora = senior ? 100 : 75; // Sem aide
            } else if (turma.professor_responsavel_id === parseInt(professorId)) {
                salarioHora = senior ? 75 : 60; // Com aide, dependendo se é sênior
            } else {
                salarioHora = 40; // Como aide, salário fixo
            }

            // Verificar cada dia do mês
            const diasDoMes = new Date(ano, mes + 1, 0).getDate();
            const aulasExtrasTurma = aulasExtrasPorTurma[turma.id] || []; // Usa as aulas extras armazenadas

            for (let dia = 1; dia <= diasDoMes; dia++) {
                const dataAtual = new Date(ano, mes, dia);
                const diaSemana = dataAtual.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
                const diaAula = dataAtual.toISOString().split('T')[0];

                let horasAula = diasSemana.includes(diaSemana) ? horasPorDia : 0;

                // Filtrar aulas extras localmente pela data
                const aulasExtrasDia = aulasExtrasTurma.filter(aulaExtra => aulaExtra.dia_aula === diaAula);

                if (aulasExtrasDia.length > 0) {
                    aulasExtrasDia.forEach(aulaExtra => {
                        horasAula += aulaExtra.horas_extra;
                    });
                }

                if (horasAula > 0) {
                    diasTrabalhados.add(dia); // Marca o dia trabalhado para cálculo de transporte
                    salarioPorTurma += horasAula * salarioHora;
                    salarioTotal += horasAula * salarioHora;
                }
            }
            salarioDetalhado += `Turma ${turma.nome}: R$ ${salarioPorTurma}<br>`;
        }

        // Cálculo de transporte
        const transporte = diasTrabalhados.size * 20;
        salarioTotal += transporte;
        salarioDetalhado += `Transporte: ${diasTrabalhados.size} dias: R$ ${transporte}<br>`;

        return { salarioTotal, salarioDetalhado };
    }

    // Função para carregar as informações do professor
    fetch(professorUrl)
        .then(response => response.json())
        .then(data => {
            const { nome_completo, data_nascimento, data_entrada, telefone, chaves, is_senior } = data;
            senior = is_senior;
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
    .then(async turmas => {
        const solo = turmas.filter(turma => turma.aide_id === null);
        const comAide = turmas.filter(turma => turma.aide_id !== null && turma.professor_responsavel_id === parseInt(professorId));
        const comoAide = turmas.filter(turma => turma.aide_id === parseInt(professorId));

        // Carrega todas as aulas extras para as turmas
        const aulasExtrasPorTurma = await obterTodasAulasExtras([...solo, ...comAide, ...comoAide]);

        // Atualiza o calendário com as turmas
        const dataAtual = new Date();
        const mesAtual = dataAtual.getMonth();
        const anoAtual = dataAtual.getFullYear();
        
        // Gera calendários com turmas separadas
        calendarioMesAtual.innerHTML = await gerarCalendario(mesAtual, anoAtual, [...solo, ...comAide, ...comoAide], aulasExtrasPorTurma);
        
        const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
        const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
        calendarioMesAnterior.innerHTML = await gerarCalendario(mesAnterior, anoAnterior, [...solo, ...comAide, ...comoAide], aulasExtrasPorTurma);

        // Calcular salário para o mês atual e o mês anterior
        const { salarioTotal: salarioAtual, salarioDetalhado: detalhesSalarioAtual } = await calcularSalario([...solo, ...comAide, ...comoAide], mesAtual, anoAtual, aulasExtrasPorTurma);
        const { salarioTotal: salarioAnterior, salarioDetalhado: detalhesSalarioAnterior } = await calcularSalario([...solo, ...comAide, ...comoAide], mesAnterior, anoAnterior, aulasExtrasPorTurma);
        
        salarioMesAtual.innerHTML = `<h3>Salário Mês Atual</h3><p>${detalhesSalarioAtual}</p><p><strong>Total: R$ ${salarioAtual}</strong></p>`;
        salarioMesAnterior.innerHTML = `<h3>Salário Mês Anterior</h3><p>${detalhesSalarioAnterior}</p><p><strong>Total: R$ ${salarioAnterior}</strong></p>`;
    })
    .catch(error => {
        console.error('Erro ao carregar as turmas do professor:', error);
    });
});
