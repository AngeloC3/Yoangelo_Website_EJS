const addDeleteFunctionalityToButtons = (listType, deleteRoutePrefix) => {
    // Add event listener for delete button clicks
    const deleteButtons = document.querySelectorAll('.delete-list-item');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const confirmDelete = confirm(`Are you sure you want to delete this ${listType}?`);
            if (!confirmDelete) return;
            const id = this.getAttribute('data-id');
            // Send DELETE request to server
            fetch(`${deleteRoutePrefix}/delete/${id}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                throw new Error('Network response was not ok');
                }
                // Remove deleted todo from the screen
                const listItem = this.closest('.list-group-item');
                const remaining_num = listItem.parentNode.children.length - 1;
                if (remaining_num < 1){
                    location.reload();
                }
                listItem.remove();
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });
};