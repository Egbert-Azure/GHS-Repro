/* Fotos in Beiträgen und auf Seiten: Antippen oder Klicken öffnet das Foto bildschirmfüllend (PhotoSwipe).
   Zoomen mit zwei Fingern, Doppeltippen oder dem Lupen-Knopf; Wischen oder Pfeile zum nächsten Foto
   des Beitrags; Schließen mit X, Esc oder Wischen nach oben/unten.
   Fotos, die verlinkt sind, öffnen weiter ihren Link. */
import PhotoSwipe from './photoswipe/photoswipe.esm.min.js';

const BEREICHE = '.page__content, .post__content';

const quelle = (img) => img.currentSrc || img.src || img.dataset.src || '';

function fotosIn(bereich) {
  return [...bereich.querySelectorAll('img')].filter((img) => !img.closest('a') && quelle(img));
}

function eintrag(img) {
  // Maße bekannt, wenn das Foto schon geladen ist; sonst vorläufig, korrigiert nach dem Laden (loadComplete)
  const w = img.naturalWidth || parseInt(img.getAttribute('width'), 10) || 1600;
  const h = img.naturalHeight || parseInt(img.getAttribute('height'), 10) || 1200;
  return { src: quelle(img), width: w, height: h, alt: img.alt || '' };
}

// Kleine alte Fotos höchstens auf das Doppelte vergrößert öffnen, große passend zum Bildschirm
const passend = (z) => Math.min(z.panAreaSize.x / z.elementSize.x, z.panAreaSize.y / z.elementSize.y);
const anfang = (z) => Math.min(2, passend(z));
const zweite = (z) => Math.min(4, Math.max(1, anfang(z) * 2.5));

document.addEventListener('click', (ev) => {
  const img = ev.target instanceof Element ? ev.target.closest('img') : null;
  if (!img || img.closest('a')) return;
  const bereich = img.closest(BEREICHE);
  if (!bereich) return;
  const fotos = fotosIn(bereich);
  const index = fotos.indexOf(img);
  if (index < 0) return;
  ev.preventDefault();

  const pswp = new PhotoSwipe({
    dataSource: fotos.map(eintrag),
    index,
    bgOpacity: 1,
    showHideAnimationType: 'fade',
    initialZoomLevel: anfang,
    secondaryZoomLevel: zweite,
    maxZoomLevel: 4,
    indexIndicatorSep: ' von ',
    closeTitle: 'Schließen (Esc)',
    zoomTitle: 'Vergrößern',
    arrowPrevTitle: 'Vorheriges Foto',
    arrowNextTitle: 'Nächstes Foto',
    errorMsg: 'Das Foto konnte nicht geladen werden.',
  });

  pswp.on('loadComplete', ({ content, slide }) => {
    const el = content.element;
    if (!el || !el.naturalWidth) return;
    if (el.naturalWidth === content.width && el.naturalHeight === content.height) return;
    content.width = content.data.width = el.naturalWidth;
    content.height = content.data.height = el.naturalHeight;
    if (slide) {
      slide.width = content.width;
      slide.height = content.height;
      slide.resize();
    }
  });

  pswp.init();
});
