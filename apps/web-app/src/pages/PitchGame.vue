<template>
  <div id="melody-matcher-game" class="vocal-game-container">
    <div class="game-container" :style="{ height: gameHeight + 'px'}">
      <div 
        class="bird" 
        :style="{ 
          top: birdY + 'px'
        }"
      >
        <img class="birdier" :src="bird_image"></img>
      </div>
      <div 
        v-for="(pipe, index) in pipes" 
        :key="index" 
        class="pipe-set"
        :style="{ left: pipe.x + 'px' }"
      >
        <div class="pipe-top" :style="{ height: pipe.gapY + 'px' }"> <img class="pipes_img" src="@/public/microphone_stand_flipped.png"></img></div>
        <div class="pipe-bottom" :style="{ 
            top: (pipe.gapY + pipe.gapSize) + 'px',
            height: (gameHeight - (pipe.gapY + pipe.gapSize)) + 1000 + 'px'
          }"> <img class="pipes_img" src="@/public/microphone_stand.png"></img></div>
      </div>
    </div>
    
    <div class="control-panel">
      <h3>Pitch Control Status</h3>
      <p>Status: {{ audioStatus }}</p>
      <p>Current Pitch: {{ currentPitch.toFixed(2) }} Hz</p>
      <p>Game Height: {{ birdY.toFixed(0) }} (Min/Max: {{ MIN_PITCH }}Hz / {{ MAX_PITCH }}Hz)</p>
      <button @click="isGameOver ? startGame() : stopGame()">
        {{ isGameOver ? 'Start Game' : 'Stop Game' }}
      </button>
    </div>
  </div>
</template>

<script>
import bird1 from "@/public/bird1.png";
// --- PHYSICS AND GAME CONSTANTS ---
const GAME_LOOP_INTERVAL = 1000 / 60; // 60 FPS
const GAME_HEIGHT = 480;
const BIRD_SIZE = 30;

// Pitch mapping constants (adjust based on user's comfortable vocal range)
const MIN_PITCH = 80;  // Roughly a low male voice
const MAX_PITCH = 400; // Roughly a high female/child voice

// --- PITCH DETECTION IMPLEMENTATION (External/Library Code) ---
// *NOTE*: For a real application, you would import a robust pitch detection library 
// (e.g., a YIN implementation) or use a helper class.
const PITCH_HELPER = {
    // These functions would contain the complex Web Audio API setup and Autocorrelation/YIN logic
    audioContext: null,
    analyser: null,
    mediaStreamSource: null,
    
    init: async function(onPitchDetected) {
        // 1. Get Microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // 2. Setup Audio Context and Nodes
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
        
        // Connect the source to the analyser (but not to the speakers)
        this.mediaStreamSource.connect(this.analyser);
        
        // 3. Start the pitch detection loop (e.g., using requestAnimationFrame)
        const buffer = new Float32Array(this.analyser.fftSize);
        const detectLoop = () => {
            this.analyser.getFloatTimeDomainData(buffer);
            // In a real app, this is where you run a pitch detection algorithm 
            // (like autocorrelation on the 'buffer' data) to find the frequency (Hz).
            
            // --- SIMPLIFIED MOCK PITCH DETECTION (Replace with real algorithm) ---
            let mockPitch = 0;
            const rms = Math.sqrt(buffer.reduce((sum, val) => sum + val * val, 0) / buffer.length);
            if (rms > 0.01) { // Only detect pitch if there's significant sound volume
                // Simple pitch simulation for demonstration: maps volume to a pitch range
                // A proper pitch algorithm (YIN, etc.) is required here.
                const clampedRms = Math.min(1, rms * 5); // Clamping/scaling for a better input feel
                mockPitch = MIN_PITCH + (MAX_PITCH - MIN_PITCH) * clampedRms;
            }
            // ----------------------------------------------------------------------
            
            onPitchDetected(mockPitch);
            
            this.rafId = requestAnimationFrame(detectLoop);
        };
        detectLoop();
        return 'Ready';
    },

    stop: function() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        if (this.mediaStreamSource) this.mediaStreamSource.disconnect();
        if (this.audioContext && this.audioContext.state !== 'closed') this.audioContext.close();
    }
};

export default {
  name: 'VoicePitchGame',
  data() {
    return {
      gameLoop: null,
      audioStatus: 'Awaiting permission...',
      currentPitch: 0,
      isGameOver: true,
      gameHeight: GAME_HEIGHT,
      bird_image: bird1,
      
      // Game State
      birdY: GAME_HEIGHT / 2,
      birdVelocity: 0, // Not needed for pitch control, but useful for visual smoothing
      rotationAngle: 0, // For the bird's visual tilt
      
      pipes: [],
      pipeSpeed: 2,
    };
  },
  
  mounted() {
    this.initAudio();
  },
  
  beforeUnmount() {
    this.stopGame();
    PITCH_HELPER.stop();
  },
  
  methods: {
    // --- AUDIO METHODS ---
    async initAudio() {
      try {
        this.audioStatus = await PITCH_HELPER.init(this.handlePitchUpdate);
      } catch (error) {
        this.audioStatus = 'Error: Permission denied or no mic found.';
        console.error("Audio initialization error:", error);
      }
    },
    
    // 1. **MAIN PITCH HANDLER**
    handlePitchUpdate(pitch) {
      this.currentPitch = pitch;
      if (!this.isGameOver && pitch > 0) {
        this.mapPitchToBirdPosition(pitch);
      }
    },
    
    // 2. **PITCH-TO-POSITION MAPPING**
    mapPitchToBirdPosition(pitch) {
      // 1. Clamp the pitch to the defined range (Min/Max)
      const clampedPitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, pitch));
      
      // 2. Normalize the pitch (convert range to 0.0 to 1.0)
      const normalized = (clampedPitch - MIN_PITCH) / (MAX_PITCH - MIN_PITCH);
      
      // 3. Map the normalized value to the game's Y position
      // Note: In Flappy Bird, 0 is the top, so a *higher* pitch should result in a *lower* Y value.
      const targetY = (1.0 - normalized) * (this.gameHeight - BIRD_SIZE);

      // Use a simple smoothing to make the movement less erratic (optional)
      const smoothingFactor = 0.1; 
      this.birdY += (targetY - this.birdY) * smoothingFactor;

      // Optional: Calculate rotation for visual effect
      const yDelta = targetY - this.birdY;
      this.rotationAngle = Math.max(-20, Math.min(20, yDelta * -1.5));
    },

    // --- GAME METHODS ---
    startGame() {
      this.isGameOver = false;
      this.birdY = this.gameHeight / 2;
      this.pipes = [];
      this.pipeTimer = 0;
      this.gameLoop = setInterval(this.updateGame, GAME_LOOP_INTERVAL);
    },

    stopGame() {
      this.isGameOver = true;
      if (this.gameLoop) clearInterval(this.gameLoop);
    },

    updateGame() {
      // 1. Move Pipes
      this.pipes.forEach(pipe => {
        pipe.x -= this.pipeSpeed;
      });
      
      // 2. Remove pipes that have moved off-screen
      this.pipes = this.pipes.filter(pipe => pipe.x > -60);
      
      // 3. Generate new pipes
      this.pipeTimer++;
      if (this.pipeTimer % 150 === 0) { // Generate a new pipe every ~2.5 seconds (150 frames @ 60 FPS)
        this.generatePipe();
      }
      
      // 4. Check Collision (Simplified Bounding Box Check)
      this.checkCollision();
    },

    generatePipe() {
      // Define pipe constants
      const PIPE_WIDTH = 50;
      const GAP_SIZE = 120; // The actual vertical space for the bird to fly through
      const VERTICAL_PADDING = 80; // Ensure the gap isn't too close to the top or bottom edge

      // Random position for the top of the gap (gapY)
      // This ensures the gap is placed within the VERTICAL_PADDING bounds
      const gapY = Math.random() * (this.gameHeight - GAP_SIZE - (2 * VERTICAL_PADDING)) + VERTICAL_PADDING;

      this.pipes.push({
        x: 300, // Starts off-screen to the right
        gapY: gapY,     // Y position where the gap *starts*
        gapSize: GAP_SIZE, // Vertical size of the gap
        width: PIPE_WIDTH,
      });
    },

    checkCollision() {
      const birdRect = {
        x: 50, // Fixed X position for the bird
        y: this.birdY,
        width: BIRD_SIZE,
        height: BIRD_SIZE,
      };

      // Check collision with the ground/ceiling
      if (birdRect.y < 0 || birdRect.y + birdRect.height > this.gameHeight) {
        this.stopGame();
        return;
      }
      
      // Check collision with pipes
      for (const pipe of this.pipes) {
        // Simple Pipe X-range check
        const pipeXMin = pipe.x;
        const pipeXMax = pipe.x + 50; // Assuming pipe width is 50px
        
        if (birdRect.x + birdRect.width - 10 > pipeXMin && birdRect.x < pipeXMax) {
          // Collision in the X direction is happening. Now check Y gap.
          const topPipeYMax = pipe.gapY;
          const bottomPipeYMin = pipe.gapY + pipe.gapSize;
          
          if (birdRect.y < topPipeYMax || birdRect.y + birdRect.height > bottomPipeYMin) {
            // Collision with either the top or bottom pipe section
            this.stopGame();
            return;
          }
        }
      }
    }
  }
};
</script>

<style scoped>
/* --- THEME VARIABLES (Inherited from reference) --- */
.vocal-game-container {
  --bg-dark: #0f172a;
  --card-bg: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --accent-color: #8b5cf6;
  --accent-gradient: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
  --danger: #ef4444;
  --success: #10b981;

  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
    sans-serif;
  
  /* Apply global background and text color to the component's root */
  background-color: var(--bg-dark);
  color: var(--text-primary);
  min-height: 100vh;
  padding: 2rem;
}

/* Match H2 style to the H1 gradient style */
h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
}

/* --- Game Container (Replaces .card) --- */
.game-container {
  position: relative;
  width: 500px;
  height: 480px;
  /* Apply dark card styling */
  /* background-color: var(--card-bg); */
  /* border: 1px solid rgba(255, 255, 255, 0.05); */
  /* border-radius: 16px; */
  overflow: hidden;
  margin: 20px auto;
  user-select: none;
  /* box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4); */
  /* Added padding inside for the game area, though note items will cover it */
}

/* Pitch Grid/Staff Lines */
.pitch-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Darken the staff background slightly for better contrast */
  background-color: rgba(255, 255, 255, 0.01); 
}

.staff-line {
  position: absolute;
  width: 100%;
  height: 1px;
  background-color: var(--text-secondary); /* Use secondary text color for lines */
  opacity: 0.3; /* Make them subtle */
}

/* --- User Pitch Cursor --- */
.user-cursor {
  position: absolute;
  left: 100px; 
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  font-size: 24px;
  color: var(--accent-color); /* Use accent color for the microphone icon */
  z-index: 10;
  text-shadow: 0 0 8px rgba(139, 92, 246, 0.5); /* Glow effect */
  transition: top 0.05s linear; 
}


/* --- Feedback & Controls --- */
.feedback-display {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--card-bg);
  padding: 8px 16px;
  border-radius: 50px; /* Pill shape */
  font-weight: 600;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.control-panel {
  text-align: center;
  margin-top: 2rem;
  /* Applying the .card style's padding/background here for the controls */
  background-color: var(--card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.control-panel p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

/* Apply button styles from the theme */
.control-panel button {
  /* .btn-primary styles */
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  background: var(--accent-gradient);
  color: white;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.control-panel button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
}

.game-container {
  position: relative;
  width: 880px;
  background-image: url('@/public/game_bg.jpg');
  background-size: contain;
  /* background-color: #70c5ce; */
  background-repeat: no-repeat;
  height: 100%;

  overflow: hidden;
  /* margin: 20px auto; */
  /* box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4); */

}

.bird {
  position: absolute;
  left: 50px;
  /* line-height: 30px; */
  /* text-align: center; */
  /* font-size: 24px; */
  transition: transform 0.05s linear; /* Smooth the rotation */
}

.birdier{
    width: 40%;
    height: auto;
}

.pipe-set {
  position: absolute;
  top: 0;
  width: 50px;
  height: 100%;
  background-color: transparent;
  /* display: flex; */
  flex-direction: column;
}

.pipe-top {
  position: absolute;
  top: 0;
  width: 100%;
  /* background-color: #74bf2e;
  border: 2px solid #5a8a25; */
}

.pipe-bottom {
  position: absolute;
  width: 100%;
  /* background-color: #74bf2e;
  border: 2px solid #5a8a25; */
}

.pipes_img {
  width:100%;
}
</style>