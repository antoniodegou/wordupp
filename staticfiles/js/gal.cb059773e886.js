let carousel = document.querySelector('.carousel1');
let items;

function updateItems() {
  items = document.querySelectorAll('.carousel-item1');
}

function reorderZIndex() {
  items.forEach((item, index) => {
    item.style.zIndex = items.length - index;
  });
}

function randomRotation() {
  return Math.floor(Math.random() * 16) - 8; // Cranked up the rotation between -8 and 8 degrees
}

// Initial setup
updateItems();
reorderZIndex();

setInterval(() => {
  // Get the front-most item (highest z-index)
  let frontItem = items[0];
  
  // Slide the front item sideways
  frontItem.style.transform = `rotate(0deg) translateX(350px)`;

  setTimeout(() => {
    // Slide it back but lower the z-index so it goes to the back
    frontItem.style.zIndex = -1;
    frontItem.style.transform = `rotate(0deg) translateX(0px)`;
  }, 1000);

  setTimeout(() => {
    // Reset transform and officially move it to the back
    frontItem.style.transform = `rotate(${randomRotation()}deg) translateX(0px)`;
    carousel.removeChild(frontItem); // Remove the item from the stack
    carousel.appendChild(frontItem);  // Append the item to the end, effectively moving it to the back
    updateItems();
    reorderZIndex();
  }, 2000);
}, 4000);
