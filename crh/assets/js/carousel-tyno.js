/**
 * Tyno's carousel code
 */

 // handles multiple carousel sections using uniue ids for each one
const carouselHandler = (caroselId) => {
    
    // DOM queries
    let carouselItems = document.querySelectorAll(`#${caroselId} .carousel__item`);
    let carouselSubtitles = document.querySelectorAll(`#${caroselId} .carousel__subtitle`);

    // state
    let currentItem = 0;
    let caroselItensLenght = carouselItems.length;
    let carouselSubtitlesLenght = carouselSubtitles.length;

    // DOM events
    $(`#${caroselId} .carousel__control`).on('click', function(event) {
        let control = event.currentTarget;

        // remove the current item 'active' class
        carouselItems[currentItem].classList.remove('carousel__item--active');
        carouselSubtitles[currentItem].classList.remove('carousel__subtitle--active');

        // checks if 'prev' or 'next' and add 'active' class according to the slide direction

        if (control.dataset.slide === 'next') {      

            if (currentItem < caroselItensLenght-1) {
                currentItem ++;
                carouselItems[currentItem].classList.add('carousel__item--active'); // shows the corresponding picture
                carouselSubtitles[currentItem].classList.add('carousel__subtitle--active'); // shows the corresponding subtitle
            } else {
                currentItem = 0;
                carouselItems[currentItem].classList.add('carousel__item--active');  // shows the corresponding picture   
                carouselSubtitles[currentItem].classList.add('carousel__subtitle--active'); // shows the corresponding subtitle
            }

        } else if (control.dataset.slide === 'prev') {

            if (currentItem === 0) {
                currentItem = caroselItensLenght-1;
                carouselItems[currentItem].classList.add('carousel__item--active'); // shows the corresponding picture
                carouselSubtitles[currentItem].classList.add('carousel__subtitle--active'); // shows the corresponding subtitle
            } else {
                currentItem --;
                carouselItems[currentItem].classList.add('carousel__item--active'); // shows the corresponding picture    
                carouselSubtitles[currentItem].classList.add('carousel__subtitle--active'); // shows the corresponding subtitle
            }
        }
    });
}

// 
$('.carousel__tyno').each(function() {
    let carouselid = $(this).attr('id');
    carouselHandler(carouselid);
});



