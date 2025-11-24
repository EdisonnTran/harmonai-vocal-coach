<script setup lang="ts">
import { computed, onMounted } from 'vue'
import {
  Activity,
  Mic2,
  AlertCircle,
  CheckCircle2,
  Music2,
  Wind,
  Weight,
  ArrowLeft,
  CalendarDays,
} from 'lucide-vue-next'
import capitalizeWord from '../utils/CapitalizeWord'
import { useRouter } from 'vue-router'

interface ToneAnalysis {
  timbre: string
  texture: string
  vocalWeight: string
}

interface ImprovementTip {
  issueName: string
  fix: string
}

interface Exercise {
  exerciseName: string
  description: string
}

interface TimelineItem {
  date: string
  task: string
}

interface AnalysisResult {
  vocalToneAnalysis: ToneAnalysis
  improvementTips: ImprovementTip[]
  suggestedExercises: Exercise[]
  timeline?: TimelineItem[]
}

interface SongComparisonItem {
  issue: string
  exercise: string
}

interface SongComparisonResult {
  toneArea: SongComparisonItem
  rhythmArea: SongComparisonItem
  highNotesArea: SongComparisonItem
  vibeArea: SongComparisonItem
}

const rawState = history.state || {}
const data = computed(
  () => rawState.results as AnalysisResult | SongComparisonResult | undefined
)
const audioURL = computed(() => rawState.url as string | undefined)
const router = useRouter()

onMounted(() => {
  if (!data.value || !audioURL.value) {
    console.warn('No analysis data found. Redirecting to recorder...')
    router.replace('/')
  }
})

const toneCards = computed(() => {
  if ('vocalToneAnalysis' in data.value) {
    return [
      {
        label: 'Timbre',
        value: data.value?.vocalToneAnalysis?.timbre || '',
        desc: 'Your unique tone color',
        icon: Mic2,
        colorClass: 'text-green-600',
      },
      {
        label: 'Texture',
        value: data.value?.vocalToneAnalysis?.texture || '',
        desc: 'Surface quality of sound',
        icon: Wind,
        colorClass: 'text-green-500',
      },
      {
        label: 'Vocal Weight',
        value: data.value?.vocalToneAnalysis?.vocalWeight || '',
        desc: 'Perceived heaviness',
        icon: Weight,
        colorClass: 'text-green-400',
      },
    ]
  }
  return []
})

const handleBack = () => {
  if (history.length > 1) {
    history.back()
  } else {
    console.log('No history to go back to - implement fallback routing here')
  }
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
        <div class="waveform-container">
          <div
            class="bar"
            v-for="n in 6"
            :key="n"
            :style="{ animationDelay: `${Math.random() * 0.5}s` }"
          ></div>
        </div>
        <h1>
          {{
            'toneArea' in data
              ? 'Song Comparison Analysis Report'
              : 'Vocal Analysis Report'
          }}
        </h1>
        <p class="subtitle">
          {{
            'toneArea' in data
              ? "Here is a breakdown of how your vocal profile stacks up against the song you're trying to replicate"
              : 'Here is a detailed breakdown of your unique vocal profile and personalized recommendations.'
          }}
        </p>
      </header>

      <section class="profile-section" v-if="toneCards">
        <div v-if="audioURL" class="audio-player-container">
          <p class="audio-label">Your Recording:</p>
          <audio :src="audioURL" controls></audio>
        </div>
        <div style="width: 100%; display: flex; justify-content: center">
          <button @click="router.push('/exercise')" class="exercise-button">
            Practice with our interactive game!
          </button>
        </div>
        <h2 class="section-title">
          <Activity class="section-icon" />
          {{
            'vocalToneAnalysis' in data
              ? 'Your Vocal Profile'
              : 'Improvement Advice'
          }}
        </h2>
        <div class="profile-grid" v-if="'vocalToneAnalysis' in data">
          <div v-for="(card, index) in toneCards" :key="index" class="card">
            <div class="card-header">
              <component :is="card.icon" class="metric-icon" />
              <div class="metric-label">{{ card.label }}</div>
            </div>

            <div v-if="card.value" class="metric-value">
              {{ capitalizeWord(card.value) }}
            </div>
            <div v-if="!card.value" class="metric-value">
              No {{ card.label }} data available!
            </div>

            <div class="metric-desc">{{ card.desc }}</div>

            <div class="status-indicator"></div>
          </div>
        </div>
      </section>

      <div
        class="recommendations-grid"
        v-if="'improvementTips' in data && 'suggestedExercises' in data"
      >
        <div class="rec-card">
          <h2 class="section-title warning-border">
            <AlertCircle class="section-icon warning-text" /> Areas for
            Improvement
          </h2>
          <div v-if="data.improvementTips">
            <div
              v-for="(tip, index) in data.improvementTips"
              :key="index"
              class="list-item"
            >
              <div class="icon-box warning-icon">
                <AlertCircle :size="20" />
              </div>
              <div class="item-content">
                <h4>{{ tip.issueName }}</h4>
                <p>{{ tip.fix }}</p>
              </div>
            </div>
          </div>
          <p v-if="!data.improvementTips">No improvement tips!</p>
        </div>

        <div class="rec-card">
          <h2 class="section-title success-border">
            <Music2 class="section-icon success-text" /> Recommended Exercises
          </h2>
          <div v-if="data.suggestedExercises">
            <div
              v-for="(exercise, index) in data.suggestedExercises"
              :key="index"
              class="list-item"
            >
              <div class="icon-box success-icon">
                <CheckCircle2 :size="20" />
              </div>
              <div class="item-content">
                <h4>{{ exercise.exerciseName }}</h4>
                <p>{{ exercise.description }}</p>
              </div>
            </div>
          </div>
          <p v-if="!data.suggestedExercises">No suggested exercises!</p>
        </div>
      </div>

      <section v-if="'timeline' in data" class="timeline-section">
        <h2 class="section-title">
          <CalendarDays class="section-icon" /> Your 7-Day Vocal Plan
        </h2>
        <div class="timeline-container">
          <div
            v-for="(item, index) in data.timeline"
            :key="index"
            class="timeline-item"
          >
            <div v-if="index === 0" class="timeline-marker icon-marker-wrapper">
              <Mic2 class="icon-marker" />
            </div>
            <div v-else class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-date">{{ item.date }}</div>
              <p class="timeline-task">{{ item.task }}</p>
            </div>
          </div>
        </div>
      </section>

      <div class="recommendations-grid" v-if="'toneArea' in data">
        <div class="rec-card">
          <h2 class="section-title warning-border">
            <AlertCircle class="section-icon warning-text" /> Areas for
            Improvement
          </h2>
          <div>
            <div class="list-item">
              <div class="icon-box warning-icon">
                <AlertCircle :size="20" />
              </div>
              <div class="item-content">
                <h4>Tone</h4>
                <p>{{ data.toneArea.issue }}</p>
              </div>
            </div>
            <div class="list-item">
              <div class="icon-box warning-icon">
                <AlertCircle :size="20" />
              </div>
              <div class="item-content">
                <h4>Rhythm</h4>
                <p>{{ data.rhythmArea.issue }}</p>
              </div>
            </div>
            <div class="list-item">
              <div class="icon-box warning-icon">
                <AlertCircle :size="20" />
              </div>
              <div class="item-content">
                <h4>High Note</h4>
                <p>{{ data.highNotesArea.issue }}</p>
              </div>
            </div>
            <div class="list-item">
              <div class="icon-box warning-icon">
                <AlertCircle :size="20" />
              </div>
              <div class="item-content">
                <h4>Vibe</h4>
                <p>{{ data.vibeArea.issue }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="rec-card">
          <h2 class="section-title success-border">
            <Music2 class="section-icon success-text" /> Recommended Exercises
          </h2>
          <div>
            <div>
              <div class="list-item">
                <div class="icon-box success-icon">
                  <CheckCircle2 :size="20" />
                </div>
                <div class="item-content">
                  <h4>Tone</h4>
                  <p>{{ data.toneArea.exercise }}</p>
                </div>
              </div>
              <div class="list-item">
                <div class="icon-box success-icon">
                  <CheckCircle2 :size="20" />
                </div>
                <div class="item-content">
                  <h4>Rhythm</h4>
                  <p>{{ data.rhythmArea.exercise }}</p>
                </div>
              </div>
              <div class="list-item">
                <div class="icon-box success-icon">
                  <CheckCircle2 :size="20" />
                </div>
                <div class="item-content">
                  <h4>High Note</h4>
                  <p>{{ data.highNotesArea.exercise }}</p>
                </div>
              </div>
              <div class="list-item">
                <div class="icon-box success-icon">
                  <CheckCircle2 :size="20" />
                </div>
                <div class="item-content">
                  <h4>Vibe</h4>
                  <p>{{ data.vibeArea.exercise }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- THEME VARIABLES --- */
.vocal-report-container {
  --bg-dark: #0f172a;
  --card-bg: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --accent-color: #8b5cf6;
  --accent-gradient: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
  --success: #10b981;
  --warning: #f59e0b;

  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
    sans-serif;
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

/* --- HEADER & ANIMATION --- */
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

.waveform-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 40px;
  margin-bottom: 2rem;
}

.bar {
  width: 4px;
  background: var(--accent-color);
  border-radius: 2px;
  animation: wave 1s infinite ease-in-out;
  opacity: 0.6;
}

@keyframes wave {
  0%,
  100% {
    height: 10px;
  }
  50% {
    height: 30px;
  }
}

/* --- CARDS & GRID --- */
.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  padding-left: 0.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  color: var(--accent-color);
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.card {
  background-color: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.5rem;
}

.metric-icon {
  color: var(--accent-color);
  width: 20px;
  height: 20px;
}

.metric-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  font-weight: 600;
}

.metric-value {
  font-size: 1.5rem; /* Adjusted for longer text like 'Medium-Light' */
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #fff;
  line-height: 1.2;
}

.metric-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.status-indicator {
  height: 3px;
  width: 30px;
  background: var(--success);
  border-radius: 2px;
  margin-top: 1rem;
  opacity: 0.5;
}

/* --- AUDIO PLAYER --- */
.audio-player-container {
  background-color: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 3rem;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.audio-player-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
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

/* --- RECOMMENDATIONS --- */
.recommendations-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
}

.rec-card {
  background-color: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
}

.warning-border {
  border-left: 4px solid var(--warning);
  padding-left: 1rem;
}
.success-border {
  border-left: 4px solid var(--success);
  padding-left: 1rem;
}
.warning-text {
  color: var(--warning);
}
.success-text {
  color: var(--success);
}

.list-item {
  display: flex;
  align-items: start;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.list-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
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

/* --- TIMELINE SECTION --- */
.timeline-section {
  margin-top: 3rem;
}

.timeline-container {
  position: relative;
  padding-left: 2rem; /* Space for the timeline line */
  border-left: 2px solid var(--card-bg);
  margin-left: 10px; /* Align with section titles */
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -2.7rem; /* Adjust to center on the line */
  top: 5px; /* Align with the date text */
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--accent-color);
  border: 3px solid var(--bg-dark);
}

.timeline-marker.icon-marker-wrapper {
  width: 24px;
  height: 24px;
  left: -2.95rem;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accent-color);
}

.icon-marker {
  color: var(--accent-color);
  width: 16px;
  height: 16px;
}

.icon-marker-wrapper .icon-marker {
  color: var(--bg-dark);
}

.timeline-item:first-child .icon-marker-wrapper {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(139, 92, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
  }
}

.timeline-date {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.timeline-task {
  background-color: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.exercise-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accent-color);
  color: var(--text-primary);
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.2s;
  margin-top: 1.5rem;
}

.exercise-button:hover {
  background-color: #6d28d9;
  transform: translateY(-2px);
}
</style>
