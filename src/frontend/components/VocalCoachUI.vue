<script setup>
import Record from "@/frontend/components/Record.vue";
</script>

<script>
export default {
  name: 'VocalCoachUI',
  data() {
    return {
      // Represents the current state of the app
      // 'idle', 'recording', 'analyzing', 'results'
      appState: 'idle',
      analysis: null, // To store results from the backend
    };
  },
    showResults() {
      // Mock analysis data
      this.analysis = {
        vocalRange: {
          type: 'Baritone',
          low: 'G2',
          high: 'F4',
        },
        timbre: {
          brightness: 75, // out of 100
          richness: 60,
        },
        tone: ['Clear', 'Warm'],
        improvements: [
          { id: 1, title: 'Breathing Support', description: 'Practice diaphragmatic breathing to sustain notes longer.' },
          { id: 2, title: 'Pitch Accuracy', description: 'Use pitch training apps to improve your accuracy on scales.' },
        ],
      };
      this.appState = 'results';
    },
    resetApp() {
      this.appState = 'idle';
      this.analysis = null;
    }
};
</script>

<template>
  <div id="app-container">
    <header>
      <h1>Vocal Coach AI</h1>
      <p>Analyze your voice and discover your potential.</p>
    </header>

    <main>
      <Record />
    </main>
  </div>
</template>

<style scoped>
/* Add some modern styling */
#app-container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
}

header {
  margin-bottom: 40px;
}

h1 {
  color: #42b983;
}

.card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #36a473;
}

.recording-indicator .pulsing-dot {
  height: 20px;
  width: 20px;
  background-color: red;
  border-radius: 50%;
  margin: 20px auto;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 82, 82, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0); }
}

.results-container ul {
  list-style-type: none;
  padding: 0;
}

.results-container li {
  margin-bottom: 10px;
}
</style>