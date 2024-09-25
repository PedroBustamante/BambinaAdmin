document.addEventListener('DOMContentLoaded', function () {
    const detalhesProfessor = document.getElementById('informacoes-professor');
    const calendarioMesAtual = document.getElementById('calendario-mes-atual');
    const calendarioMesAnterior = document.getElementById('calendario-mes-anterior');
    const salarioMesAtual = document.getElementById('salario-mes-atual');
    const salarioMesAnterior = document.getElementById('salario-mes-anterior');
    
    const urlParams = new URLSearchParams(window.location.search);
    const professorId = urlParams.get('id');

    const professorUrl = `https://bambina-admin-back.vercel.app/professores/professor/${professorId}`;
    const turmasUrl = `https://bambina-admin-back.vercel.app/turmas/professor/${professorId}`;
    const aulasExtraUrl = `https://bambina-admin-back.vercel.app/aulasExtra`;
    const substituicoesUrl = `https://bambina-admin-back.vercel.app/substituicoes`;

    let senior = false;

    // Função para obter aulas extras de várias turmas
    async function obterTodasAulasExtras(turmas) {
        const aulasExtrasPorTurma = {};

        for (let turma of turmas) {
            const response = await fetch(`${aulasExtraUrl}?id_turma=${turma.id}`);
            const data = await response.json();
            aulasExtrasPorTurma[turma.id] = data;
        }

        return aulasExtrasPorTurma;
    }

    // Função para obter substituições
    async function obterSubstituicoes(professorId) {
        const response = await fetch(`${substituicoesUrl}?id_professor=${professorId}`);
        const data = await response.json();
        return data;
    }

    async function gerarCalendario(mes, ano, turmas, aulasExtrasPorTurma, substituicoes) {
        const diasDoMes = new Date(ano, mes + 1, 0).getDate();
        const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    
        let calendarioHtml = '<table style="border-collapse: collapse; width: 100%;">';
        const diasSemana = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        calendarioHtml += '<tr><th></th>';
    
        for (let i = primeiroDiaSemana; i < primeiroDiaSemana + diasDoMes; i++) {
            calendarioHtml += `<th style="border: 1px solid black; padding: 5px; text-align: center;">${diasSemana[i % 7]}</th>`;
        }
    
        calendarioHtml += '</tr>';
    
        for (let turma of turmas) {
            const aulasExtrasTurma = aulasExtrasPorTurma[turma.id] || [];
    
            calendarioHtml += `<tr><td style="border: 1px solid black; padding: 5px; text-align: left;">${turma.nome} - ${turma.horario}</td>`;
            for (let dia = 1; dia <= diasDoMes; dia++) {
                const dataAtual = new Date(ano, mes, dia);
                const diaAula = dataAtual.toISOString().split('T')[0];
    
                // Verificar se há substituições no dia específico
                const foiSubstituidoNoDia = substituicoes.some(sub => sub.id_turma === turma.id && sub.id_professor_substituido == professorId && sub.data_mudanca === diaAula);
                const estaSubstituindoNoDia = substituicoes.some(sub => sub.id_turma === turma.id && sub.id_professor_substituto == professorId && sub.data_mudanca === diaAula);

    
                let horasAula = turma.dias_semana.includes(dataAtual.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase()) ? turma.horas_por_dia : 0;
    
                let style = '';
    
                if (foiSubstituidoNoDia) {
                    // Quadrado vermelho para dias substituídos
                    style = 'background-color: red; color: white;';
                }
    
                if (estaSubstituindoNoDia) {
                    // Quadrado verde para dias em que o professor está substituindo
                    style = 'background-color: green; color: white;';
                }

                // Verificar aulas extras
                const aulasExtrasDia = aulasExtrasTurma.filter(aulaExtra => aulaExtra.dia_aula === diaAula);
                if (aulasExtrasDia.length > 0) {
                    aulasExtrasDia.forEach(aulaExtra => {
                        horasAula += aulaExtra.horas_extra;
                    });
                }
    
                // Se o professor estiver substituindo no dia, contabilizar horas
                if (estaSubstituindoNoDia) {
                    horasAula = horasAula > 0 ? horasAula : 0;
                }
    
                calendarioHtml += `<td style="border: 1px solid black; padding: 5px; text-align: center; ${style}">${(horasAula > 0 ? horasAula : '')}</td>`;
            }
            calendarioHtml += '</tr>';
        }
    
        calendarioHtml += '</table>';
        return calendarioHtml;
    }
    

    async function calcularSalario(turmas, mes, ano, aulasExtrasPorTurma, substituicoes) {
        let salarioTotal = 0;
        let salarioDetalhado = '';

        const diasTrabalhados = new Set();

        for (let turma of turmas) {
            console.log(`Turma:${turma.nome} Horas por dia: ${turma.horas_por_dia}`);
            const horasPorDia = turma.horas_por_dia;
            const diasSemana = turma.dias_semana;
            let salarioPorTurma = 0;

            let salarioHora;
            if (turma.nome === "ENGLISH") {
                salarioHora = senior ? 75 : 60;
            } else if (turma.aide_id === null) {
                salarioHora = senior ? 100 : 75;
            } else if (turma.professor_responsavel_id === parseInt(professorId)) {
                salarioHora = senior ? 75 : 60;
            } else {
                salarioHora = 40;
            }

            const diasDoMes = new Date(ano, mes + 1, 0).getDate();
            const aulasExtrasTurma = aulasExtrasPorTurma[turma.id] || [];

            for (let dia = 1; dia <= diasDoMes; dia++) {
                const dataAtual = new Date(ano, mes, dia);
                const diaAula = dataAtual.toISOString().split('T')[0];

                // Verificar se há substituições no dia específico
                const foiSubstituidoNoDia = substituicoes.some(sub => sub.id_turma === turma.id && sub.id_professor_substituido == professorId && sub.data_mudanca === diaAula);
                const estaSubstituindoNoDia = substituicoes.some(sub => sub.id_turma === turma.id && sub.id_professor_substituto == professorId && sub.data_mudanca === diaAula);

                if (foiSubstituidoNoDia) {
                    continue;  // Ignora o dia em que o professor foi substituído
                }

                let salarioFinal = salarioHora;

                if (estaSubstituindoNoDia) {
                    if(estaSubstituindoNoDia.is_aide){
                        salarioFinal = 40;
                    } else if (turma.nome === "ENGLISH") {
                        salarioFinal = 60;
                    } else if (turma.aide_id === null || turma.aide_id === estaSubstituindoNoDia.id_professor_substituto) {
                        salarioFinal = 75;
                    } else {
                        salarioFinal = 60;
                    }
                }

                let horasAula = diasSemana.includes(dataAtual.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase()) ? horasPorDia : 0;

                const aulasExtrasDia = aulasExtrasTurma.filter(aulaExtra => aulaExtra.dia_aula === diaAula);

                if (aulasExtrasDia.length > 0) {
                    aulasExtrasDia.forEach(aulaExtra => {
                        horasAula += aulaExtra.horas_extra;
                    });
                }

                if (horasAula > 0) {
                    diasTrabalhados.add(dia);  // Contabilizar dia de trabalho
                    salarioPorTurma += horasAula * salarioFinal;
                    salarioTotal += horasAula * salarioFinal;
                }
            }

            salarioDetalhado += `Turma ${turma.nome}: R$ ${salarioPorTurma}<br>`;
        }

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

    // Função para carregar as turmas do professor e substituições
    fetch(turmasUrl)
        .then(response => response.json())
        .then(async turmas => {
            const substituicoes = await obterSubstituicoes(professorId);

            const aulasExtrasPorTurma = await obterTodasAulasExtras(turmas);

            const dataAtual = new Date();
            const mesAtual = dataAtual.getMonth();
            const anoAtual = dataAtual.getFullYear();
            
            // Gera calendários com turmas separadas
            calendarioMesAtual.innerHTML = await gerarCalendario(mesAtual, anoAtual, turmas, aulasExtrasPorTurma, substituicoes);
            
            const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
            const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
            calendarioMesAnterior.innerHTML = await gerarCalendario(mesAnterior, anoAnterior, turmas, aulasExtrasPorTurma, substituicoes);

            // Calcular salário para o mês atual e o mês anterior
            const { salarioTotal: salarioAtual, salarioDetalhado: detalhesSalarioAtual } = await calcularSalario(turmas, mesAtual, anoAtual, aulasExtrasPorTurma, substituicoes);
            const { salarioTotal: salarioAnterior, salarioDetalhado: detalhesSalarioAnterior } = await calcularSalario(turmas, mesAnterior, anoAnterior, aulasExtrasPorTurma, substituicoes);
            
            salarioMesAtual.innerHTML = `<h3>Salário Mês Atual</h3><p>${detalhesSalarioAtual}</p><p><strong>Total: R$ ${salarioAtual}</strong></p>`;
            salarioMesAnterior.innerHTML = `<h3>Salário Mês Anterior</h3><p>${detalhesSalarioAnterior}</p><p><strong>Total: R$ ${salarioAnterior}</strong></p>`;
        })
        .catch(error => {
            console.error('Erro ao carregar as turmas do professor:', error);
        });
});
