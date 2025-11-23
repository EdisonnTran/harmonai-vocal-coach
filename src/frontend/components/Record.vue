<template>
  <div class="recording-card">
    <div v-if="!isRecording" class="button-group">
      <button
        @click="startRecording"
        :disabled="isRecording"
        class="record-btn"
      >
        🎙️ Start Recording
      </button>
    </div>

    <div v-if="isRecording" class="recording-status">
      <div class="pulsing-dot"></div>
      <p>Recording...</p>
      <button @click="stopRecording" :disabled="!isRecording" class="stop-btn">
        🛑 Stop Recording
      </button>
    </div>

    <div v-if="audioURL" class="audio-player-container">
      <p class="audio-label">Your Recording:</p>
      <audio :src="audioURL" controls></audio>
    </div>
  </div>
</template>

<script>
import { uploadAudio } from '@/utils/UploadAudio'
export default {
  data() {
    return {
      isRecording: false,
      mediaRecorder: null,
      audioChunks: [],
      audioURL: null,
      mediaStream: null,
    }
  },
  methods: {
    // 1. Get Microphone Access and Start Recording
    async startRecording() {
      try {
        // Request access to the microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        this.mediaStream = stream
        this.isRecording = true
        this.audioChunks = [] // Clear previous recording data
        this.audioURL = null // Clear previous audio URL

        // Create the MediaRecorder instance
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm',
        })

        // Event handler for when data is available
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data)
          }
        }

        // Event handler for when recording stops
        this.mediaRecorder.onstop = () => {
          this.handleRecordingStop()
        }

        // Start recording
        this.mediaRecorder.start()
      } catch (err) {
        console.error('Error accessing the microphone:', err)
        alert('Could not access the microphone. Please check permissions.')
        this.isRecording = false
      }
    },

    // 2. Stop Recording
    stopRecording() {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop()
        this.isRecording = false

        // Stop the microphone track (important to release the mic)
        this.mediaStream.getTracks().forEach((track) => track.stop())
      }
    },

    // 3. Process the Recorded Audio
    async handleRecordingStop() {
      // Combine all recorded chunks into a single Blob
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })

      // Create a URL for the audio player
      this.audioURL = URL.createObjectURL(audioBlob)

      await uploadAudio(audioBlob, this.$router)
    },
  },
  // Clean up the URL when the component is destroyed
  beforeUnmount() {
    if (this.audioURL) {
      URL.revokeObjectURL(this.audioURL)
    }
  },
}
</script>

<style scoped>
.recording-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  margin-top: 2rem;
}

.button-group,
.recording-status {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 1.5rem;
}

button {
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.record-btn {
  background-color: #10b981; /* Primary Green */
  color: white;
  transform: scale(1.05);
}

.record-btn:hover {
  background-color: #059669; /* Darker Green */
  transform: scale(1.1);
}

.stop-btn {
  background-color: #ef4444; /* Red for Stop */
  color: white;
}

.stop-btn:hover {
  background-color: #dc2626; /* Darker Red */
}

.recording-status p {
  font-size: 1.2rem;
  font-weight: 500;
  color: #4b5563;
}

.pulsing-dot {
  height: 20px;
  width: 20px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.audio-player-container {
  margin-top: 2rem;
  text-align: left;
}

.audio-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

audio {
  width: 100%;
}
</style>
