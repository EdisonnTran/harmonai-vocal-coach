<template>
  <div id="voice-pitch-game">
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
        <div class="pipe-top" :style="{ height: pipe.gapY + 'px' }"> <img href="@/frontend/images/microphone_stand_flipped.png"></img></div>
        <div class="pipe-bottom" :style="{ 
            top: (pipe.gapY + pipe.gapSize) + 'px',
            height: (gameHeight - (pipe.gapY + pipe.gapSize)) + 'px'
          }"> <img href="@/frontend/images/microphone_stand.png"></img></div>
      </div>
    </div>
    
    <div class="control-panel">
      <h3>Pitch Control Status</h3>
      <p>Status: **{{ audioStatus }}**</p>
      <p>Current Pitch: **{{ currentPitch.toFixed(2) }} Hz**</p>
      <p>Game Height: **{{ birdY.toFixed(0) }}** (Min/Max: {{ MIN_PITCH }}Hz / {{ MAX_PITCH }}Hz)</p>
      <button @click="isGameOver ? startGame() : stopGame()">
        {{ isGameOver ? 'Start Game' : 'Stop Game' }}
      </button>
    </div>
  </div>
</template>

<script>
import bird1 from "@/frontend/images/bird1.png";
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
        
        if (birdRect.x + birdRect.width > pipeXMin && birdRect.x < pipeXMax) {
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

.game-container {
  position: relative;
  width: 500px;
  /* background-image: url('@/frontend/images/game_bg.png'); */
  background-color: #70c5ce;
  border-bottom: 20px solid #d2b48c;
  height: 480px;
  overflow: hidden;
  margin: 20px auto;
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
  background-color: #74bf2e;
  border: 2px solid #5a8a25;
}

.pipe-bottom {
  position: absolute;
  width: 100%;
  background-color: #74bf2e;
  border: 2px solid #5a8a25;
}

.control-panel {
  text-align: center;
  margin-top: 20px;
}
</style>