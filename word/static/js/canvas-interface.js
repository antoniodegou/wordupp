let isMouseDown = false;
// Function to shuffle elements in an array randomly


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
};

/**
 * Sets up the behavior for pane buttons and their corresponding content sections.
 * When a pane button is clicked, all content sections are hidden, and only the targeted section is displayed.
 * Also, handles updates in the brush pane based on changes in brush mode.
 */
function updateSubmenus() {
    const buttons = document.querySelectorAll('.pane-button');
    const contents = document.querySelectorAll('.pane-content');

    // Listen for button clicks
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPane = button.getAttribute('data-pane');
            // Hide all content sections
            contents.forEach(content => {
                content.style.display = 'none';
            });
            // Display the content section related to the clicked button
            document.getElementById(targetPane).style.display = 'block';
        });
    });

    // Handle changes in brush mode
    const brushModeElement = document.querySelector("#brushMode");
    if (brushModeElement) {
        brushModeElement.addEventListener("change", () => {
            handleBrushPaneChanges();
        });
    }
}

/**
 * Initializes draggable behavior for .pane-content containers.
 * Allows the user to drag the container content horizontally.
 * Incorporates touch events for compatibility with touch devices, ensuring that range sliders are not affected.
 */

function  initializeDraggableContainers() {
    const draggableContainers = document.querySelectorAll('.pane-content');

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
            const walk = (x - startX);
            draggableContainer.scrollLeft = scrollLeft - walk;
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
            if (!isMouseDown || touchOnSlider) return;
            e.preventDefault();
            const x = e.touches[0].pageX - draggableContainer.offsetLeft;
            const walk = (x - startX);
            draggableContainer.scrollLeft = scrollLeft - walk;
        }, { passive: false });
    });
}

/**
 * Updates the brush pane controls based on the selected brush mode.
 * Depending on the brush mode, certain controls will be displayed or hidden.
 */

function  handleBrushPaneChanges() {
    brushMode = document.getElementById("brushMode").value;

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

    switch (brushMode) {
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




// individual listeners for input sliders
function updateSliderValueDisplay(sliderId, displayId) {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);
    if (slider && display) {
        display.textContent = slider.value;
        slider.addEventListener('input', function() {
            display.textContent = this.value;
            // updateAndRender();
        });
    }
}


// When the document is fully loaded, initialize the submenus, draggable containers, and brush pane

document.addEventListener('DOMContentLoaded', function() {
    updateSubmenus()
    initializeDraggableContainers()
    handleBrushPaneChanges()
    // make listeners for all the sliders
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
})