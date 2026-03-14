<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ config('app.name', 'Gym Trainer') }}</title>
        @if(url()->current() !== 'http://127.0.0.1:8000')
        @viteReactRefresh
        @endif
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body class="bg-black text-white antialiased">
        <div id="app">
            
              <!-- NAV -->
              <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
                <div class="bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-lg">
                  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div class="flex h-20 items-center justify-between">
                      <a href="/" class="flex items-center gap-3 font-bold text-xl tracking-tight group">
                        <img 
                          src="https://static.wixstatic.com/media/043e76_bf25043294364c059b4a1b246c029c2d~mv2.png/v1/fill/w_168,h_180,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/zColor%20-%20White_1500px.png" 
                          alt="JoeySpeakesFitness Logo" 
                          class="h-12 w-auto group-hover:scale-110 transition-transform duration-300 " style="scale: 1.3;"
                        />
                        <span class="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent hidden sm:inline"></span>
                      </a>
            
                      <nav class="hidden md:flex items-center gap-8 text-sm font-medium">
                        <a href="#how" class="text-white/70 hover:text-white transition-colors duration-200 relative group">
                          How it Works
                          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
                        </a>
                        <a href="#pricing" class="text-white/70 hover:text-white transition-colors duration-200 relative group">
                          Pricing
                          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
                        </a>
                        <a href="#faq" class="text-white/70 hover:text-white transition-colors duration-200 relative group">
                          FAQ
                          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
                        </a>
                      </nav>
            
                      <div class="flex items-center gap-3">
                        <a href="/login"
                           class="hidden sm:inline-flex items-center justify-center rounded-xl bg-white/5 px-5 py-2.5 text-sm font-semibold hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-105">
                          Login
                        </a>
                        <a href="/register"
                           class="hidden sm:inline-flex items-center justify-center rounded-xl bg-white/5 px-5 py-2.5 text-sm font-semibold hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-105">
                                Register
                            </a>
                        <a href="#pricing"
                           class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-2.5 text-sm font-semibold hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 hover:scale-105">
                          Start My Form Check
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
        </header>
            
              <!-- HERO -->
              <section class="relative min-h-screen pt-20 flex items-center overflow-hidden">
                <!-- Animated background gradient -->
                <div class="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20"></div>
                
                <!-- Background image with parallax effect -->
                <div
                  class="absolute inset-0 bg-center bg-cover opacity-30 scale-105"
                  style="background-image:url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2400&q=80');">
                </div>
            
                <!-- Animated gradient overlay -->
                <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black"></div>
                
                <!-- Animated grid pattern -->
                <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
                <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                  <div class="flex min-h-[80vh] items-center justify-center text-center">
                    <div class="max-w-4xl space-y-8 animate-fade-in">
                      <!-- Badge -->
                      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
                        <span class="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span class="text-sm font-medium text-blue-300">Professional Form Analysis</span>
                      </div>
                      
                      <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight">
                        <span class="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                          Get Pro-Level Feedback
                        </span>
                        <br>
                        <span class="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 bg-clip-text text-transparent">
                          on Your Workout Form
                        </span>
                      </h1>
            
                      <p class="mt-6 text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
                        Send a video of your workout. We'll review your form, give actionable feedback,
                        and help you train <span class="text-white font-semibold">safer & smarter</span> — all from your phone.
                      </p>
            
                      <div class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="#pricing"
                           class="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-base font-semibold hover:from-blue-500 hover:to-blue-400 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
                          <span>Start My Form Check</span>
                          <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </a>
            
                        <div class="text-white/50 font-medium">OR</div>
            
                        <div class="flex flex-col sm:flex-row items-center gap-3">
                          <a href="/login"
                             class="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white/5 px-8 py-4 text-base font-semibold hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                            Login
                          </a>
                          <a href="/register"
                             class="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600/80 to-blue-500/80 px-8 py-4 text-base font-semibold hover:from-blue-500 hover:to-blue-400 border border-blue-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                            Register
                          </a>
                        </div>
                      </div>
            
                      <!-- Trust indicators -->
                      <div class="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm">
                        <div class="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                          <div class="relative">
                            <span class="absolute h-3 w-3 rounded-full bg-green-400 animate-ping opacity-75"></span>
                            <span class="relative h-3 w-3 rounded-full bg-green-400"></span>
                          </div>
                          <span class="text-white/90 font-medium">24–48 hour turnaround</span>
                        </div>
                        <div class="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                          <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span class="text-white/90 font-medium">Personal video feedback</span>
                        </div>
                        <div class="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                          <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span class="text-white/90 font-medium">Safer lifts, faster progress</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            
                <!-- Bottom fade with scroll indicator -->
                <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                  <svg class="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </section>
            
              <!-- HOW IT WORKS -->
              <section id="how" class="relative py-24 bg-gradient-to-b from-black via-black to-gray-900">
                <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div class="text-center mb-16">
                    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                      <span class="text-sm font-medium text-blue-300">Simple Process</span>
                    </div>
                    <h2 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
                      <span class="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                        How It Works
                      </span>
                      <br>
                      <span class="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                        3 Simple Steps
                      </span>
                    </h2>
                    <p class="text-lg text-white/60 max-w-2xl mx-auto">
                      Get professional form analysis in just three easy steps
                    </p>
                  </div>
            
                  <!-- Timeline line + nodes -->
                  <div class="mt-14 hidden lg:block">
                    <div class="relative">
                      <div class="h-[2px] w-full bg-blue-600/80"></div>
            
                      {{-- <div class="absolute -top-7 left-0 flex w-full justify-between">
                        <!-- Node 1 -->
                        <div class="flex items-center justify-center">
                          <div class="h-14 w-14 rounded-full border border-white/40 bg-black flex items-center justify-center text-xl font-bold">1</div>
                        </div>
                        <!-- Node 2 -->
                        <div class="flex items-center justify-center">
                          <div class="h-14 w-14 rounded-full border border-white/40 bg-black flex items-center justify-center text-xl font-bold">2</div>
                        </div>
                        <!-- Node 3 -->
                        <div class="flex items-center justify-center">
                          <div class="h-14 w-14 rounded-full border border-white/40 bg-black flex items-center justify-center text-xl font-bold">3</div>
                        </div>
                      </div> --}}
                    </div>
                  </div>
            
                  <!-- Steps cards -->
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Step 1 -->
                    <div class="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 shadow-xl hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-2">
                      <div class="absolute -top-4 -left-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/30 border-4 border-black">
                        1
                      </div>
                      <div class="mt-8">
                        <h3 class="text-2xl font-bold mb-4">Record Your Workout</h3>
                        <p class="text-white/70 leading-relaxed mb-6">
                          Grab your phone, film your squat / deadlift / bench — whatever you want feedback on.
                        </p>
                        <div class="overflow-hidden rounded-xl border border-white/10 group-hover:border-blue-500/30 transition-all duration-300">
                          <img
                            class="h-56 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                            src="https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=1600&q=80"
                            alt="Record workout">
                        </div>
                      </div>
                    </div>
            
                    <!-- Step 2 -->
                    <div class="group relative rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-white/[0.02] p-8 shadow-xl hover:shadow-2xl hover:border-blue-500/60 transition-all duration-300 hover:-translate-y-2">
                      {{-- <div class="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-1.5 text-xs font-bold shadow-lg shadow-blue-500/30">
                        Most Popular
                      </div> --}}
                      <div class="absolute -top-4 -left-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/30 border-4 border-black">
                        2
                      </div>
                      <div class="mt-8">
                        <h3 class="text-2xl font-bold mb-4">Upload & Pay</h3>
                        <p class="text-white/70 leading-relaxed mb-6">
                          Hit "Start My Form Check", choose a plan, pay, upload your video — all in under a minute.
                        </p>
                        <div class="overflow-hidden rounded-xl border border-white/10 group-hover:border-blue-500/30 transition-all duration-300">
                          <img
                            class="h-56 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"
                            alt="Upload and pay">
                        </div>
                      </div>
                    </div>
            
                    <!-- Step 3 -->
                    <div class="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 shadow-xl hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-2">
                      <div class="absolute -top-4 -left-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/30 border-4 border-black">
                        3
                      </div>
                      <div class="mt-8">
                        <h3 class="text-2xl font-bold mb-4">Get Your Feedback Video</h3>
                        <p class="text-white/70 leading-relaxed mb-6">
                          Our coach reviews your movement, points out what's good and what to correct,
                          and sends back personalized video feedback.
                        </p>
                        <div class="overflow-hidden rounded-xl border border-white/10 group-hover:border-blue-500/30 transition-all duration-300">
                          <img
                            class="h-56 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                            src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1600&q=80"
                            alt="Feedback video">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            
              <!-- PRICING -->
              <section id="pricing" class="relative py-24 bg-gradient-to-b from-gray-900 via-black to-black">
                <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div class="text-center mb-16">
                    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                      <span class="text-sm font-medium text-blue-300">Flexible Plans</span>
                    </div>
                    <h2 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
                      <span class="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                        Choose Your
                      </span>
                      <br>
                      <span class="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                        Pricing Plan
                      </span>
                    </h2>
                    <p class="text-lg text-white/60 max-w-2xl mx-auto">
                      Pick the plan that matches your goal. Login is required before purchase.
                    </p>
                  </div>
            
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Plan 1 -->
                    <div class="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 shadow-xl hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-2">
                      <div class="overflow-hidden rounded-2xl border border-white/10 mb-6 group-hover:border-blue-500/30 transition-all duration-300">
                        <img
                          class="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80"
                          alt="Plan image">
                      </div>
            
                      <div>
                        <h3 class="text-2xl font-bold text-center mb-2">Quick Form Check</h3>
                        <div class="mt-4 text-center mb-8">
                          <span class="text-white/60 align-top text-xl">$</span>
                          <span class="text-6xl font-extrabold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">49</span>
                        </div>
            
                        <ul class="space-y-4 text-white/80 mb-8">
                          <li class="flex gap-3 items-start">
                            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20 text-green-400 flex-shrink-0">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                              </svg>
                            </span>
                            <span>1–3 exercise videos</span>
                          </li>
                          <li class="flex gap-3 items-start">
                            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20 text-green-400 flex-shrink-0">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                              </svg>
                            </span>
                            <span>Personalized video feedback for each clip</span>
                          </li>
                          <li class="flex gap-3 items-start">
                            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20 text-green-400 flex-shrink-0">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                              </svg>
                                </span>
                            <span>Clear cues, demonstrations, and key fixes</span>
                          </li>
                          <li class="flex gap-3 items-start">
                            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20 text-green-400 flex-shrink-0">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                              </svg>
                            </span>
                            <span>24–48 hour turnaround time</span>
                          </li>
                        </ul>
            
                        <p class="mb-6 text-center text-sm text-white/50">Valid for one month</p>
            
                        <div class="space-y-3">
                          <a href="/register"
                             class="group/btn inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3.5 font-semibold hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
                            <span>Get Started</span>
                            <svg class="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </a>
                          <p class="text-center text-xs text-white/50">
                            Already have an account? <a href="/login" class="text-blue-400 hover:text-blue-300 underline">Login</a>
                          </p>
                        </div>
                      </div>
                    </div>
            
                    <!-- Plan 2 (Featured) -->
                    <div class="group relative rounded-3xl border-2 border-blue-500/60 bg-gradient-to-br from-blue-500/10 via-white/5 to-white/[0.02] p-8 shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500 transition-all duration-300 hover:-translate-y-2 scale-105 lg:scale-100">
                      <div class="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-1.5 text-xs font-bold shadow-lg shadow-blue-500/50 border-2 border-black">
                        ⭐ Most Popular
                      </div>
            
                      <div class="overflow-hidden rounded-2xl border border-blue-500/30 mb-6 group-hover:border-blue-500/50 transition-all duration-300">
                        <img
                          class="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          src="https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?auto=format&fit=crop&w=1600&q=80"
                          alt="Plan image">
                      </div>
            
                      <div>
                        <h3 class="text-2xl font-bold text-center mb-2">Monthly Form Coaching</h3>
                        <div class="mt-4 text-center mb-8">
                          <span class="text-white/60 align-top text-xl">$</span>
                          <span class="text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">159</span>
                        </div>
            
                        <ul class="space-y-4 text-white/80 mb-8">
                          <li class="flex gap-3 items-start">
                            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20 text-green-400 flex-shrink-0">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                              </svg>
                            </span>
                            <span>8–10 exercise videos/month</span>
                          </li>
                          <li class="flex gap-3 items-start">
                            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20 text-green-400 flex-shrink-0">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                              </svg>
                            </span>
                            <span>Personalized video feedback</span>
                        </li>
                          <li class="flex gap-3 items-start">
                            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20 text-green-400 flex-shrink-0">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                              </svg>
                                </span>
                            <span>Priority response</span>
                          </li>
                          <li class="flex gap-3 items-start">
                            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20 text-green-400 flex-shrink-0">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                              </svg>
                            </span>
                            <span>Clear cues & key fixes</span>
                          </li>
                          <li class="flex gap-3 items-start">
                            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20 text-green-400 flex-shrink-0">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                    </svg>
                            </span>
                            <span>24–48 hour turnaround</span>
                        </li>
                    </ul>
            
                        <p class="mb-6 text-center text-sm text-white/50">Valid for one month</p>
            
                        <div class="space-y-3">
                          <a href="/register"
                             class="group/btn inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3.5 font-semibold hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300 hover:scale-105">
                            <span>Get Started</span>
                            <svg class="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </a>
                          <p class="text-center text-xs text-white/50">
                            Already have an account? <a href="/login" class="text-blue-400 hover:text-blue-300 underline">Login</a>
                          </p>
                        </div>
                      </div>
                    </div>
            
                    <!-- Plan 3 -->
                    <div class="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 shadow-xl hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-2">
                      <div class="overflow-hidden rounded-2xl border border-white/10 mb-6 group-hover:border-blue-500/30 transition-all duration-300">
                        <img
                          class="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          src="https://images.unsplash.com/photo-1517964603305-11c0f6f66012?auto=format&fit=crop&w=1600&q=80"
                          alt="Plan image">
                      </div>
            
                      <div>
                        <h3 class="text-2xl font-bold text-center mb-2">Advanced Form Mastery</h3>
                        <div class="mt-4 text-center mb-8">
                          <span class="text-white/60 align-top text-xl">$</span>
                          <span class="text-6xl font-extrabold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">279</span>
                        </div>
            
                        <ul class="space-y-4 text-white/80 mb-8">
                          <li class="flex gap-3 items-start">
                            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20 text-green-400 flex-shrink-0">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                              </svg>
                            </span>
                            <span>15–20 exercise videos/month</span>
                          </li>
                          <li class="flex gap-3 items-start">
                            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20 text-green-400 flex-shrink-0">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                              </svg>
                            </span>
                            <span>Advanced video breakdowns</span>
                          </li>
                          <li class="flex gap-3 items-start">
                            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20 text-green-400 flex-shrink-0">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                              </svg>
                            </span>
                            <span>Priority or same/next-day response</span>
                          </li>
                          <li class="flex gap-3 items-start">
                            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20 text-green-400 flex-shrink-0">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                              </svg>
                            </span>
                            <span>Efficiency & injury prevention focus</span>
                          </li>
                          <li class="flex gap-3 items-start">
                            <span class="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20 text-green-400 flex-shrink-0">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                              </svg>
                            </span>
                            <span>12–24 hour turnaround</span>
                        </li>
                    </ul>
            
                        <p class="mb-6 text-center text-sm text-white/50">Valid for one month</p>
            
                        <div class="space-y-3">
                          <a href="/register"
                             class="group/btn inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3.5 font-semibold hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
                            <span>Get Started</span>
                            <svg class="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </a>
                          <p class="text-center text-xs text-white/50">
                            Already have an account? <a href="/login" class="text-blue-400 hover:text-blue-300 underline">Login</a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            
              <!-- FAQ -->
              <section id="faq" class="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
                <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div class="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                  <div class="text-center mb-16">
                    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                      <span class="text-sm font-medium text-blue-300">Got Questions?</span>
                    </div>
                    <h2 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
                      <span class="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                        Frequently Asked
                      </span>
                      <br>
                      <span class="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                        Questions
                      </span>
                    </h2>
                  </div>
            
                  <div class="space-y-4">
                    <details class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 hover:border-blue-500/30 transition-all duration-300">
                      <summary class="flex cursor-pointer list-none items-center justify-between font-semibold text-lg">
                        <span>How do I upload my video?</span>
                        <span class="ml-4 text-white/60 group-open:rotate-180 transition-transform duration-300">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <p class="mt-4 text-white/70 leading-relaxed pl-2">
                        After login and payment, you'll see an upload area in your dashboard. Upload from phone or desktop.
                      </p>
                    </details>
            
                    <details class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 hover:border-blue-500/30 transition-all duration-300">
                      <summary class="flex cursor-pointer list-none items-center justify-between font-semibold text-lg">
                        <span>How long does feedback take?</span>
                        <span class="ml-4 text-white/60 group-open:rotate-180 transition-transform duration-300">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                        </span>
                      </summary>
                      <p class="mt-4 text-white/70 leading-relaxed pl-2">
                        Most plans return feedback within 24–48 hours. The Advanced plan can be faster.
                      </p>
                    </details>
            
                    <details class="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 hover:border-blue-500/30 transition-all duration-300">
                      <summary class="flex cursor-pointer list-none items-center justify-between font-semibold text-lg">
                        <span>Can I message the coach?</span>
                        <span class="ml-4 text-white/60 group-open:rotate-180 transition-transform duration-300">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                        </span>
                      </summary>
                      <p class="mt-4 text-white/70 leading-relaxed pl-2">
                        Yes. Inside your member area you'll have a support chat to talk with admin/coach in real time.
                      </p>
                    </details>
                  </div>
            
                  <div class="mt-16 text-center">
                    <a href="#pricing"
                       class="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-base font-semibold hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
                      <span>Choose a Plan</span>
                      <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    </a>
                  </div>
                </div>
              </section>
              
              <!-- Footer -->
              <footer class="relative py-12 bg-black border-t border-white/10">
                <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div class="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div class="flex items-center gap-3">
                      <img 
                        src="https://static.wixstatic.com/media/043e76_bf25043294364c059b4a1b246c029c2d~mv2.png/v1/fill/w_168,h_180,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/zColor%20-%20White_1500px.png" 
                        alt="JoeySpeakesFitness Logo" 
                        class="h-10 w-auto"
                      />
                      <span class="font-bold text-lg hidden sm:inline">JoeySpeakesFitness</span>
                    </div>
                    <p class="text-white/50 text-sm">
                      &copy; {{ date('Y') }} JoeySpeakesFitness. All rights reserved.
                    </p>
                  </div>
                </div>
              </footer>
            
        </div>
    </body>
</html>
