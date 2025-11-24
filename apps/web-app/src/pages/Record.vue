<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Mic, Square, UploadCloud, PlayCircle } from 'lucide-vue-next'
import { uploadAudio } from '../utils/UploadAudio'

// State
const isRecording = ref(false)
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioChunks = ref<Blob[]>([])
const audioURL = ref<string | null>(null)
const mediaStream = ref<MediaStream | null>(null)
const isUploading = ref(false)
const isSearching = ref(false)
const songTitleQuery = ref('')
const artistQuery = ref('')

const router = useRouter()

// 1. Start Recording
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaStream.value = stream
    isRecording.value = true
    audioChunks.value = []
    audioURL.value = null

    mediaRecorder.value = new MediaRecorder(stream, {
      mimeType: 'audio/webm',
    })

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = () => {
      handleRecordingStop()
    }

    mediaRecorder.value.start()
  } catch (err) {
    console.error('Error accessing microphone:', err)
    alert('Could not access the microphone. Please check permissions.')
    isRecording.value = false
  }
}

// 2. Stop Recording
const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop()
    isRecording.value = false
    mediaStream.value?.getTracks().forEach((track) => track.stop())
  }
}

// 3. Process Audio & Upload
const handleRecordingStop = async () => {
  const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
  audioURL.value = URL.createObjectURL(audioBlob)
  const data = {}
  
  if (isSearching.value && artistQuery.value.trim() && songTitleQuery.value.trim()) {
    data['artist'] = artistQuery.value.trim()
    data['songTitle'] = songTitleQuery.value.trim()
  }

  // Simulating upload state for UI feedback
  isUploading.value = true
  try {
    await uploadAudio(audioBlob, router, data)
  } finally {
    isUploading.value = false
  }
}

const toggleSearch = () => {
    // Only allow searching if not recording or uploading
    if (!isRecording.value && !isUploading.value) {
        isSearching.value = !isSearching.value
        artistQuery.value = ''
        songTitleQuery.value = '' // Clear query when toggling
    }
}

// Cleanup
onBeforeUnmount(() => {
  if (audioURL.value) {
    URL.revokeObjectURL(audioURL.value)
  }
})
</script>

<template>
  <div class="vocal-report-container">
    <div class="content-wrapper">
      <header>
        <h1>Vocal Recorder</h1>
        <p class="subtitle">
          Capture your voice to generate your personalized analysis.
        </p>
      </header>

      <div class="card recorder-card">
        <div v-if="!isRecording && !isUploading" class="state-container">
          <div class="icon-circle">
            <Mic :size="40" />
          </div>
          <p class="instruction-text">Ready to analyze your tone?</p>
          <button @click="startRecording" class="btn btn-primary">
            Start Recording
          </button>
        </div>

        <div v-if="isRecording && !isUploading" class="state-container">
          <div class="waveform-container">
            <div
              class="bar"
              v-for="n in 6"
              :key="n"
              :style="{ animationDelay: `${Math.random() * 0.5}s` }"
            ></div>
          </div>
          <p class="recording-text">Listening...</p>
          <button @click="stopRecording" class="btn btn-danger">
            <Square :size="18" /> Stop Recording
          </button>
        </div>

        <div v-if="audioURL && !isRecording" class="state-container">
          <div v-if="isUploading" class="upload-status">
            <UploadCloud class="animate-bounce" :size="24" />
            <span>Processing Analysis...</span>
          </div>
        </div>

        <div v-if="isSearching" class="state-container search-container">
          <Search :size="30" class="search-icon" />
          <div class="search-input-group">
            <input
              v-model="artistQuery"
              type="text"
              placeholder="Artist Name..."
              class="search-input"
            />
            
            <input
              v-model="songTitleQuery"
              type="text"
              placeholder="Song Title..."
              class="search-input"
            />
          </div>
          <button @click="toggleSearch" class="btn btn-link">
            Go back to recording
          </button>
        </div>
        
                <div
          v-if="!isRecording && !isUploading && !isSearching"
          class="analyze-song-link"
        >
          <span @click="toggleSearch" class="clickable-text instruction-text">
            Analyze with a song
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- THEME VARIABLES (Inherited from reference) --- */
.vocal-report-container {
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
  background-color: var(--bg-dark);
  color: var(--text-primary);
  min-height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content-wrapper {
  width: 100%;
  max-width: 600px; /* Narrower for a recorder focus */
  margin: 0 auto;
}

/* --- HEADER --- */
header {
  margin-bottom: 3rem;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* --- CARD STYLING --- */
.card {
  background-color: var(--card-bg);
  border-radius: 16px;
  padding: 3rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  position: relative;
  overflow: hidden;
  text-align: center;
  box-shadow:
    0 2.8px 2.2px rgba(0, 0, 0, 0.1),
    0 6.7px 5.3px rgba(0, 0, 0, 0.15),
    0 12.5px 10px rgba(0, 0, 0, 0.2);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 3px rgba(0, 0, 0, 0.15),
    0 8px 7px rgba(0, 0, 0, 0.2),
    0 15px 15px rgba(0, 0, 0, 0.25);
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --- ICONS & DECORATION --- */
.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.1); /* Transparent accent */
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  margin-bottom: 1rem;
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.1);
}

.instruction-text {
  font-size: 1.2rem;
  color: var(--text-primary);
  font-weight: 500;
}

.recording-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: pulse-text 2s infinite;
}

@keyframes pulse-text {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* --- BUTTONS --- */
.btn {
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.5px;
}

.btn-primary {
  background: var(--accent-gradient);
  color: white;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  border: 1px solid var(--danger);
}

.btn-danger:hover {
  background: var(--danger);
  color: white;
}

/* --- WAVEFORM ANIMATION (Reused from Ref) --- */
.waveform-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 50px;
}

.bar {
  width: 6px;
  background: var(--accent-color);
  border-radius: 3px;
  animation: wave 1s infinite ease-in-out;
  opacity: 0.8;
}

@keyframes wave {
  0%,
  100% {
    height: 10px;
  }
  50% {
    height: 40px;
  }
}

/* --- AUDIO PLAYER SECTION --- */
.audio-player-container {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 1rem;
}

.metric-icon {
  color: var(--accent-color);
  width: 18px;
  height: 18px;
}

.metric-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  font-weight: 600;
}

audio {
  width: 100%;
  height: 40px;
  filter: invert(1) hue-rotate(180deg); /* Simple trick to make default players look decent on dark backgrounds */
  opacity: 0.9;
}

.upload-status {
  margin-top: 1.5rem;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.animate-bounce {
  animation: bounce 1s infinite;
  color: var(--accent-color);
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(-15%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

/* Song Search Link */
.analyze-song-link {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.clickable-text {
  color: var(--accent-color);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: opacity 0.2s;
}

.clickable-text:hover {
  opacity: 0.8;
}

/* NEW: Search Bar Styles */
.search-container {
  /* Ensure the search bar is full width and looks good */
  gap: 1rem;
}

.search-icon {
  color: var(--text-secondary);
}

.search-input-group {
    display: flex;
    width: 100%; /* Take full width of the container */
    gap: 10px; /* Space between the two inputs */
}

/* Updated search-input style to use flexible sizing */
.search-input {
    /* Use flex-grow to ensure inputs take equal space in the group */
    flex: 1; 
    width: auto; /* Override previous 100% width when inside the group */
    padding: 0.8rem 1rem;
    border-radius: 8px;
    border: 1px solid var(--text-secondary);
    background-color: var(--bg-dark);
    color: var(--text-primary);
    font-size: 1rem;
    transition: border-color 0.3s;
}

/* Media Query: Stack inputs vertically on small screens */
@media (max-width: 480px) {
    .search-input-group {
        flex-direction: column;
        gap: 15px; /* Increase gap for stacked inputs */
    }
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.btn-link {
    background: none;
    color: var(--text-secondary);
    padding: 0.5rem;
    font-weight: 400;
}

.btn-link:hover {
    color: var(--text-primary);
}
</style>
