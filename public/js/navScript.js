const Notifcation = require("express-session")

// Get the current URL
const currentUrl = window.location.href;
  
// Find the link that matches the current URL
const links = document.querySelectorAll('.navbar-nav a');
for (let i = 0; i < links.length; i++) {
    if (links[i].href === currentUrl) {
        links[i].classList.add('active');
        if (links[i].closest('.dropdown-menu')) {
        const dropdownToggle = links[i].closest('.dropdown-menu').previousElementSibling;
        dropdownToggle.classList.add('active');
        }
    }   
}

// get notif number
const notifBadge = document.getElementById("notificationBadge");
notificationBadge.textContent = '5';