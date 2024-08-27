document.addEventListener('DOMContentLoaded', function() {
    const professorResponsavelSelect = document.getElementById('professor_responsavel');
    const aideSelect = document.getElementById('aide');
    const professoresUrl = `https://bambina-admin-back.vercel.app/professores`;

    // Carregar a lista de professores
    fetch(professoresUrl)
        .then(response => response.json())
        .then(data => {
            data.forEach(professor => {
                const option = document.createElement('option');
                option.value = professor.id;
                option.textContent = professor.nome_completo;
                professorResponsavelSelect.appendChild(option);
                
                const optionClone = option.cloneNode(true);
                aideSelect.appendChild(optionClone);
            });
        });

    document.getElementById('form-adicionar-turma').addEventListener('submit', function(event) {
        event.preventDefault();

        const novaTurma = {
            nome: document.getElementById('nome').value,
            horario: document.getElementById('horario').value,
            professor_responsavel_id: parseInt(document.getElementById('professor_responsavel').value),
            aide_id: document.getElementById('aide').value ? parseInt(document.getElementById('aide').value) : null
        };
        

        fetch('https://bambina-admin-back.vercel.app/turmas/adicionar-turma', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaTurma)
        })
        .then(response => {
            console.log({response});
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error || 'Erro ao adicionar turma');
                });
            }
            return response.json();
        })
        .then(_ => {
            alert('Turma adicionada com sucesso!');
        })
        .catch(error => {
            console.log({error});
            alert('Erro ao adicionar turma. Tente novamente mais tarde.');
        });
    });
});
