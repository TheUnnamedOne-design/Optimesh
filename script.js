const navLinks = document.querySelectorAll(".nav-links .nav-menu");
const menuOpenButton = document.querySelector("#menu-open-button");
const menuCloseButton = document.querySelector("#menu-close-button");

menuOpenButton.addEventListener("click" ,() => {
    document.body.classList.toggle("show-mobile-menu");
    document.body.classList.contains("show-mobile-menu");
})
menuCloseButton.addEventListener("click" ,() =>  menuOpenButton.click())

navLinks.forEach(link => {
    link.addEventListener("click", () => menuOpenButton.click());
    
});


const swiper = new Swiper('.slider-wrapper', {
    loop: true,
  
    // If we need pagination
    pagination: {
      el: '.swiper-pagination',
    },
  
    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });