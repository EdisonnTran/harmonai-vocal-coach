export async function uploadAudio(audioBlob, router, data) {

let endpoint;
const formData = new FormData();
formData.append('audio', audioBlob, 'recording.webm')

if (data == {}) {
  endpoint = 'http://localhost:8080/analyze/audio'
} else {
  endpoint = 'http://localhost:8080/analyze/song-comparison'
  formData.append('artist', data["artist"])
  formData.append('songTitle', data["songTitle"])
}

  try {
    console.log('Starting upload...')

    // 3. Send the request using Fetch API
    const response = await fetch(endpoint, {
      method: 'POST',
      // **Crucial:** Do NOT manually set the 'Content-Type' header here.
      // The browser sets it automatically (as 'multipart/form-data')
      // when you use a FormData body, and it includes the necessary boundary.
      body: formData,
    })

    // Handle the response
    if (response.ok) {
      const result = await response.json()
      console.log('Upload successful!', result)

      // Navigate to the results page with the data
      router.push({
        name: 'Results',
        state: {
          results: result,
          url: URL.createObjectURL(audioBlob),
        },
      })
    } else {
      console.error('Upload failed with status:', response.status)
      alert('Upload failed.')
    }
  } catch (error) {
    console.error('Error during upload:', error)
    alert('Upload failed.')
  }
}
