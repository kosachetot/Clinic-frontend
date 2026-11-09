<script setup lang="ts">
import axios from 'axios'
import { useRouter } from 'vue-router'
import { VForm } from 'vuetify/components/VForm'
import bagongPilipinasLogo from '@images/logos/bagong-pilipinas.png'
import doh12Logo from '@images/logos/doh12-logo.png'
import dohLogo from '@images/logos/doh-logo.png'

const API_URL = 'http://127.0.0.1:8000/api'

// Edit these texts anytime
const SYSTEM_NAME = 'CLINIC'
const AGENCY_NAME = 'DEPARTMENT OF HEALTH'
const OFFICE_NAME = 'CENTER FOR HEALTH DEVELOPMENT SOCCSKSARGEN REGION'

// Floating medical icons for the animated background
const floatingIcons = [
  { icon: 'mdi-plus', size: 34, left: '8%', duration: '16s', delay: '0s' },
  { icon: 'mdi-heart-pulse', size: 30, left: '22%', duration: '19s', delay: '4s' },
  { icon: 'mdi-stethoscope', size: 32, left: '38%', duration: '17s', delay: '9s' },
  { icon: 'mdi-pill', size: 28, left: '54%', duration: '21s', delay: '2s' },
  { icon: 'mdi-plus', size: 24, left: '68%', duration: '15s', delay: '7s' },
  { icon: 'mdi-medical-bag', size: 30, left: '82%', duration: '20s', delay: '11s' },
  { icon: 'mdi-hospital-box-outline', size: 28, left: '92%', duration: '18s', delay: '5s' },
]

type LoginResponse = {
  message: string
  user: {
    id: number
    emp_id: number
    username: string
    level: string
  }
}

const router = useRouter()

const loginForm = ref<VForm>()
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const loginData = ref({
  username: '',
  password: '',
})

async function handleLogin() {
  errorMessage.value = ''

  const result = await loginForm.value?.validate()
  if (!result?.valid)
    return

  isLoading.value = true

  try {
    const { data } = await axios.post<LoginResponse>(
      `${API_URL}/login`,
      loginData.value,
      { headers: { Accept: 'application/json' } },
    )

    localStorage.setItem('user', JSON.stringify(data.user))
    await router.push({ name: 'home' })
  }
  catch (error) {
    if (axios.isAxiosError(error) && error.response)
      errorMessage.value = error.response.data?.message || 'Login failed. Please try again.'
    else
      errorMessage.value = 'Cannot reach the server. Please try again later.'
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-wrapper login-page">
    <VCard
      class="login-card"
      max-width="960"
      width="100%"
      elevation="8"
    >
      <VRow no-gutters>
        <!-- Left panel: branding -->
        <VCol
          md="6"
          cols="12"
          class="brand-panel d-none d-md-flex flex-column align-center justify-center text-center pa-10"
        >
          <!-- Animated decoration -->
          <div
            class="brand-bg"
            aria-hidden="true"
          >
            <VIcon
              v-for="(item, index) in floatingIcons"
              :key="index"
              :icon="item.icon"
              :size="item.size"
              class="floating-icon"
              :style="{
                left: item.left,
                animationDuration: item.duration,
                animationDelay: item.delay,
              }"
            />

            <svg
              class="ecg"
              viewBox="0 0 600 80"
              preserveAspectRatio="none"
            >
              <path
                pathLength="1000"
                d="M0 40 H120 L140 40 L155 10 L175 70 L195 25 L210 40 H330 L350 40 L365 10 L385 70 L405 25 L420 40 H600"
              />
            </svg>
          </div>

          <div class="brand-content d-flex flex-column align-center">
            <div class="d-flex align-center justify-center gap-3 mb-8">
              <div class="logo-circle">
                <img
                  :src="dohLogo"
                  alt="DOH logo"
                >
              </div>
              <div class="logo-circle">
                <img
                  :src="doh12Logo"
                  alt="DOH XII logo"
                >
              </div>
              <div class="logo-box">
                <img
                  class="logo-flat"
                  :src="bagongPilipinasLogo"
                  alt="Bagong Pilipinas logo"
                >
              </div>
            </div>

            <h5 class="text-h5 font-weight-bold text-white mb-1">
              {{ AGENCY_NAME }}
            </h5>
            <p class="text-body-1 text-white mb-6">
              {{ OFFICE_NAME }}
            </p>

            <VDivider
              class="brand-divider mb-6"
              color="white"
            />

            <div class="d-flex align-center gap-2 text-white">
              <VIcon
                icon="mdi-hospital-building"
                size="28"
              />
              <span class="text-h6">{{ SYSTEM_NAME }} MANAGEMENT SYSTEM</span>
            </div>
            <p class="text-body-2 text-white mt-2 brand-tagline">
              Quality healthcare for every Filipino.
            </p>
          </div>
        </VCol>

        <!-- Right panel: form -->
        <VCol
          md="6"
          cols="12"
          class="pa-6 pa-sm-10 d-flex flex-column justify-center"
        >
          <!-- Logos for small screens -->
          <div class="d-flex d-md-none align-center justify-center gap-3 mb-6">
            <img
              :src="dohLogo"
              alt="DOH logo"
              height="56"
            >
            <img
              :src="doh12Logo"
              alt="DOH XII logo"
              height="56"
            >
            <img
              :src="bagongPilipinasLogo"
              alt="Bagong Pilipinas logo"
              height="56"
            >
          </div>

          <h4 class="text-h4 font-weight-bold mb-1 text-primary">
            Welcome back
          </h4>
          <p class="text-body-1 text-medium-emphasis mb-6">
            Sign in to the {{ SYSTEM_NAME }} system
          </p>

          <VAlert
            v-if="errorMessage"
            color="error"
            variant="tonal"
            icon="mdi-alert-circle-outline"
            class="mb-6"
          >
            {{ errorMessage }}
          </VAlert>

          <VForm
            ref="loginForm"
            @submit.prevent="handleLogin"
          >
            <VTextField
              v-model="loginData.username"
              label="Username"
              prepend-inner-icon="mdi-account-outline"
              :rules="[v => !!v || 'Username is required']"
              class="mb-4"
            />

            <VTextField
              v-model="loginData.password"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              prepend-inner-icon="mdi-lock-outline"
              :rules="[v => !!v || 'Password is required']"
              :append-inner-icon="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
              class="mb-6"
              @click:append-inner="showPassword = !showPassword"
            />

            <VBtn
              block
              size="large"
              type="submit"
              color="primary"
              :loading="isLoading"
            >
              Login
            </VBtn>
          </VForm>

          <p class="text-caption text-medium-emphasis text-center mt-8 mb-0">
            &copy; 2026 {{ AGENCY_NAME }} &middot; {{ OFFICE_NAME }} - ICT
          </p>
        </VCol>
      </VRow>
    </VCard>
  </div>
</template>

<style lang="scss">
@use "@styles/pages/auth.scss";
</style>

<style lang="scss" scoped>
.login-page {
  background: linear-gradient(135deg, #e8f4fb 0%, #e6f6f1 100%);
}

.login-card {
  overflow: hidden;
  border-radius: 16px;
}

.brand-panel {
  position: relative;
  overflow: hidden;
  min-block-size: 32rem;
  background: linear-gradient(-45deg, #0b4f8a, #0a7ea4, #12a58a, #0b6fa8);
  background-size: 400% 400%;
  animation: gradient-shift 18s ease infinite;
}

.brand-content {
  position: relative;
  z-index: 1;
}

.brand-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.floating-icon {
  position: absolute;
  inset-block-end: -40px;
  color: #fff;
  opacity: 0;
  animation-name: float-up;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

.ecg {
  position: absolute;
  inset-block-end: 36px;
  inset-inline: 0;
  block-size: 80px;
  inline-size: 100%;
  opacity: 0.35;

  path {
    fill: none;
    stroke: #fff;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.5;
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: ecg-draw 4s linear infinite;
  }
}

.logo-circle {
  
  display: flex;
  align-items: center;
  justify-content: center;
  block-size: 88px;
  inline-size: 88px;
  padding: .001px;

  img {
    max-block-size: 100%;
    max-inline-size: 100%;
    border-radius: 50%;
    object-fit: contain;
  }
}

.logo-flat {
  --o: 2px; // white border thickness: change this one number

  display: block;
  block-size: 100px;
  inline-size: auto;
  object-fit: contain;
  
}

.brand-divider {
  inline-size: 64px;
  opacity: 0.6;
}

.brand-tagline {
  opacity: 0.9;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes float-up {
  0% {
    opacity: 0;
    transform: translateY(0) rotate(0deg);
  }
  15% { opacity: 0.35; }
  85% { opacity: 0.25; }
  100% {
    opacity: 0;
    transform: translateY(-34rem) rotate(40deg);
  }
}

@keyframes ecg-draw {
  0% { stroke-dashoffset: 1000; }
  70% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -1000; }
}

// Respect users who prefer reduced motion
@media (prefers-reduced-motion: reduce) {
  .brand-panel,
  .floating-icon,
  .ecg path {
    animation: none;
  }

  .ecg path {
    stroke-dashoffset: 0;
  }
}
</style>
