const setActiveTab = (selected, hideFlash = true) => {
    // display the right tab
    const tabs = document.getElementsByClassName('tab-pane');
    for (tab of tabs){
        if (selected === tab.id){
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    }

    // show which tab icon is active
    const buttons = document.querySelectorAll('.tabButtonContainer button');
    for (button of buttons){
        if (selected === button.getAttribute('data-tab')){
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    }

    // hide the flash message so it only shows on first render
    if (hideFlash) document.getElementById('flashView').style.display = 'none';
};

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
// gets tabToActivate based on the query and actives it
let tabToActivate;
if (!params.startingTab) tabToActivate = 'profile';
else tabToActivate = params.startingTab;
document.getElementById('profile').classList.add("active");
// configures buttons to work with setting active tab
const buttons = document.querySelectorAll('.tabButtonContainer button');
for (button of buttons){
    const data_tab = button.getAttribute('data-tab');
    button.onclick = () => setActiveTab(data_tab);
    if (data_tab === tabToActivate) setActiveTab(data_tab, false);
}

const checkIfNewUsername = (username) => {
    const changed = document.getElementById('changedUsername').value;
    if (username === changed){
        alert("You cannot change your username to your current username");
        return false;
    }
    return true;
};

const confirmAndCheckIfNewEmail = (email) => {
    const changed = document.getElementById('changedEmail').value;
    if (email === changed){
        alert("You cannot change your email to your current email");
        return false;
    }
    return confirm(`Are you sure you wish to change your email to ${changed}?`)
}

const confirmRemovePair = (pairName) => {
    if (confirm(`Are you sure you wish to unpair with ${pairName}`)) {
        const delete_pair_form = document.getElementById('deletePairForm');
        delete_pair_form.submit();
    }
}