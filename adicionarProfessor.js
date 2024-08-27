document.addEventListener('DOMContentLoaded', function() {
    const options = document.querySelectorAll('.select-multiple .option');

    options.forEach(option => {
        option.addEventListener('click', function() {
            option.classList.toggle('selected');
        });
    });

    document.getElementById('form-adicionar-professor').addEventListener('submit', function(event) {
        event.preventDefault();

        const chavesSelecionadas = Array.from(document.querySelectorAll('.select-multiple .option.selected'))
            .map(option => option.getAttribute('data-value'));

        const novoProfessor = {
            nome_completo: document.getElementById('nome_completo').value,
            data_nascimento: document.getElementById('data_nascimento').value,
            data_entrada: document.getElementById('data_entrada').value,
            telefone: document.getElementById('telefone').value,
            chaves: chavesSelecionadas
        };

        fetch('https://bambina-admin-back.vercel.app/professores/adicionar-professor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoProfessor)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error || 'Erro ao adicionar professor');
                });
            }
            return response.json();
        })
        .then(_ => {
            alert('Professor adicionado com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao adicionar professor:', error);
            alert('Erro ao adicionar professor. Tente novamente mais tarde.');
        });
    });
});
