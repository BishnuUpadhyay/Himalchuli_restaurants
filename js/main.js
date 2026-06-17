(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.navbar').addClass('sticky-top shadow-sm');
        } else {
            $('.navbar').removeClass('sticky-top shadow-sm');
        }
    });
    
    
    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";
    
    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
        console.log($videoSrc);

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        margin: 24,
        dots: true,
        loop: true,
        nav : false,
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });
    
})(jQuery);

const menuData = [
  {
    "category": "Appetizers / Snacks",
    "items": [
      { "id": 1001, "name": "Chicken 65", "price": 11.99, "description": "Spicy South Indian style crispy chicken tossed with curry leaves and herbs.", "image": "chicken_65.jpg" },
      { "id": 1002, "name": "Gobi Manchurian", "price": 10.99, "description": "Vegan crispy cauliflower florets tossed in Indo-Chinese garlic chili sauce.", "image": "gobi_manchurian.jpg" },
      { "id": 1003, "name": "Samosa Chat", "price": 7.99, "description": "Crushed vegetable samosas topped with yogurt, chutneys, onions, and spices.", "image": "samosa_chat.jpg" },
      { "id": 1004, "name": "Mix Vegetarian Pakora", "price": 6.99, "description": "Vegan assorted vegetable fritters dipped in garbanzo flour batter and deep fried.", "image": "pakora.jpg" },
      { "id": 1005, "name": "Sekuwa Chicken", "price": 12.99, "description": "Nepali grilled chicken marinated with Himalayan herbs and spices.", "image": "chicken_sekuwa.jpg" }
    ]
  },
  {
    "category": "Vegetable Entrée",
    "items": [
      { "id": 2001, "name": "Paneer Tikka Masala", "price": 15.99, "description": "Grilled paneer cubes in creamy tomato onion sauce.", "image": "" },
      { "id": 2002, "name": "Vegetable Vindaloo", "price": 14.99, "description": "Vegan spicy tangy Goan-style curry.", "image": "" },
      { "id": 2003, "name": "Vegetable Curry", "price": 13.99, "description": "Seasonal vegetables in onion tomato gravy.", "image": "" }
    ]
  },
  {
    "category": "Non-Veg Entrée",
    "items": [
      { "id": 3001, "name": "Chicken Curry", "price": 15.99, "description": "Traditional chicken curry with onion tomato sauce.", "image": "" },
      { "id": 3002, "name": "Butter Chicken", "price": 16.99, "description": "Creamy tomato butter chicken.", "image": "" }
    ]
  }
  // Add other menu categories safely here...
];

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("menu-container");
  let htmlContent = "";

  menuData.forEach((categoryBlock, index) => {
    const tabNumber = index + 1;
    // Set first tab to active and show status automatically
    const isActive = tabNumber === 1 ? "active show" : "";

    htmlContent += `
      <div id="tab-${tabNumber}" class="tab-pane fade ${isActive} p-0">
        <div class="row g-4">
    `;

    categoryBlock.items.forEach(item => {
      // Fallback fallback pathing for elements with blank image paths
     const imageSrc = item.image ? `images/${item.image}` : 'img/default-food.jpg';

      htmlContent += `
        <div class="col-lg-6">
          <div class="d-flex align-items-center">
            <img class="flex-shrink-0 img-fluid rounded" src="${imageSrc}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover;">
            <div class="w-100 d-flex flex-column text-start ps-4">
              <h5 class="d-flex justify-content-between border-bottom pb-2">
                <span>${item.name}</span>
                <span class="text-primary">$${item.price.toFixed(2)}</span>
              </h5>
              <small class="fst-italic">${item.description}</small>
            </div>
          </div>
        </div>
      `;
    });

    htmlContent += `
        </div>
      </div>
    `;
  });

  container.innerHTML = htmlContent;
});

const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    function nextSlide() {
        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');
        
        // Move to the next slide, loop back to 0 if at the end
        currentSlide = (currentSlide + 1) % slides.length;
        
        // Add active class to the new slide
        slides[currentSlide].classList.add('active');
    }

    // Automatically change slide every 5000 milliseconds (5 seconds)
    setInterval(nextSlide, 5000);