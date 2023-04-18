const getDateString = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    }).format(new Date(date)).replace("at", "-");
}

const setDateElems = () => {
    const dateElems = document.querySelectorAll('.date-elem');
    dateElems.forEach(elem => {
        const date = elem.getAttribute('data-date');
        elem.textContent = getDateString(date);
    });
}