const canvas_state_defaults = {
    originalWords: "", // Initially empty
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
    constructor(savedState = null) {
        // Initialize canvas state
        this.canvasState = savedState ? { ...savedState } : { ...canvas_state_defaults };
        // Ensure settings are never undefined
        this.ensureSettings();
        // Apply the initial settings
        this.applySettings();
    }
  

    // Ensure settings exist
    ensureSettings() {
        if (!this.canvasState.settings) {
        this.canvasState.settings = { ...canvas_state_defaults.settings };
        }
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
            document.getElementById("userText").value = this.canvasState.originalWords ? this.canvasState.originalWords.join(" ") : "";

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
  }
  




  




