// Scroll progress
  window.addEventListener('scroll', () => {
    const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    document.getElementById('progress').style.width = scrolled + '%';
  });

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.15 });
  reveals.forEach(el => observer.observe(el));

  // Autoplay story video when it scrolls into view
  const storyVideo = document.getElementById("storyVideo");
  if (storyVideo) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          storyVideo.play().catch(() => {});
        } else {
          storyVideo.pause();
        }
      });
    }, { threshold: 0.5 });

    videoObserver.observe(storyVideo);
  }

  // Autoplay solution video when it scrolls into view
  const solutionVideo = document.getElementById("solutionVideo");
  if (solutionVideo) {
    const solutionVideoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          solutionVideo.play().catch(() => {});
        } else {
          solutionVideo.pause();
        }
      });
    }, { threshold: 0.5 });

    solutionVideoObserver.observe(solutionVideo);
  }

  // Animated counters
  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = prefix + Math.round(current).toLocaleString() + suffix;
      if (current >= target) clearInterval(timer);
    }, 25);
  }

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const counter = e.target.querySelector('[data-target]');
        if (counter) animateCounter(counter);
        statObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.stat-card').forEach(card => statObserver.observe(card));

  // ── Audio file player ──────────────────────────────────
  const nodes = {};
  const playing = {};

  const trackDefs = {
    birds:  { src: 'Media/Sound/Bird sound.mp3', loop: true },
    people: { src: 'Media/Sound/People talking in the back ground.mp3', loop: true },
    wind:   { src: 'Media/Sound/Wind and leaf.mp3', loop: true },
    notif:  { src: 'Media/Sound/message noti.mp3', loop: true },
    typing: { src: 'Media/Sound/Typing sound.mp3', loop: true },
    horn:   { src: 'Media/Sound/carhorn.mp3', loop: false },
  };

  const presentTracks    = ['birds','people','wind'];
  const distractedTracks = ['notif','typing','horn'];

  function toggleTrack(id) {
    if (playing[id]) {
      stopTrack(id);
    } else {
      startTrack(id);
    }
    checkReveal();
  }

  function startTrack(id) {
    const def = trackDefs[id];
    if (!def) return;
    stopTrack(id);

    const audio = new Audio(def.src);
    audio.loop = def.loop;
    audio.addEventListener('ended', () => {
      playing[id] = false;
      delete nodes[id];
      setTrackUI(id, false);
      updateWaveform(id, false);
    });

    nodes[id] = audio;
    playing[id] = true;
    setTrackUI(id, true);
    updateWaveform(id, true);
    audio.play().catch(() => {
      playing[id] = false;
      delete nodes[id];
      setTrackUI(id, false);
      updateWaveform(id, false);
    });
  }

  function stopTrack(id) {
    const audio = nodes[id];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      delete nodes[id];
    }
    playing[id] = false;
    setTrackUI(id, false);
    updateWaveform(id, false);
  }

  function setTrackUI(id, on) {
    const cap = id.charAt(0).toUpperCase() + id.slice(1);
    const row = document.getElementById('track' + cap);
    const btn = document.getElementById('btn' + cap);
    if (row) { on ? row.classList.add('playing') : row.classList.remove('playing'); }
    if (btn) btn.textContent = on ? '■' : '▶';
  }

  function updateWaveform(id, on) {
    const isPresent = presentTracks.includes(id);
    const waveId = isPresent ? 'wavePresent' : 'waveDistract';
    const wave = document.getElementById(waveId);
    if (!wave) return;
    const anyPlaying = isPresent
      ? presentTracks.some(t => playing[t])
      : distractedTracks.some(t => playing[t]);
    anyPlaying ? wave.classList.add('playing') : wave.classList.remove('playing');
  }

  function playAllPresent() {
    const btn = document.getElementById('masterPresentBtn');
    const anyOn = presentTracks.some(t => playing[t]);
    if (anyOn) {
      presentTracks.forEach(stopTrack);
      btn.textContent = '▶ Play All Sounds';
    } else {
      presentTracks.forEach(startTrack);
      btn.textContent = '■ Stop All';
    }
    checkReveal();
  }

  function playAllDistracted() {
    const btn = document.getElementById('masterDistractBtn');
    const anyOn = distractedTracks.some(t => playing[t]);
    if (anyOn) {
      distractedTracks.forEach(stopTrack);
      btn.textContent = '▶ Play All Sounds';
    } else {
      distractedTracks.forEach(startTrack);
      btn.textContent = '■ Stop All';
    }
    checkReveal();
  }

  let revealShown = false;
  function checkReveal() {
    if (revealShown) return;
    const anyPresent    = presentTracks.some(t => playing[t]);
    const anyDistracted = distractedTracks.some(t => playing[t]);
    if (anyPresent || anyDistracted) {
      setTimeout(() => {
        document.getElementById('audioRevealMsg').classList.add('show');
        revealShown = true;
      }, 2000);
    }
  }
