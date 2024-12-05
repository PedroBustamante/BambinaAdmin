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

    // Função para gerar o calendário com turmas regulares e de substituição
    async function gerarCalendario(mes, ano, turmas, turmasSubstituicao, aulasExtrasPorTurma, substituicoes) {
        const diasDoMes = new Date(ano, mes + 1, 0).getDate();
        const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    
        let calendarioHtml = '<table style="border-collapse: collapse; width: 100%;">';
        const diasSemana = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
        // Adicionar linha de dias do mês
        calendarioHtml += '<tr><th></th>'; // Coluna vazia para a primeira coluna
        for (let dia = 1; dia <= diasDoMes; dia++) {
            calendarioHtml += `<th style="border: 1px solid black; padding: 5px; text-align: center;">${dia}</th>`;
        }
        calendarioHtml += '</tr>';
    
        // Adicionar linha dos dias da semana
        calendarioHtml += '<tr><th></th>'; // Coluna vazia para a primeira coluna
        for (let i = primeiroDiaSemana; i < primeiroDiaSemana + diasDoMes; i++) {
            calendarioHtml += `<th style="border: 1px solid black; padding: 5px; text-align: center;">${diasSemana[i % 7]}</th>`;
        }
        calendarioHtml += '</tr>';
    
        // Processar turmas regulares
        for (let turma of turmas) {
            const aulasExtrasTurma = aulasExtrasPorTurma[turma.id] || [];
    
            calendarioHtml += `<tr><td style="border: 1px solid black; padding: 5px; text-align: left;">${turma.nome} - ${turma.horario}</td>`;
            for (let dia = 1; dia <= diasDoMes; dia++) {
                const dataAtual = new Date(ano, mes, dia);
                const diaAula = dataAtual.toISOString().split('T')[0];
    
                const foiSubstituidoNoDia = substituicoes.some(sub => sub.id_turma === turma.id && sub.id_professor_substituido == professorId && sub.data_mudanca === diaAula);
                const estaSubstituindoNoDia = substituicoes.some(sub => sub.id_turma === turma.id && sub.id_professor_substituto == professorId && sub.data_mudanca === diaAula);
    
                let horasAula = turma.dias_semana.includes(dataAtual.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase()) ? turma.horas_por_dia : 0;
    
                let style = '';
    
                if (foiSubstituidoNoDia) {
                    style = 'background-color: red; color: white;';
                }
    
                if (estaSubstituindoNoDia) {
                    style = 'background-color: green; color: white;';
                }
    
                const aulasExtrasDia = aulasExtrasTurma.filter(aulaExtra => aulaExtra.dia_aula === diaAula);
                if (aulasExtrasDia.length > 0) {
                    aulasExtrasDia.forEach(aulaExtra => {
                        horasAula += aulaExtra.horas_extra;
                    });
                }
    
                calendarioHtml += `<td style="border: 1px solid black; padding: 5px; text-align: center; ${style}">${(horasAula > 0 ? horasAula : '')}</td>`;
            }
            calendarioHtml += '</tr>';
        }
        
        const uniqueArray = turmasSubstituicao.filter((value, index, self) => {
            return self.findIndex(v => v.id === value.id) === index;
          });
        // Processar turmas de substituição
        for (let turma of uniqueArray) {
            calendarioHtml += `<tr><td style="border: 1px solid black; padding: 5px; text-align: left;">${turma.nome} (Substituição)</td>`;
            for (let dia = 1; dia <= diasDoMes; dia++) {
                const dataAtual = new Date(ano, mes, dia);
                const diaAula = dataAtual.toISOString().split('T')[0];
    
                const estaSubstituindoNoDia = substituicoes.some(sub => sub.id_turma === turma.id && sub.id_professor_substituto == professorId && sub.data_mudanca === diaAula);
    
                let style = '';
    
                if (estaSubstituindoNoDia) {
                    style = 'background-color: green; color: white;';
                    calendarioHtml += `<td style="border: 1px solid black; padding: 5px; text-align: center; ${style}">${turma.horas_por_dia}</td>`;
                } else {
                    calendarioHtml += `<td style="border: 1px solid black; padding: 5px; text-align: center;"></td>`;
                }
            }
            calendarioHtml += '</tr>';
        }
    
        calendarioHtml += '</table>';
        return calendarioHtml;
    }
    

    async function calcularSalario(turmas, turmasSubstituicao, mes, ano, aulasExtrasPorTurma, substituicoes) {
        let salarioTotal = 0;
        let salarioDetalhado = '';

        const diasTrabalhados = new Set();

        for (let turma of turmas) {
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

        const uniqueArray = turmasSubstituicao.filter((value, index, self) => {
            return self.findIndex(v => v.id === value.id) === index;
        });

        // Processar turmas de substituição
        for (let turma of uniqueArray) {
            let salarioPorTurma = 0;
            const diasDoMes = new Date(ano, mes + 1, 0).getDate();
        
            for (let dia = 1; dia <= diasDoMes; dia++) {
                const dataAtual = new Date(ano, mes, dia);
                const diaAula = dataAtual.toISOString().split('T')[0];
        
                const estaSubstituindoNoDia = substituicoes.find(sub => sub.id_turma === turma.id && sub.id_professor_substituto == professorId && sub.data_mudanca === diaAula);
        
                if (!estaSubstituindoNoDia) {
                    continue;  // O professor só é pago nos dias de substituição
                }
        
                // Inicialmente, assumimos o valor padrão de salário para substituições
                let salarioHora = 40;
        
                // Aplicando a lógica adicional para calcular o salário final
                if (estaSubstituindoNoDia) {
                    if (estaSubstituindoNoDia.is_aide) {
                        salarioHora = 40;
                    } else if (turma.nome === "ENGLISH") {
                        salarioHora = 60;
                    } else if (turma.aide_id === null || turma.aide_id === estaSubstituindoNoDia.id_professor_substituto) {
                        salarioHora = 75;
                    } else {
                        salarioHora = 60;
                    }
                }
        
                diasTrabalhados.add(dia);
                salarioPorTurma += turma.horas_por_dia * salarioHora;
                salarioTotal += turma.horas_por_dia * salarioHora;
            }
        
            salarioDetalhado += `Turma ${turma.nome} (Substituição): R$ ${salarioPorTurma}<br>`;
        }
        

        const transporte = diasTrabalhados.size * 20;
        salarioTotal += transporte;
        salarioDetalhado += `Transporte: ${diasTrabalhados.size} dias: R$ ${transporte}<br>`;

        return { salarioTotal, salarioDetalhado };
    }

    async function obterTurmasPorIds(idsTurmas) {
        const turmas = [];
    
        for (let idTurma of idsTurmas) {
            const responseTurma = await fetch(`https://bambina-admin-back.vercel.app/turmas/${idTurma}`);
            const turma = await responseTurma.json();
            turmas.push(turma);
        }
    
        return turmas;
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
        // Filtra os Ids das turmas onde o professor está substituindo e que ainda não estão em sua lista de turmas originais
        const idsTurmasSubstituicao = substituicoes
            .filter(sub => !turmas.some(turma => turma.id === sub.id_turma))
            .map(sub => sub.id_turma);

        // Obtém as informações completas das turmas onde o professor está substituindo
        const turmasSubstituicao = await obterTurmasPorIds(idsTurmasSubstituicao);

        const aulasExtrasPorTurma = await obterTodasAulasExtras([...turmas, ...turmasSubstituicao]);

        const dataAtual = new Date();
        const mesAtual = dataAtual.getMonth();
        const anoAtual = dataAtual.getFullYear();

        // Função para filtrar as turmas de substituição com base nas substituições que ocorreram no mês
        const filtrarSubstituicoesPorMes = (substituicoes, mes, ano) => {
            return turmasSubstituicao.filter(turma => 
                substituicoes.some(sub => 
                    sub.id_turma === turma.id && 
                    new Date(sub.data_mudanca).getMonth() === mes && 
                    new Date(sub.data_mudanca).getFullYear() === ano
                )
            );
        };

        // Filtrar turmas de substituição para o mês atual
        const turmasSubstituicaoMesAtual = filtrarSubstituicoesPorMes(substituicoes, mesAtual, anoAtual);

        // Gera calendário para o mês atual com turmas regulares e turmas de substituição filtradas
        calendarioMesAtual.innerHTML = await gerarCalendario(mesAtual, anoAtual, turmas, turmasSubstituicaoMesAtual, aulasExtrasPorTurma, substituicoes);

        // Filtrar turmas de substituição para o mês anterior
        const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
        const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
        const turmasSubstituicaoMesAnterior = filtrarSubstituicoesPorMes(substituicoes, mesAnterior, anoAnterior);

        // Gera calendário para o mês anterior
        calendarioMesAnterior.innerHTML = await gerarCalendario(mesAnterior, anoAnterior, turmas, turmasSubstituicaoMesAnterior, aulasExtrasPorTurma, substituicoes);

        // Calcular salário para o mês atual e o mês anterior
        const { salarioTotal: salarioAtual, salarioDetalhado: detalhesSalarioAtual } = await calcularSalario(turmas, turmasSubstituicaoMesAtual, mesAtual, anoAtual, aulasExtrasPorTurma, substituicoes);
        const { salarioTotal: salarioAnterior, salarioDetalhado: detalhesSalarioAnterior } = await calcularSalario(turmas, turmasSubstituicaoMesAnterior, mesAnterior, anoAnterior, aulasExtrasPorTurma, substituicoes);

        salarioMesAtual.innerHTML = `<h3>Salário Mês Atual</h3><p>${detalhesSalarioAtual}</p><p><strong>Total: R$ ${salarioAtual}</strong></p>`;
        salarioMesAnterior.innerHTML = `<h3>Salário Mês Anterior</h3><p>${detalhesSalarioAnterior}</p><p><strong>Total: R$ ${salarioAnterior}</strong></p>`;
    })
    .catch(error => {
        console.error('Erro ao carregar as turmas do professor:', error);
    });
});
