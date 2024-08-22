document.addEventListener('DOMContentLoaded', function() {
    const professorResponsavelSelect = document.getElementById('professor_responsavel');
    const aideSelect = document.getElementById('aide');

    // Carregar a lista de professores
    fetch('professores.json')
        .then(response => response.json())
        .then(data => {
            const professores = data.professores;
            professores.forEach(professor => {
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

        console.log('Nova Turma Adicionada:', novaTurma);

        // Aqui, você pode enviar os dados para um servidor ou salvá-los localmente
        alert('Turma adicionada com sucesso!');
    });
});
