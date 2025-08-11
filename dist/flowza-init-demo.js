//flowza.useTransition('fade');
//flowza.useTransition('slideLeft');
//flowza.useTransition('zoom'); 
//flowza.useTransition('overlay'); 
flowza.useTransition('overlaySlideUp');

flowza.on('afterEnter', () => {
  console.log('Page entered with CSS overlay transition!');
});




/*flowza.setTransitions(
  // leave
  {
    anime: () => new Promise(resolve => {
      const overlay = document.querySelector('#page-overlay');
      overlay.style.display = 'block';
      anime({
        targets: overlay,
        top: ['100vh', '0vh'], // from -> to
        opacity: [1, 1],
        duration: 500,
        delay: 0,
        easing: 'easeInOutQuad',
        complete: resolve
      });
    })
  },
  // enter
  {
    anime: () => new Promise(resolve => {
      const overlay = document.querySelector('#page-overlay');
      anime({
        targets: overlay,
        top: ['0vh', '-100vh'], // from -> to
        opacity: [1, 1],
        duration: 500,
        delay: 0,
        easing: 'easeInOutQuad',
        complete: () => {
          overlay.style.display = 'none';
          resolve();
        }
      });
    })
  }
);*/



/*flowza.setTransitions(
  // leave
  {
    gsap: () => new Promise(resolve => {
      const overlay = document.querySelector('#page-overlay');
      overlay.style.display = 'block';
      gsap.fromTo(
        overlay,
        { top: '100vh', opacity: 1 }, // starting values
        { top: '0vh', opacity: 1, duration: 0.5, delay: 0, onComplete: resolve }
      );
    })
  },
  // enter
  {
    gsap: () => new Promise(resolve => {
      const overlay = document.querySelector('#page-overlay');
      gsap.fromTo(
        overlay,
        { top: '0vh', opacity: 1 }, // starting values
        { top: '-100vh', opacity: 1, duration: 0.5, delay: 0, onComplete: () => {
            overlay.style.display = 'none';
            resolve();
          }
        }
      );
    })
  }
);*/



/*flowza.setTransitions(
  // leave
  {
    '#page-overlay': {
      top: '0vh',
      opacity: '1',
      duration: 0.5,
      delay: 0
    }
  },
  // enter
  {
    '#page-overlay': {
      top: '-100vh',
      opacity: '1',
      duration: 0.5,
      delay: 0
      
    }
  }
);*/
