document.addEventListener("DOMContentLoaded", function() {
    const elements = document.querySelectorAll('p.bd-links__title');

    elements.forEach(function(element) {
        element.style.display = 'none';
    });
});