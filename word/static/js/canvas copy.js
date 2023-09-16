

class WordCanvas {
    constructor(initialState = null) {
        this.canvas = document.getElementById('worduppCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvasElement = document.getElementById('worduppCanvas'); // Add this line
        this.brushModeElement = document.getElementById("brushMode");

        this.backgroundImg = null;
        this.wordsData = [];
        this.defaultControl = false;
        this.isMouseDown = false;
        this.startX = null;
        this.scrollLeft = null;
        this.touchOnSlider = false;
        this.isBrushing = false;
        this.canvasState = {
            words: ["Hello", "World"],
            shuffledWords: [],
            settings: {}
        };

        if (initialState) {
            this.collectCanvasState(initialState)
          }
   
        // Initialize methods that need to run during class instantiation
        // Call the necessary initialization methods
        this.initializeEventListeners();
        this.initializeDraggableContainers();
        this.handleBrushPaneChanges();
        this.updateAndRender(true);
        this.updateSubmenus();
          
        this.sliderMappings = [
            ['bgSize', 'bgSizeValue'],
            ['bgPosX', 'bgPosXValue'],
            ['bgPosY', 'bgPosYValue'],
            ['hSpacing', 'hSpacingValue'],
            ['vSpacing', 'vSpacingValue'],
            ['vLines', 'vLinesValue'],
            ['hLines', 'hLinesValue'],
            ['brushSize', 'brushSizeValue']
        ];
      
      
        // Set up event listeners for all sliders
        this.initializeSliders();

        if (this.canvasState.wordsData) {
            this.wordsData = this.canvasState.wordsData;
        } else {
            const initialWords = this.canvasState.words;
            this.initializeWordsData(initialWords);
        }

        this.updateAndRender(true); // Reinitialize words




    }


    /**
     * Shuffles an array in-place.
     * @param {Array} array - The array to shuffle.
    */
    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
    }

    /**
     * Displays a Bootstrap toast message.
     * @param {string} message - The message to display in the toast.
    */
    static showToast(message) {
        const toastEl = document.getElementById('errorToast');
        const toast = new bootstrap.Toast(toastEl);
        toastEl.querySelector('.toast-body').textContent = message;
        toast.show();
    }

    /**
     * Updates and renders the text on the canvas.
     * If shouldReinitialize is true, reinitializes the word data based on the current configuration.
     * Collects the current canvas state and renders the text.
     * 
     * @param {boolean} shouldReinitialize - Whether to reinitialize word data.
     */
    updateAndRender(shouldReinitialize = false) {
        if (shouldReinitialize) {
            const isRandomOrder = document.getElementById("randomOrder").checked;
            let words = document.getElementById("userText").value.split(" ");
            if (isRandomOrder) {
                WordCanvas.shuffleArray(words);
            }
            this.initializeWordsData(words);
        }
         this.collectCanvasState();
        this.renderText();
    }

     /**
     * Sets up the behavior for pane buttons and their corresponding content sections.
     * When a pane button is clicked, all content sections are hidden, and only the targeted section is displayed.
     * Also, handles updates in the brush pane based on changes in brush mode.
     */

    updateSubmenus() {
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

        const brushModeElement = this.canvasElement.querySelector("#brushMode");
        if (brushModeElement) {
            brushModeElement.addEventListener("change", () => {
                this.handleBrushPaneChanges();
            });
        }
    }

    /**
     * Initializes draggable behavior for .pane-content containers.
     * Allows the user to drag the container content horizontally.
     * Incorporates touch events for compatibility with touch devices, ensuring that range sliders are not affected.
     */
    initializeDraggableContainers() {
        const draggableContainers = document.querySelectorAll('.pane-content');

        draggableContainers.forEach(draggableContainer => {
            draggableContainer.addEventListener('mousedown', (e) => {
                if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
                    return; // If the target is a range slider, don't initiate the drag
                }
                this.isMouseDown = true;
                this.startX = e.pageX - draggableContainer.offsetLeft;
                this.scrollLeft = draggableContainer.scrollLeft;
            });

            draggableContainer.addEventListener('mouseleave', () => {
                this.isMouseDown = false;
            });

            draggableContainer.addEventListener('mouseup', () => {
                this.isMouseDown = false;
            });

            draggableContainer.addEventListener('mousemove', (e) => {
                if (!this.isMouseDown) return;
                e.preventDefault();
                const x = e.pageX - draggableContainer.offsetLeft;
                const walk = (x - this.startX);
                draggableContainer.scrollLeft = this.scrollLeft - walk;
            });

            // Touch events
            draggableContainer.addEventListener('touchstart', (e) => {
                if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
                    this.touchOnSlider = true;
                    return;
                }
                this.touchOnSlider = false;
                this.isMouseDown = true;
                this.startX = e.touches[0].pageX - draggableContainer.offsetLeft;
                this.scrollLeft = draggableContainer.scrollLeft;
            }, { passive: true });

            draggableContainer.addEventListener('touchend', () => {
                this.isMouseDown = false;
                this.touchOnSlider = false;
            }, { passive: true });

            draggableContainer.addEventListener('touchmove', (e) => {
                if (!this.isMouseDown || this.touchOnSlider) return;
                e.preventDefault();
                const x = e.touches[0].pageX - draggableContainer.offsetLeft;
                const walk = (x - this.startX);
                draggableContainer.scrollLeft = this.scrollLeft - walk;
            }, { passive: false });
        });
    }

    handleBrushPaneChanges() {
        this.brushMode = document.getElementById("brushMode").value;

        let brushSizeControl = document.getElementById('brushSizeControl');
        let colorPickerControl = document.getElementById('colorPickerControl');
        let minSizeControl = document.getElementById('minSizeControl');
        let maxSizeControl = document.getElementById('maxSizeControl');

        // Hide all controls if they exist
        if (brushSizeControl) brushSizeControl.style.display = 'none';
        if (colorPickerControl) colorPickerControl.style.display = 'none';
        if (minSizeControl) minSizeControl.style.display = 'none';
        if (maxSizeControl) maxSizeControl.style.display = 'none';
        this.collectCanvasState();
        switch (this.brushMode) {
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

    collectCanvasState(state = null) {
        if (state) {
            // If a saved state is provided, apply it
            this.canvasState = JSON.parse(state);

        } else {
        // main text
        const userText = document.getElementById("userText").value;
        const inputWords = userText.split(" ");

        // Canvas size
        const canvasWidth = parseInt(document.getElementById("canvasWidth").value, 10);
        const canvasHeight = parseInt(document.getElementById("canvasHeight").value, 10);
        const [width, height] = document.getElementById("canvasPresets").value.split('x');

                // text controls
        const fontSelector = document.getElementById("fontSelector").value;
        const textSize = parseInt(document.getElementById("textSize").value, 10);
        const textColor = document.getElementById("textColor").value;
        const randomCheck = document.getElementById("randomOrder").checked;


        //background controls
        const bgColor = document.getElementById("bgColor").value;
      
        const bgSize = parseInt(document.getElementById('bgSize').value) ;
        const bgPosX = parseInt(document.getElementById('bgPosX').value);
        const bgPosY= parseInt(document.getElementById('bgPosY').value);
        const color1 = document.getElementById("primaryColor").value;
        const color2 = document.getElementById("secondaryColor").value;
        const bgPreset = document.getElementById("bgPresets").value;

        // lines control
        const vLines = parseInt(document.getElementById("vLines").value, 10);
        const hLines = parseInt(document.getElementById("hLines").value, 10);
        const hSpacing = parseInt(document.getElementById("hSpacing").value, 10);
        const vSpacing = parseInt(document.getElementById("vSpacing").value, 10);


        // brush tools
        const brushMode = document.getElementById("brushMode").value;
        const brushSize = parseFloat(document.getElementById("brushSize").value);
        const brushColor = document.getElementById("brushColor").value;
        const minSize = parseInt(document.getElementById("minSize").value, 10);
        const maxSize = parseInt(document.getElementById("maxSize").value, 10);

        // Updating this.canvasState
        this.canvasState.words = this.wordsData.map(wordObj => wordObj.text);
        this.canvasState.settings.canvasWidth = canvasWidth;
        this.canvasState.settings.canvasHeight = canvasHeight;
        this.canvasState.settings.font = fontSelector;
        this.canvasState.settings.textSize = textSize;
        this.canvasState.settings.textColor = textColor;
        this.canvasState.settings.bgColor = bgColor;
        this.canvasState.settings.bgSize = bgSize;
        this.canvasState.settings.bgPosX = bgPosX;
        this.canvasState.settings.randomOrder = randomCheck;
        this.canvasState.settings.bgPosY = bgPosY;
        this.canvasState.settings.vLines = vLines;
        this.canvasState.settings.hLines = hLines;
        this.canvasState.settings.hSpacing = hSpacing;
        this.canvasState.settings.vSpacing = vSpacing;
        this.canvasState.settings.brushMode = brushMode;
        this.canvasState.settings.brushSize = brushSize;
        this.canvasState.settings.brushColor = brushColor;
        this.canvasState.settings.minSize = minSize;
        this.canvasState.settings.maxSize = maxSize;
        this.canvasState.settings.bgPreset =  bgPreset 
        this.canvasState.settings.color1 = color1;
        this.canvasState.settings.color2 = color2;
        this.canvasState.wordsData = this.wordsData;
        this.canvasState.originalWords = inputWords;

        // If shuffledWords is empty or userText has changed, reshuffle
        this.canvasState.shuffledWords = [...inputWords].sort(() => Math.random() - 0.5);

    }
    }

    initializeWordsData(inputWords) {
        this.wordsData = [];
        const horizontalSpacing = this.canvasState.settings.hSpacing;
        const verticalSpacing = this.canvasState.settings.vSpacing;
        const verticalLines = this.canvasState.settings.vLines;
        const horizontalLines = this.canvasState.settings.hLines;
        const wordColor = this.canvasState.settings.textColor;
        const wordSize = this.canvasState.settings.textSize;
        const font = this.canvasState.settings.font;

        const startY = (this.canvas.height - verticalSpacing * (verticalLines - 1)) / 2;

        // Decide which word set to use based on this.canvasState.settings.randomOrder
        const orderedWords = this.canvasState.settings.randomOrder ? this.canvasState.shuffledWords : inputWords;

        let totalWords = [];
        for (let i = 0; i < verticalLines * horizontalLines; i++) {
            totalWords.push(orderedWords[i % orderedWords.length]);
        }

        for (let i = 0; i < verticalLines; i++) {
            // Calculate the total width of the words for this line
            let lineWidth = 0;
            for (let j = 0; j < horizontalLines; j++) {
                const currentWord = totalWords[i * horizontalLines + j];
                this.ctx.font = wordSize + 'px ' + font;
                lineWidth += this.ctx.measureText(currentWord).width;
            }
            lineWidth += horizontalSpacing * (horizontalLines - 1);

            // Calculate starting X position to center the line
            let cumulativeWidth = (this.canvas.width - lineWidth) / 2;

            for (let j = 0; j < horizontalLines; j++) {
                const currentWord = totalWords[i * horizontalLines + j];
                this.ctx.font = wordSize + 'px ' + font;
                const wordWidth = this.ctx.measureText(currentWord).width;
                const word = {
                    text: currentWord,
                    x: cumulativeWidth,
                    y: startY + i * verticalSpacing,
                    brushed: false,
                    size: wordSize,
                    opacity: 1,
                    color: wordColor,
                    width: wordWidth,
                };
                this.wordsData.push(word);
                cumulativeWidth += wordWidth + horizontalSpacing;
            }
        }
    }


    renderText() {
          // Debugging checks
    if (!this.canvas) {
        this.canvas = document.getElementById('worduppCanvas');
        console.log('Re-initialized canvas');
    }
    if (!this.ctx && this.canvas) {
        this.ctx = this.canvas.getContext('2d');
        console.log('Re-initialized context');
    }
        // Clearing the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const bgSize = this.canvasState.settings.bgSize / 100;
        const bgPosX = this.canvasState.settings.bgPosX;
        const bgPosY = this.canvasState.settings.bgPosY;

        // Drawing the background image or color
        if (this.backgroundImg) {
            const width = this.backgroundImg.width * bgSize;
            const height = this.backgroundImg.height * bgSize;
            this.ctx.drawImage(this.backgroundImg, bgPosX - width / 2, bgPosY - height / 2, width, height);
        } else {
            this.ctx.fillStyle = document.getElementById('bgColor').value;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.renderBackground(); // Assuming you have this method in the class

        // Drawing each word on the canvas
        this.wordsData.forEach(word => {
            this.ctx.fillStyle = word.color; // Using the color of each word
            this.ctx.globalAlpha = word.opacity; // Setting the opacity of each word
            this.ctx.font = word.size + 'px ' + document.getElementById('fontSelector').value; // Using the size of each word
            this.ctx.fillText(word.text, word.x, word.y);
        });

        // Resetting the global alpha to default (1) after drawing all words
        this.ctx.globalAlpha = 1;
    }



    /**
     * Adds event listeners to one or multiple elements.
     * 
     * @param {string | Array<string>} elementIds - Element ID or an array of element IDs.
     * @param {string} eventType - Type of the event to listen to.
     * @param {Function} callback - Callback function to be executed when the event is triggered.
     */

    addEventListeners(elementIds, eventType, callback) {
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

    /**
     * Initializes event listeners for the canvas.
     */

    initializeEventListeners() {

        // brushes
        this.isBrushing = false;
        // const brushModeElement = document.getElementById("brushMode");
        if (this.brushModeElement) {
            this.brushModeElement.addEventListener("change", () => this.handleBrushPaneChanges());
        }


        if (this.canvas) {

            // Event listeners to manage brush state (isBrushing) when mouse button is pressed or released
            this.canvas.addEventListener('mousedown', () => {
                this.isBrushing = true;
            });

            this.canvas.addEventListener('mouseup', () => {
                this.isBrushing = false;
            });

            // Event listener to handle brush effects when the mouse is moved over the canvas
            this.canvas.addEventListener('mousemove', (event) => this.handleBrushing(event));


        }
 
        this.addEventListeners('backgroundImg', 'change', this.BGimg);
        this.addEventListeners('canvasWidth', 'input', this.canvasWidth);
        this.addEventListeners('canvasHeight', 'input', this.canvasHeight);
        this.addEventListeners('removeBackground', 'click', this.removeBanckground);
        this.addEventListeners('canvasPresets', 'change', this.canvasPresetFunction);
        this.addEventListeners('randomOrder', 'change', this.resetButtonAction);
        this.addEventListeners('textSize', 'change', this.updateWordSize);
        this.addEventListeners('textColor', 'input', this.updateWordColor);
        this.addEventListeners('resetButton', 'click', this.resetCanvas);
        
    
        // Shared IDs that are in both lists
        const sharedIds = ['vLines', 'hLines', 'vSpacing', 'hSpacing', 'userText'];

        // Other IDs specific to each list
        const idsForChangeEvent = [
            'canvasPresets', 'fontSelector', 'backgroundImg', 
            'primaryColor', 'secondaryColor', 'bgPresets', 'brushMode'
        ];


        const idsForInputEventWithoutReinitialize = [
              'bgSize', 'bgPosX', 'bgPosY', 'bgColor', 'brushSize', 
              'minSize', 'maxSize', 'brushColor'
        ];


        this.initializeSliders()
        this.addEventListeners(idsForChangeEvent, 'change', this.updateAndRender.bind(this, false));
        this.addEventListeners(idsForInputEventWithoutReinitialize, 'input', this.updateAndRender.bind(this, false));
        this.addEventListeners(sharedIds, 'input', this.updateAndRender.bind(this, true));
        this.addEventListeners(sharedIds, 'change', this.updateAndRender.bind(this, true));
    }
 


    handleBrushing(event) {
        if (!this.isBrushing) return;

        // Adjusting mouse event coordinates for potential canvas scaling
        const scale = this.canvas.offsetWidth / this.canvas.width;
        const x = event.offsetX / scale;
        const y = event.offsetY / scale;

        // Getting brush settings from the UI controls
        const brushMode = this.brushModeElement.value;
        const brushSize = parseInt(document.getElementById('brushSize').value);
        const brushColor = document.getElementById('brushColor').value;
        const brushMin = document.getElementById('minSize').value;
        const brushMax = document.getElementById('maxSize').value;

        // Check if the mouse is over any of the words on the canvas
        for (let word of this.wordsData) {
            const wordTop = word.y - word.size;
            const wordBottom = word.y;
            const wordLeft = word.x;
            const wordRight = word.x + word.width;

            // If the mouse is over a word, apply the selected brush effect
            if (x >= wordLeft && x <= wordRight && y >= wordTop && y <= wordBottom) {
                switch (brushMode) {
                    case 'delete':
                        console.log("Applying delete brush effect.");
                        word.opacity = 0;
                        break;
                    case 'changeSize':
                        console.log("Applying change size brush effect.");
                        word.size += brushSize;
                        break;
                    case 'changeColor':
                        console.log("Applying change color brush effect.");
                        if (word.opacity !== 0 && !word.brushed) { // Only change color if word isn't "deleted"
                            word.color = brushColor;
                            word.brushed = true;
                        }
                        break;
                    case 'randomizeSize':
                        console.log("Applying randomize size brush effect.");
                        word.size = (Math.random() * brushMax) + brushMin;
                        break;
                }
                // Redraw the canvas after applying the brush effect
                this.renderText();
            }
        }
    }


    resetCanvas() {
        // Reset canvasState to default values
        this.canvasState.words = document.getElementById("userText").value = document.getElementById("userText").defaultValue;

        // Reset UI controls to their default values
        const controls = [
            "userText", "canvasWidth", "canvasHeight", "canvasPresets", 
            "fontSelector", "textSize", "textColor", "randomOrder",
            "bgColor", "backgroundImg", "bgSize", "bgPosX", "bgPosY", 
            "primaryColor", "secondaryColor", "bgPresets",
            "vLines", "hLines", "hSpacing", "vSpacing",
            "brushMode", "brushSize", "brushColor", "minSize", "maxSize"
        ];

        for (let control of controls) {
            const element = document.getElementById(control);
            if (element.type === "checkbox") {
                element.checked = element.defaultChecked;
            } else {
                element.value = element.defaultValue;
            }
        }
      
      this.removeBanckground()

        // Reinitialize words and render them
        this.updateAndRender(true);
    }




     /**
     * Initializes the sliders based on the provided mappings.
     */


    initializeSliders() {
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
            this.updateSliderValueDisplay(sliderId, displayId) ;
        });
    }

    /**
     * Updates the display value of the slider.
     * @param {string} sliderId - The id of the slider element.
     * @param {string} displayId - The id of the display element.
     */


    updateSliderValueDisplay(sliderId, displayId) {
        const slider = document.getElementById(sliderId);
        const display = document.getElementById(displayId);
        if (slider && display) {
            display.textContent = slider.value;
            slider.addEventListener('input', function() {
                display.textContent = this.value;
                this.updateAndRender();  // Assuming 'updateAndRender' is a class method
            }.bind(this));
        }
    }

    updateWordSize( ) {
        this.wordsData.forEach(wordObj => {
        wordObj.size = parseFloat(document.getElementById('textSize').value);
        // wordObj.color = document.getElementById('textColor').value;
         this.renderText();
    });  
    }


    updateWordColor() {
        this.wordsData.forEach(wordObj => {
        wordObj.color = document.getElementById('textColor').value;
        this.renderText();
    });
    }

    renderBackground() {
        const bgPreset = this.canvasState.settings.bgPreset;
        const primaryColor = this.canvasState.settings.color1;
        const secondaryColor = this.canvasState.settings.color2;

        switch (bgPreset) {
            case "linear-gradient":
                const linearGradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
                linearGradient.addColorStop(0, primaryColor);
                linearGradient.addColorStop(1, secondaryColor);
                this.ctx.fillStyle = linearGradient;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                break;

            case "radial-gradient":
                const radialGradient = this.ctx.createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, 50, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2);
                radialGradient.addColorStop(0, primaryColor);
                radialGradient.addColorStop(1, secondaryColor);
                this.ctx.fillStyle = radialGradient;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                break;

            case "geometric-patterns":
                const squareSize = 50;
                for (let x = 0; x < this.canvas.width; x += squareSize) {
                    for (let y = 0; y < this.canvas.height; y += squareSize) {
                        this.ctx.fillStyle = (x + y) % (2 * squareSize) === 0 ? primaryColor : secondaryColor;
                        this.ctx.fillRect(x, y, squareSize, squareSize);
                    }
                }
                break;

            case "wave-patterns":
                for (let y = 0; y < this.canvas.height; y += 50) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, y);
                    for (let x = 0; x < this.canvas.width; x += 50) {
                        this.ctx.lineTo(x, y + 25 * Math.sin(x / 50));
                    }
                    this.ctx.strokeStyle = y % 100 === 0 ? primaryColor : secondaryColor;
                    this.ctx.stroke();
                }
                break;

            case "organic-blobs":
                for (let i = 0; i < 10; i++) {
                    this.ctx.beginPath();
                    const x = Math.random() * this.canvas.width;
                    const y = Math.random() * this.canvas.height;
                    const radius = 50 + Math.random() * 50;
                    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                    this.ctx.fillStyle = i % 2 === 0 ? primaryColor : secondaryColor;
                    this.ctx.fill();
                }
                break;

            case "stripes":
                const stripeWidth = 50;
                for (let x = 0; x < this.canvas.width; x += stripeWidth) {
                    this.ctx.fillStyle = (x / stripeWidth) % 2 === 0 ? primaryColor : secondaryColor;
                    this.ctx.fillRect(x, 0, stripeWidth, this.canvas.height);
                }
                break;

            default:
                // handle the default case or throw an error
                break;
        }
    }

    BGimg(event) {
        const file = event.target.files[0];
        if (!file) {
            this.showToast('Please select a file before proceeding.');
            return;
        }

        // Check for file type
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(file.type)) {
            this.showToast('Please select a valid image format (JPEG, PNG, GIF).');
            return;
        }

        // Check for file size (5MB limit as an example)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            this.showToast('The selected image is too large. Please select an image smaller than 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.backgroundImg = new Image();
            this.backgroundImg.onload = this.renderText.bind(this);;
            this.backgroundImg.onerror = () => {
                this.showToast('There was an error loading the image. Please try a different one.');
            };
            this.backgroundImg.src = e.target.result;
        };
        reader.onerror = () => {
            this.showToast('There was an error reading the file. Please try again.');
        };
        reader.readAsDataURL(file);
    }

    canvasHeight() {
        this.canvas.height = event.target.value;
        document.getElementById('canvasPresets').value = "";
        this.updateAndRender(true); // This call is sufficient
    }

    canvasWidth() {
        document.getElementById('canvasPresets').value = "";
        this.canvas.width = event.target.value;
        this.updateAndRender(true); // This call is sufficient
    }

    removeBanckground() {
        this.backgroundImg = null;
        document.getElementById('backgroundImg').value = "";
        this.renderText();
    }

    resetButtonAction() {
        // Update the canvas state
        this.collectCanvasState();

        // Decide which word set to use based on the checkbox
        const wordsToUse = this.checked ? this.canvasState.shuffledWords : this.canvasState.originalWords;

        // Reinitialize the words data
        this.initializeWordsData(wordsToUse);

        // Render the canvas
        this.renderText();
    }

    canvasPresetFunction() {
          // this.collectCanvasState()
        const [width, height] = document.getElementById("canvasPresets").value.split('x');
        this.canvas.width = width ;
        this.canvas.height =height ;
        document.getElementById('canvasWidth').value = parseInt(width, 10)
        document.getElementById('canvasHeight').value = parseInt(height, 10)
        this.collectCanvasState();
        this.initializeWordsData(this.canvasState.words);
        this.renderText();
    }


}

// let wordCanvas;


// document.addEventListener('DOMContentLoaded', function() {
//     let savedState = document.body.getAttribute('data-saved-state');
//     console.log("State before parsing:", savedState);
//     savedState ="{{ saved_state|safe }}"
//     if (savedState && savedState !== 'None' && savedState.trim() !== '') {
//         // Now parse the JSON safely
//         const parsedState = JSON.parse(savedState);
//         console.log("Parsed state:", parsedState);
//         // ... rest of the code
//     } else {
//         console.log("No saved state available.");
//     }
// });




document.addEventListener('DOMContentLoaded', function() {
    // const savedState = document.body.getAttribute('data-saved-state');

    // const savedState = "{{ saved_state|safe }}";
    // console.log("State before parsing:", savedState);
    // console.log(JSON.parse(savedState ))
    // if (savedState) {
    //     // Initialize your WordCanvas with the saved state
    //    myCanvas = new WordCanvas(savedState);
    //   } else {
    //     // Initialize it without a state, if none is saved
    //       myCanvas = new WordCanvas();
    //   }
    // // wordCanvas.initializeSliders()


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


    document.getElementById('saveButton').addEventListener('click', saveCanvasState);

});



function updateSliderValueDisplay(sliderId, displayId) {
const slider = document.getElementById(sliderId);
const display = document.getElementById(displayId);
if (slider && display) {
    display.textContent = slider.value;
    slider.addEventListener('input', function() {
        display.textContent = this.value;
        updateAndRender();
    });
}
}


// Set up event listeners for all sliders

 
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
            this.classList.add('active');
        });
    });


// Function to save canvas state
async function saveCanvasState() {
    let state = JSON.stringify(wordCanvas.canvasState);  // Serialize the canvas state
    let csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    let title = document.getElementById("canvasTitle").value;  // Get the title from an input field
    console.log(title);  // Now this should work!
 

    const response = await fetch("/save_canvas_state/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken
        },
        body: `state=${encodeURIComponent(state)}&title=${encodeURIComponent(title)}`  // Include title in the body

    });
    const data = await response.json();
    if (data.status === 'success') {
        alert("Canvas state saved!");
    } else {
        alert("Oops! Something went wrong.");
    }
}

// Function to load canvas state
async function loadCanvasState() {
    const response = await fetch("/load_canvas_state/");
    const data = await response.json();
    if (data.state) {
        let loadedState = JSON.parse(data.state);  // Deserialize the canvas state
        wordCanvas.canvasState = loadedState;  // Load it into your WordCanvas instance
        // You may also want to redraw the canvas here
    }
}