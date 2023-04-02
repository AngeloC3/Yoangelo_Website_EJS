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

const toggleDisplay = (button) =>{
    // Find the parent list item of the clicked button
    const listItem = button.closest('li');

    // Find the ModifyButtons div within the list item
    const modifyButtons = listItem.querySelector('#ModifyButtons');

    // Toggle the display style between 'none' and 'flex'
    if (modifyButtons.style.display === 'none') {
    modifyButtons.style.display = 'flex';
    } else {
    modifyButtons.style.display = 'none';
    }
}