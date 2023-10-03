 let isMouseDown = false
let startX = null;
let scrollLeft = null;
let touchOnSlider = false;
// let isBrushing = false;
let brushModeElement = document.getElementById("brushMode");
let draggableContainers = document.querySelectorAll('.pane-content');

class WordCanvas {
    constructor() {
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
   
 
        this.initializeEventListeners();
        // this.initializeDraggableContainers();
        // this.handleBrushPaneChanges();
        this.updateAndRender(true);
        // updateSubmenus();
          
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
        // this.initializeSliders();

        if (this.canvasState.wordsData) {
            this.wordsData = this.canvasState.wordsData;
        } else {
            const initialWords = this.canvasState.words;
            this.initializeWordsData(initialWords);
        }

        this.updateAndRender(true); // Reinitialize words


        
    }

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

    collectCanvasState() {
        // Define an array of settings and their types
        const settings = [
          { id: "userText", type: "string", key: "originalWords", split: " " },
          { id: "canvasWidth", type: "int" },
          { id: "canvasHeight", type: "int" },
          { id: "fontSelector", type: "string", key: "font" },
          { id: "textSize", type: "int" },
          { id: "textColor", type: "string" },
          { id: "randomOrder", type: "bool" },
          { id: "bgColor", type: "string" },
          { id: "bgSize", type: "int" },
          { id: "bgPosX", type: "int" },
          { id: "bgPosY", type: "int" },
          { id: "primaryColor", type: "string", key: "color1" },
          { id: "secondaryColor", type: "string", key: "color2" },
          { id: "bgPresets", type: "string", key: "bgPreset" },
          { id: "vLines", type: "int" },
          { id: "hLines", type: "int" },
          { id: "hSpacing", type: "int" },
          { id: "vSpacing", type: "int" },
          { id: "brushMode", type: "string" },
          { id: "brushSize", type: "float" },
          { id: "brushColor", type: "string" },
          { id: "minSize", type: "int" },
          { id: "maxSize", type: "int" }
        ];

        // Loop through the settings to update this.canvasState
        settings.forEach(setting => {
          let value = document.getElementById(setting.id).value;

          if (setting.type === "int") {
            value = parseInt(value, 10);
          } else if (setting.type === "float") {
            value = parseFloat(value);
          } else if (setting.type === "bool") {
            value = document.getElementById(setting.id).checked;
          } else if (setting.split) {
            value = value.split(setting.split);
          }

          const key = setting.key || setting.id;
          this.canvasState.settings[key] = value;
        });

        // Special cases
        this.canvasState.words = this.wordsData.map(wordObj => wordObj.text);
        this.canvasState.wordsData = this.wordsData;
        this.canvasState.shuffledWords = [...this.canvasState.settings.originalWords].sort(() => Math.random() - 0.5);
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
        const orderedWords = this.canvasState.settings.randomOrder ?       this.canvasState.shuffledWords : inputWords;

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
      
      
        // this.makeBG()
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
  
  
    initializeEventListeners() {

        // brushes
        this.isBrushing = false;

        if (this.canvas) {
            // Event listeners to manage brush state (isBrushing) when mouse button is pressed or released
            this.canvas.addEventListener('mousedown', () => { this.isBrushing = true; });

            this.canvas.addEventListener('mouseup', () => { this.isBrushing = false; });

            // Event listener to handle brush effects when the mouse is moved over the canvas
            this.canvas.addEventListener('mousemove', (event) => this.handleBrushing(event));
        }
 
        addEventListeners('backgroundImg', 'change', this.BGimg.bind(this));
        addEventListeners('canvasWidth', 'input', this.canvasWidth.bind(this));
        addEventListeners('canvasHeight', 'input', this.canvasHeight.bind(this));
        addEventListeners('removeBackground', 'click', this.removeBackground.bind(this));
        addEventListeners('canvasPresets', 'change', this.canvasPresetFunction.bind(this));
        addEventListeners('randomOrder', 'change', this.resetButtonAction.bind(this));
        addEventListeners('textSize', 'change', this.updateWordSize.bind(this));
        addEventListeners('textColor', 'input', this.updateWordColor.bind(this));
        addEventListeners('resetButton', 'click', this.resetCanvas.bind(this));
      
        
        addEventListeners('download-btn', 'click', this.downloadCanvas.bind(this));
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
        
        addEventListeners(idsForChangeEvent, 'change', this.updateAndRender.bind(this, false));
        addEventListeners(idsForInputEventWithoutReinitialize, 'input', this.updateAndRender.bind(this, false));
        addEventListeners(sharedIds, 'input', this.updateAndRender.bind(this, true));
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

        this.removeBackground()

        // Reinitialize words and render them
        this.updateAndRender(true);
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
  
    /*
    canvas size
    */
  
    canvasHeight(event) {
      this.canvas.height = event.target.value;
      document.getElementById('canvasPresets').value = "";
      this.updateAndRender(true); // This call is sufficient
    }

    canvasWidth(event) {
      document.getElementById('canvasPresets').value = "";
      this.canvas.width = event.target.value;
      this.updateAndRender(true); // This call is sufficient
    }
  
    canvasPresetFunction() {
      const [width, height] = document.getElementById("canvasPresets").value.split('x');
      this.canvas.width = width ;
      this.canvas.height = height ;
      document.getElementById('canvasWidth').value = parseInt(width, 10)
      document.getElementById('canvasHeight').value = parseInt(height, 10)
      this.collectCanvasState();
      this.initializeWordsData(this.canvasState.words);
      this.renderText();
    }
  
    /*
    text control
    */ 
  
    updateWordSize() {
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
  
    /*
    background controls
    */ 
  
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
      // console.log(event)
        const file = event.target.files[0];
        if (!file) {
            // showToast('Please select a file before proceeding.');
            return;
        }

        // Check for file type
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(file.type)) {
            // showToast('Please select a valid image format (JPEG, PNG, GIF).');
            return;
        }

        // Check for file size (5MB limit as an example)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
             // showToast('The selected image is too large. Please select an image smaller than 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.backgroundImg = new Image();
            this.backgroundImg.onload = this.renderText.bind(this);
           // this.backgroundImg.onLoad = this.makeBG() 

            this.backgroundImg.onerror = () => {
                 // showToast('There was an error loading the image. Please try a different one.');
            };
            this.backgroundImg.src = e.target.result;
        };
        reader.onerror = () => {
             // showToast('There was an error reading the file. Please try again.');
        };
        reader.readAsDataURL(file);
              // Debugging checks
      
      
      
          this.ctx.globalAlpha = 1;


    }
  

    removeBackground() {
      this.backgroundImg = null;
      document.getElementById('backgroundImg').value = "";
      this.renderText();
    }
    /*
    line control
    */ 
 
     /*
    brush tools
    */ 
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
                        // if (word.opacity !== 0 && !word.brushed) { // Only change color if word isn't "deleted"
                            word.color = brushColor;
                            word.brushed = true;
                            word.opacity = 1;
                        // }
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


    
  // download image
   downloadCanvas() {
        const link = document.createElement('a');
        link.download = 'wordupp_canvas.png';  // Specify the name of the downloaded image
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
}

