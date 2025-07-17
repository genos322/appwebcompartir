// import { addPrevNextBtnsClickHandlers } from 'public/EmblaCarouselPrevNextButton.js'
// import { addDotBtnsAndClickHandlers } from './js/EmblaCarouselDotButton.js'

window.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.embla__container');
  try {
    const res = await fetch('/videos');
    const videos = await res.json();

    videos.forEach(fileName => {
      const ext = fileName.split('.').pop();
      const isVideo = ext === 'mp4';
      container.insertAdjacentHTML('beforeend', `
        <div class="embla__slide">
          <div class="embla__slide__number">
          ${isVideo
            ? `<video src="upload/${fileName}#t=10" controls></video>`
            : `<img src="upload/${fileName}" alt="Imagen ${fileName}">`
          }
          </div>
        </div>
      `);
    });

    // 🔄 Si usas Embla, reinit
    if (typeof emblaApi !== 'undefined') {
      emblaApi.reInit();
    }
  } catch (err) {
    console.error('Error cargando videos:', err);
  }
});
document.addEventListener('DOMContentLoaded', function () {
const OPTIONS = {
  loop:true
}
const plugins = [EmblaCarouselAutoplay(),EmblaCarouselFade()]

const emblaNode = document.querySelector('.embla')
const viewportNode = emblaNode.querySelector('.embla__viewport')
const prevBtnNode = emblaNode.querySelector('.embla__button--prev')
const nextBtnNode = emblaNode.querySelector('.embla__button--next')
const dotsNode = emblaNode.querySelector('.embla__dots')

const emblaApi = EmblaCarousel(viewportNode, OPTIONS,plugins)

const removePrevNextBtnsClickHandlers = addPrevNextBtnsClickHandlers(
  emblaApi,
  prevBtnNode,
  nextBtnNode
)
const removeDotBtnsAndClickHandlers = addDotBtnsAndClickHandlers(
  emblaApi,
  dotsNode
)

emblaApi.on('destroy', removePrevNextBtnsClickHandlers)
emblaApi.on('destroy', removeDotBtnsAndClickHandlers)


    console.log('Número de slides:', emblaApi.slideNodes().length);

    //functions
function addDotBtnsAndClickHandlers  (emblaApi, dotsNode)  {
    let dotNodes = []

    const addDotBtnsWithClickHandlers = () => {
      dotsNode.innerHTML = emblaApi
        .scrollSnapList()
        .map(() => '<button class="embla__dot" type="button"></button>')
        .join('')

      const scrollTo = (index) => {
        emblaApi.scrollTo(index)
      }

      dotNodes = Array.from(dotsNode.querySelectorAll('.embla__dot'))
      dotNodes.forEach((dotNode, index) => {
        dotNode.addEventListener('click', () => scrollTo(index), false)
      })
    }

    const toggleDotBtnsActive = () => {
      const previous = emblaApi.previousScrollSnap()
      const selected = emblaApi.selectedScrollSnap()
      dotNodes[previous].classList.remove('embla__dot--selected')
      dotNodes[selected].classList.add('embla__dot--selected')
    }

    emblaApi
      .on('init', addDotBtnsWithClickHandlers)
      .on('reInit', addDotBtnsWithClickHandlers)
      .on('init', toggleDotBtnsActive)
      .on('reInit', toggleDotBtnsActive)
      .on('select', toggleDotBtnsActive)

    return () => {
      dotsNode.innerHTML = ''
    }
}


function addTogglePrevNextBtnsActive (emblaApi, prevBtn, nextBtn) {
  const togglePrevNextBtnsState = () => {
    if (emblaApi.canScrollPrev()) prevBtn.removeAttribute('disabled')
    else prevBtn.setAttribute('disabled', 'disabled')

    if (emblaApi.canScrollNext()) nextBtn.removeAttribute('disabled')
    else nextBtn.setAttribute('disabled', 'disabled')
  }

  emblaApi
    .on('select', togglePrevNextBtnsState)
    .on('init', togglePrevNextBtnsState)
    .on('reInit', togglePrevNextBtnsState)

  return () => {
    prevBtn.removeAttribute('disabled')
    nextBtn.removeAttribute('disabled')
  }
}

function addPrevNextBtnsClickHandlers (emblaApi, prevBtn, nextBtn) {
  const scrollPrev = () => {
    emblaApi.scrollPrev()
  }
  const scrollNext = () => {
    emblaApi.scrollNext()
  }
  prevBtn.addEventListener('click', scrollPrev, false)
  nextBtn.addEventListener('click', scrollNext, false)

  const removeTogglePrevNextBtnsActive = addTogglePrevNextBtnsActive(
    emblaApi,
    prevBtn,
    nextBtn
  )

  return () => {
    removeTogglePrevNextBtnsActive()
    prevBtn.removeEventListener('click', scrollPrev, false)
    nextBtn.removeEventListener('click', scrollNext, false)
  }
}
//socket io
const socket = io();
const cFile = document.querySelector('.embla__container');
console.log('cFile:', cFile);



document.getElementById('getFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  document.querySelector('.loader').style.display = 'block';
  document.querySelector('#imageFile').style.display = 'none';
  document.querySelector('#labelfile').style.display = 'none';


  await new Promise(requestAnimationFrame);

  const arrayBuffer = await file.arrayBuffer(); // convierte File a buffer
  console.log('Archivo seleccionado:', file.name, file.type, arrayBuffer);
  socket.emit('upload-video', {
    buffer: arrayBuffer,
    type: file.type,
    name: file.name,
    extension: file.name.slice(-3)
  }, (res) => {
    if (res.success) {
      document.querySelector('.loader').style.display = 'none';
      document.querySelector('#imageFile').style.display = 'block';
      document.querySelector('#labelfile').style.display = 'block';
      if( file.type.startsWith('video/')) {
        cFile.insertAdjacentHTML(`beforeend`,`
        <div class="embla__slide">
          <div class="embla__slide__number">
            <video alt="" controls> 
              <source src="upload/${res.fileName}#t=10" type="video/${res.extension}">
            </video>
          </div>
        </div>`);
      }
      else if (file.type.startsWith('image/')) {
        cFile.insertAdjacentHTML(`beforeend`,`
        <div class="embla__slide">
          <div class="embla__slide__number">
            <img src="upload/${res.fileName}" alt="">
          </div>
        </div>`);
      }
    } else {
      console.error('Error al actualizar el archivo:', res.message || res.error);
      document.querySelector('.loader').style.display = 'none';
      document.querySelector('#imageFile').style.display = 'block';
      document.querySelector('#labelfile').style.display = 'block';
    }
  });
});

});

function callIF(){
  document.getElementById('getFile').click();
}



