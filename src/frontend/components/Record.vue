<template>
  <div>
    <button
      @click="startRecording"
      :disabled="isRecording"
      class="record-btn"
    >
      🎙️ Start Recording
    </button>

    <button
      @click="stopRecording"
      :disabled="!isRecording"
      class="stop-btn"
    >
      🛑 Stop Recording
    </button>

    <audio v-if="audioURL" :src="audioURL" controls></audio>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isRecording: false,
      mediaRecorder: null,
      audioChunks: [],
      audioURL: null,
      mediaStream: null,
    };
  },
  methods: {
    // 1. Get Microphone Access and Start Recording
    async startRecording() {
      try {
        // Request access to the microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaStream = stream;
        this.isRecording = true;
        this.audioChunks = []; // Clear previous recording data
        this.audioURL = null; // Clear previous audio URL

        // Create the MediaRecorder instance
        this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        // Event handler for when data is available
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        // Event handler for when recording stops
        this.mediaRecorder.onstop = () => {
          this.handleRecordingStop();
        };

        // Start recording
        this.mediaRecorder.start();
      } catch (err) {
        console.error('Error accessing the microphone:', err);
        alert('Could not access the microphone. Please check permissions.');
        this.isRecording = false;
      }
    },

    // 2. Stop Recording
    stopRecording() {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
        this.isRecording = false;

        // Stop the microphone track (important to release the mic)
        this.mediaStream.getTracks().forEach(track => track.stop());
      }
    },

    // 3. Process the Recorded Audio
    handleRecordingStop() {
      // Combine all recorded chunks into a single Blob
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

      // Create a URL for the Blob that can be used as the <audio> source
      this.audioURL = URL.createObjectURL(audioBlob);

      // Optionally, emit the Blob to a parent component for saving/uploading
      this.$emit('audio-recorded', audioBlob);
    }
  },
  // Clean up the URL when the component is destroyed
  beforeUnmount() {
    if (this.audioURL) {
      URL.revokeObjectURL(this.audioURL);
    }
  }
};
</script>