const canvas_state_defaults = {
    originalWords: ["HEY"], // Initially empty
    settings: {
      canvasWidth: 800,
      canvasHeight: 400,
      font: "Arial",
      textSize: 20,
      textColor: "#000000",
      randomOrder: false,
      bgColor: "#fcecd0",
      bgSize: 100,
      bgPosX: 400,
      bgPosY: 200,
      color1: "#FF5733",
      color2: "#33D4FF",
      bgPreset: "none",
      vLines: 10,
      hLines: 4,
      hSpacing: 10,
      vSpacing: 20,
      brushMode: "delete",
      brushSize: 0,
      brushColor: "#000000",
      minSize: 10,
      maxSize: 30
    },
    brushedWords: []
  };

class WordUpp{
    constructor(wordCanvasInstance,savedState = null) {
        this.wordCanvasInstance = wordCanvasInstance;
        this.canvas = document.getElementById('worduppCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvasElement = document.getElementById('worduppCanvas'); // Add this line


        // Initialize canvas state and ensure settings
        this.canvasState = savedState ? { ...savedState } : { ...canvas_state_defaults };
        if (!this.canvasState.settings) {
            this.canvasState.settings = { ...canvas_state_defaults.settings };
        }

        // Apply the initial settings
        this.applySettings();
 
    }
  

    // Reset canvas to default settings
    resetSettings() {
        this.canvasState = { ...canvas_state_defaults };
        this.applySettings();
    }


    // Apply settings to canvas and controls
    applySettings() {
        if (this.canvasState.settings) {
            // Update each input field directly from this.canvasState
            const settingsMap = {
                canvasWidth: "canvasWidth",
                canvasHeight: "canvasHeight",
                font: "fontSelector",
                textSize: "textSize",
                textColor: "textColor",
                randomOrder: "randomOrder",
                bgColor: "bgColor",
                bgSize: "bgSize",
                bgPosX: "bgPosX",
                bgPosY: "bgPosY",
                color1: "primaryColor",
                color2: "secondaryColor",
                bgPreset: "bgPresets",
                vLines: "vLines",
                hLines: "hLines",
                hSpacing: "hSpacing",
                vSpacing: "vSpacing",
                brushMode: "brushMode",
                brushSize: "brushSize",
                brushColor: "brushColor",
                minSize: "minSize",
                maxSize: "maxSize"
            };

            // Loop through each setting and update its corresponding input field
            for (const [settingKey, elementId] of Object.entries(settingsMap)) {
                const element = document.getElementById(elementId);
                if (element) {
                    if (element.type === "checkbox") {
                        element.checked = this.canvasState.settings[settingKey];
                    } else {
                        element.value = this.canvasState.settings[settingKey];
                    }
                } else {
                    console.warn(`Element with ID ${elementId} not found.`);
                }
            }

            // Special case for originalWords
            if (Array.isArray(this.canvasState.originalWords)) {
                document.getElementById("userText").value = this.canvasState.originalWords.join(" ");
            } else {
                document.getElementById("userText").value = this.canvasState.originalWords || "";
            }
            // this.wordCanvasInstance.renderText()
            // If you need to re-render the canvas, you can do it here.
            // Example: this.renderCanvas();
        } else {
            console.error('this.canvasState.settings is undefined');
        }
    }


  
    // Method to save current state
    saveState() {
        const savedState = {
            canvasState: this.canvasState,
            wordsData: this.wordsData
          };
          // Now you can save this JSON object to your database.
          // In Django, you would send this object to your backend using an AJAX call.
        }
  
    // Method to load saved state
    loadState(savedState) {
        if (savedState && savedState.canvasState) {
            this.canvasState = savedState.canvasState;
            this.wordsData = savedState.wordsData;
        } else {
            this.canvasState = { ...canvas_state_defaults };
            console.warn('Loaded an incomplete state, resorting to defaults.');
        }
    
        // Just to make sure settings are never undefined
        if (!this.canvasState.settings) {
            this.canvasState.settings = { ...canvas_state_defaults.settings };
        }
    
        this.applySettings();
    }


 


    initializeWordsData(inputWords) {
        // Clear any existing data
        this.canvasState.brushedWords = [];
    
        // Get the settings from the canvas state
        const settings = this.canvasState.settings;
        const horizontalSpacing = settings.hSpacing;
        const verticalSpacing = settings.vSpacing;
        const verticalLines = settings.vLines;
        const horizontalLines = settings.hLines;
        const wordColor = settings.textColor;
        const wordSize = settings.textSize;
        const font = settings.font;
    
        // Calculate the starting Y position
        const startY = (this.canvasState.settings.canvasHeight - verticalSpacing * (verticalLines - 1)) / 2;
    
        // Decide which word set to use based on randomOrder setting
        const orderedWords = settings.randomOrder ? this.canvasState.shuffledWords : inputWords;
    
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
            let cumulativeWidth = (this.canvasState.settings.canvasWidth - lineWidth) / 2;
    
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
                this.canvasState.brushedWords.push(word);
                cumulativeWidth += wordWidth + horizontalSpacing;
            }
        }
    }
    









}  




  

class WordCanvas {
    constructor(wordUppInstance,initialSettings) {
        console.log("WordCanvas constructor initialSettings: ", initialSettings);
        this.wordUpp = wordUppInstance;
        this.canvasState = initialSettings || {};
        this.wordUpp = wordUppInstance;
        this.canvas = document.getElementById('worduppCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvasElement = document.getElementById('worduppCanvas'); // Add this line
        this.canvasState = initialSettings || {};

        console.log("Debugging: ", this.canvasState, this.canvasState.settings);
        this.canvas.width = this.canvasState.settings.canvasWidth;
        this.canvas.height = this.canvasState.settings.canvasHeight;
    }


    initCanvas() {
        console.log("Canvas state settings:", this.canvasState.settings);
        console.log("Canvas state settings:", this.canvas);
        this.canvas.width = this.canvasState.settings.canvasWidth;
        this.canvas.height = this.canvasState.settings.canvasHeight;




        
        // Do other initializations here...
        this.renderText();
        this.collectCanvasState();
        // this.renderText();
      }


    collectCanvasState() {
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
 
        this.canvasState.words = inputWords;
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

    renderText() {
        const canvasState = this.wordUpp.canvasState;
        const settings = canvasState.settings;
        
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

        const bgSize = settings.bgSize / 100;
        const bgPosX = settings.bgPosX;
        const bgPosY = settings.bgPosY;

        // Drawing the background image or color
        if (this.backgroundImg) {
            const width = this.backgroundImg.width * bgSize;
            const height = this.backgroundImg.height * bgSize;
            this.ctx.drawImage(this.backgroundImg, bgPosX - width / 2, bgPosY - height / 2, width, height);
        } else {
            this.ctx.fillStyle = settings.bgColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Assuming you have this method in the class
        this.renderBackground(); 

        // Drawing each word on the canvas
        this.wordUpp.canvasState.brushedWords.forEach(word => {
            this.ctx.fillStyle = word.color;
            this.ctx.globalAlpha = word.opacity;
            this.ctx.font = `${word.size}px ${settings.font}`;
            this.ctx.fillText(word.text, word.x, word.y);
        });

        // Resetting the global alpha to default (1) after drawing all words
        this.ctx.globalAlpha = 1;
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


          // Initialize event listeners
  initializeEventListeners() {
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

    this.addEventListeners('textColor', 'input', this.updateWordColor);
    const idsForInputEventWithoutReinitialize = [
        'bgSize', 'bgPosX', 'bgPosY', 'bgColor', 'brushSize', 
        'minSize', 'maxSize', 'brushColor'
  ];
  


//   this.addEventListeners(idsForChangeEvent, 'change', this.updateAndRender.bind(this, false));
    this.addEventListeners(idsForInputEventWithoutReinitialize, 'input', this.initCanvas);
  }


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

  updateWordColor() {
    this.wordsData.forEach(wordObj => {
        wordObj.color = document.getElementById('textColor').value;
        console.log("AAA BBB")
        this.wordCanvas.initCanvas();
        this.wordCanvas.collectCanvasState();
        this.renderText();
    });
}


}


class WordUppManager {
    constructor(savedState = null) {
        console.log("WordUppManager constructor start");

        // Initialize WordUpp first, so we can pass its canvasState to WordCanvas
        // this.wordUpp = new WordUpp(null, savedState); // Initialize app with canvas and saved state if any
        // console.log("wordUpp initialized: ", this.wordUpp);
        
        // // Now initialize WordCanvas, passing in the canvasState from WordUpp
        // this.wordCanvas = new WordCanvas(this.wordUpp.canvasState); // Initialize canvas with saved state if any
        // console.log("wordCanvas initialized: ", this.wordCanvas);
        


        this.wordUpp = new WordUpp(null, savedState); // Initialize app with saved state if any
console.log("canvasState after WordUpp initialization: ", this.wordUpp.canvasState);
this.wordCanvas = new WordCanvas(this.wordUpp, this.wordUpp.canvasState); // Now, WordUpp is already set up and canvasState should be populated.



        // Link the WordUpp instance to its canvas.
        this.wordUpp.wordCanvasInstance = this.wordCanvas;

        // Initialize event handlers, pass in the instances
        this.wordCanvas.initializeEventListeners(); // Initialize all event listeners here
        console.log("Before initCanvas call");
        this.wordCanvas.initCanvas();
        this.wordCanvas.collectCanvasState();
        this.wordCanvas.renderText();
        console.log("After initCanvas call");
    }
    resetToDefaultSettings() {
        this.wordUpp.resetSettings(); // Calls the resetSettings method of WordUpp to reset everything to defaults
    }
}
