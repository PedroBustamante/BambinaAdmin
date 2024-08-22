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

        console.log('Novo Professor Adicionado:', novoProfessor);

        alert('Professor adicionado com sucesso!');
    });
});
