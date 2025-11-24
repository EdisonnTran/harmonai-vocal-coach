<script setup lang="ts">
import { computed, onMounted } from 'vue'
import {
  Activity,
  Mic2,
  AlertCircle,
  Music2,
  ArrowLeft,
  GitCompareArrows,
  Waves,
  TrendingUp,
  Smile,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'

interface IssueExercisePair {
  issue: string
  exercise: string
}

interface SongComparisonResult {
  toneArea: IssueExercisePair
  rhythmArea: IssueExercisePair
  highNotesArea: IssueExercisePair
  vibeArea: IssueExercisePair
}

const rawState = history.state || {}
const data = computed(
  () => rawState.results as SongComparisonResult | undefined
)
const audioURL = computed(() => rawState.url as string | undefined)
const router = useRouter()

onMounted(() => {
  if (!data.value || !audioURL.value) {
    console.warn('No analysis data found. Redirecting to recorder...')
    router.replace('/')
  }
})

const comparisonCards = computed(() => {
  if (!data.value) return []
  return [
    {
      label: 'Tone',
      ...data.value.toneArea,
      icon: Mic2,
    },
    {
      label: 'Rhythm',
      ...data.value.rhythmArea,
      icon: Waves,
    },
    {
      label: 'High Notes',
      ...data.value.highNotesArea,
      icon: TrendingUp,
    },
    {
      label: 'Vibe',
      ...data.value.vibeArea,
      icon: Smile,
    },
  ]
})

const handleBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="vocal-report-container">
    <nav class="nav-bar">
      <a href="#" @click.prevent="handleBack" class="back-link">
        <ArrowLeft :size="20" style="margin-right: 8px" />
        Analyze Another
      </a>
    </nav>

    <div class="content-wrapper" v-if="data">
      <header>
        <h1>Song Comparison Report</h1>
        <p class="subtitle">
          Here's how your rendition compares and how you can improve.
        </p>
      </header>

      <section class="profile-section">
        <div v-if="audioURL" class="audio-player-container">
          <p class="audio-label">Your Recording:</p>
          <audio :src="audioURL" controls></audio>
        </div>
      </section>

      <div class="recommendations-grid">
        <div
          v-for="card in comparisonCards"
          :key="card.label"
          class="rec-card"
        >
          <h2 class="section-title">
            <component :is="card.icon" class="section-icon" />
            {{ card.label }}
          </h2>

          <!-- Issue -->
          <div class="list-item">
            <div class="icon-box warning-icon">
              <AlertCircle :size="20" />
            </div>
            <div class="item-content">
              <h4>Identified Issue</h4>
              <p>{{ card.issue }}</p>
            </div>
          </div>

          <!-- Exercise -->
          <div class="list-item">
            <div class="icon-box success-icon">
              <Music2 :size="20" />
            </div>
            <div class="item-content">
              <h4>Suggested Exercise</h4>
              <p>{{ card.exercise }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- THEME VARIABLES (largely inherited from ResultsPage.vue) --- */
.vocal-report-container {
  --bg-dark: #0f172a;
  --card-bg: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --accent-color: #8b5cf6;
  --accent-gradient: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
  --success: #10b981;
  --warning: #f59e0b;

  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
    Arial, sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-primary);
  min-height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

/* --- NAVIGATION --- */
.nav-bar {
  max-width: 1000px;
  margin: 0 auto 2rem auto;
}

.back-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: color 0.2s;
  font-size: 0.9rem;
  cursor: pointer;
}

.back-link:hover {
  color: #fff;
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

/* --- AUDIO PLAYER --- */
.audio-player-container {
  background-color: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 3rem;
}

.audio-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 1rem;
}

.audio-player-container audio {
  width: 100%;
}

/* --- RECOMMENDATIONS GRID --- */
.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

@media (max-width: 480px) {
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
}

.rec-card {
  background-color: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
}

.section-icon {
  color: var(--accent-color);
}

.list-item {
  display: flex;
  align-items: start;
  margin-bottom: 1.5rem;
}

.list-item:last-child {
  margin-bottom: 0;
}

.icon-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.warning-icon {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.success-icon {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.item-content h4 {
  font-size: 1.1rem;
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #fff;
}

.item-content p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}
</style>