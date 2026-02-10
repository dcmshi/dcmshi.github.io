// ========================================
// UNDERTALE-INSPIRED PERSONAL WEBSITE - SCRIPT
// ========================================

// Smooth scroll navigation with offset for better positioning
document.addEventListener('DOMContentLoaded', function() {

    // Smooth scroll for all navigation links (menu items and back links)
    const allNavLinks = document.querySelectorAll('.menu-item, .back-link');

    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Optional: Add sound effect on menu hover (disabled by default)
    // Uncomment if you want to add audio feedback
    /*
    menuLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            // You can add a click sound here if desired
            // const audio = new Audio('path-to-sound.wav');
            // audio.play();
        });
    });
    */

    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Press 'S' or Enter on title screen to scroll to About
        if ((e.key === 's' || e.key === 'S' || e.key === 'Enter') && window.scrollY < 100) {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });

    // Optional: Console message for developers who inspect the site
    console.log('%c* You found the console.', 'color: #ff0000; font-family: monospace; font-size: 14px;');
    console.log('%c* Determination.', 'color: #ffff00; font-family: monospace; font-size: 12px;');
    console.log('%cMade with intention. No frameworks harmed.', 'color: #00ffff; font-family: monospace; font-size: 10px;');
});

// Optional: Add "typed text" effect for the title screen (currently disabled)
// Uncomment if you want a typing animation effect
/*
function typeText(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// Usage example:
// const titleElement = document.querySelector('.pixel-title');
// typeText(titleElement, '[Your Name]', 100);
*/
