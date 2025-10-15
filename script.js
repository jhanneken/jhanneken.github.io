let section = document.querySelectorAll("section");
let menu = document.querySelectorAll(".nav-elements a");

window.onscroll = () => {
    section.forEach((i) => {
        let top = window.scrollY;
        let offset = i.offsetTop - 150;
        let height = i.offsetHeight;
        let id = i.getAttribute("id");

        if (top >= offset && top < offset + height) {
            menu.forEach((link) => {
                link.classList.remove("active");
                document
                    .querySelector(".nav-elements a[href*=" + id + "]")
                    .classList.add("active");
            });
        }
    });
};

/*Tab Highlighter Functionality*/
document.addEventListener('scroll', function () {
    TabHighlighter.refresh();
    changeNav();
});

document.addEventListener('click', function (e) {
    if (e.target.closest('nav')) {
        changeNav();
    }
});

var TabHighlighter = {
    refresh: function () {
        var activeLink = document.querySelector('nav.sticky-top .nav-elements .nav-link.active');
        var navElements = document.querySelector('.nav-elements');
        var highlighter = document.querySelector('.nav-highlighter');

        if (activeLink && navElements && highlighter) {
            var activeRect = activeLink.getBoundingClientRect();
            var navRect = navElements.getBoundingClientRect();

            highlighter.style.left = (activeRect.left - navRect.left) + 'px';
            highlighter.style.width = activeRect.width + 'px';
        }
    }
};

window.addEventListener('resize', function () {
    TabHighlighter.refresh();
});

document.addEventListener('DOMContentLoaded', function () {
    TabHighlighter.refresh();
});

function reveal() {
    var reveals = document.querySelectorAll(".reveal");

    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        } else {
            reveals[i].classList.remove("active");
        }
    }
}

window.addEventListener("scroll", reveal);

// To check the scroll position on page load
reveal();

function changeNav() {
    var stickyTop = document.querySelector('.sticky-top');
    var nav = document.querySelector('nav');
    var navHighlighter = document.querySelector('.nav-highlighter');
    var bgLeft = document.querySelector('.bgLeft');
    var bgRight = document.querySelector('.bgRight');

    if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
        if (stickyTop) {
            stickyTop.style.top = "0";
            stickyTop.style.backgroundColor = 'rgba(0,0,0,0.6)';
        }
        if (nav) {
            nav.style.height = "40px";
        }
        if (navHighlighter) {
            navHighlighter.style.height = "4px";
        }
        if (bgLeft) {
            bgLeft.style.backgroundColor = 'rgba(0,0,0,0.6)';
            bgLeft.style.width = "100vw";
            bgLeft.style.left = "-100vw";
        }
        if (bgRight) {
            bgRight.style.backgroundColor = 'rgba(0,0,0,0.6)';
            bgRight.style.width = "100vw";
        }
    } else {
        if (stickyTop) {
            stickyTop.style.top = "2em";
            stickyTop.style.backgroundColor = 'rgba(0,0,0,0.2)';
        }
        if (bgLeft) {
            bgLeft.style.backgroundColor = 'rgba(0,0,0,0.2)';
            bgLeft.style.width = "0vw";
            bgLeft.style.left = "0vw";
        }
        if (bgRight) {
            bgRight.style.backgroundColor = 'rgba(0,0,0,0.2)';
            bgRight.style.width = "0vw";
        }
        if (nav) {
            nav.style.height = "64px";
        }
        if (navHighlighter) {
            navHighlighter.style.height = "6px";
        }
    }
}

// Custom Carousel Implementation
class CustomCarousel {
    constructor(element) {
        this.carousel = element;
        this.items = element.querySelectorAll('.carousel-item');
        this.currentIndex = 0;
        this.indicators = document.querySelectorAll('#carousel-text-indicators .carousel-text-indicator');

        this.init();
    }

    init() {
        this.showItem(0);
    }

    showItem(index) {
        // Hide all items
        this.items.forEach(item => item.classList.remove('active'));

        // Show current item
        if (this.items[index]) {
            this.items[index].classList.add('active');
            this.currentIndex = index;
        }

        // Update indicators
        this.indicators.forEach((indicator, i) => {
            if (i === index) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    to(index) {
        if (index >= 0 && index < this.items.length) {
            this.showItem(index);
        }
    }

    static getInstance(element) {
        if (!element._customCarousel) {
            element._customCarousel = new CustomCarousel(element);
        }
        return element._customCarousel;
    }
}

const welcomeSection = document.getElementById('welcome');
const welcomeVideo = document.getElementById('welcomeVideo');

function repositionVideo() {
    if (!welcomeVideo || !welcomeSection) return;
    const sectionRect = welcomeSection.getBoundingClientRect();
    const videoRect = welcomeVideo.getBoundingClientRect();
    const heightDifference = sectionRect.height - videoRect.height;
    welcomeVideo.style.bottom = `${-heightDifference}`;
}

window.addEventListener('resize', repositionVideo);
repositionVideo();