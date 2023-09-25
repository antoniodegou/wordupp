
document.addEventListener('DOMContentLoaded', function() {
    const wordCanvas = new WordCanvas();
  
    const sliderMappings = [
        ['bgSize', 'bgSizeValue'],
        ['bgPosX', 'bgPosXValue'],
        ['bgPosY', 'bgPosYValue'],
        ['hSpacing', 'hSpacingValue'],
        ['vSpacing', 'vSpacingValue'],
        ['vLines', 'vLinesValue'],
        ['hLines', 'hLinesValue'],
        ['brushSize', 'brushSizeValue']
    ];

    sliderMappings.forEach(([sliderId, displayId]) => {
        updateSliderValueDisplay(sliderId, displayId);
    });

 
    initializeDraggableContainers();
    handleBrushPaneChanges();
    updateSubmenus()
 
});

// Get all pane-buttons
const buttons2 = document.querySelectorAll('.pane-button');


// Loop through each button
buttons2.forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all other buttons
        buttons2.forEach(btn => {
            btn.classList.remove('active');
        });
        // Add active class to the clicked button
       btn.classList.add('active');
    });
});

function  updateSliderValueDisplay(sliderId, displayId) {
      const slider = document.getElementById(sliderId);
      const display = document.getElementById(displayId);
      if (slider && display) {
          display.textContent = slider.value;
          slider.addEventListener('input', function() {
              display.textContent = slider.value;
              // this.updateAndRender();  // Assuming 'updateAndRender' is a class method
          }.bind(this));
      }
  }


function showToast(message) {
      const toastEl = document.getElementById('errorToast');
      const toast = new bootstrap.Toast(toastEl);
      toastEl.querySelector('.toast-body').textContent = message;
      toast.show();
  }


function  shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]]; // Swap elements
      }
  }


function   updateSubmenus() {
      const buttons = document.querySelectorAll('.pane-button');
      const contents = document.querySelectorAll('.pane-content');


      buttons.forEach(button => {
          button.addEventListener('click', () => {
              const targetPane = button.getAttribute('data-pane');
              // Hide all contents
              contents.forEach(content => {
                  content.style.display = 'none';
              });
              // Show the selected content
              document.getElementById(targetPane).style.display = 'block';
          });
      });

      const brushModeElement = document.querySelector("#brushMode");
      if (brushModeElement) {
          brushModeElement.addEventListener("change", (e) => {
              handleBrushPaneChanges();
          });
      }
  }


function handleBrushPaneChanges() {
    let   brushMode = document.getElementById("brushMode").value;

      let brushSizeControl = document.getElementById('brushSizeControl');
      let colorPickerControl = document.getElementById('colorPickerControl');
      let minSizeControl = document.getElementById('minSizeControl');
      let maxSizeControl = document.getElementById('maxSizeControl');

      // Hide all controls if they exist

      if (brushSizeControl) brushSizeControl.style.display = 'none';
      if (colorPickerControl) colorPickerControl.style.display = 'none';
      if (minSizeControl) minSizeControl.style.display = 'none';
      if (maxSizeControl) maxSizeControl.style.display = 'none';
      // collectCanvasState();
      switch ( brushMode) {
          case 'delete':
              // All controls remain hidden for delete mode
              break;
          case 'changeColor':
              if (colorPickerControl) colorPickerControl.style.display = 'block';
              break;
          case 'changeSize':
              if (brushSizeControl) brushSizeControl.style.display = 'block';
              break;
          case 'randomizeSize':
              if (minSizeControl) minSizeControl.style.display = 'block';
              if (maxSizeControl) maxSizeControl.style.display = 'block';
              break;
      }
}


function initializeDraggableContainers() {

     draggableContainers = document.querySelectorAll('.pane-content');

      draggableContainers.forEach(draggableContainer => {
          draggableContainer.addEventListener('mousedown', (e) => {
              if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
                  return; // If the target is a range slider, don't initiate the drag
              }
               isMouseDown = true;
              startX = e.pageX - draggableContainer.offsetLeft;
               scrollLeft = draggableContainer.scrollLeft;
          });

          draggableContainer.addEventListener('mouseleave', () => {
               isMouseDown = false;
          });

          draggableContainer.addEventListener('mouseup', () => {
               isMouseDown = false;
          });

          draggableContainer.addEventListener('mousemove', (e) => {
              if (!isMouseDown) return;
              e.preventDefault();
              const x = e.pageX - draggableContainer.offsetLeft;
              const walk = (x -  startX);
              draggableContainer.scrollLeft =  scrollLeft - walk;

          });

          // Touch events
          draggableContainer.addEventListener('touchstart', (e) => {
              if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
                   touchOnSlider = true;
                  return;
              }
              touchOnSlider = false;
               isMouseDown = true;
               startX = e.touches[0].pageX - draggableContainer.offsetLeft;
               scrollLeft = draggableContainer.scrollLeft;
          }, { passive: true });

          draggableContainer.addEventListener('touchend', () => {
               isMouseDown = false;
               touchOnSlider = false;
          }, { passive: true });

          draggableContainer.addEventListener('touchmove', (e) => {
              if (!isMouseDown ||  touchOnSlider) return;
              e.preventDefault();
              const x = e.touches[0].pageX - draggableContainer.offsetLeft;
              const walk = (x -  startX);
              draggableContainer.scrollLeft =  scrollLeft - walk;
          }, { passive: false });
      });
  }



function addEventListeners(elementIds, eventType, callback) {

      // Ensure elementIds is always an array
      if (typeof elementIds === 'string') {
          elementIds = [elementIds];
      }

      elementIds.forEach(id => {
          const element = document.getElementById(id);
          if (element) {
              element.addEventListener(eventType, callback.bind(this));
          }
      });
  }