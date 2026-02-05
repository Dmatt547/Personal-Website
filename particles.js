// particles.js - Guaranteed working configuration
tsParticles.load("particles", {
  fpsLimit: 60,
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        area: 800
      }
    },
    color: {
      value: "#2dd4bf"
    },
    shape: {
      type: "circle"
    },
    opacity: {
      value: 0.1
    },
    size: {
      value: { min: 4, max: 6 }
    },
    links: {
      enable: true,
      distance: 150,
      color: "#2dd4bf",
      opacity: 0.4,
      width: 1
    },
    move: {
      enable: true,
      speed: 0.3,
      direction: "none",
      random: false,
      straight: false,
      outModes: {
        default: "bounce"
      }
    }
  },

  interactivity: {

    events: { onHover: { enable: true, mode: "repulse" } },
    modes: { repulse: { distance: 80 } },

    detectsOn: "canvas",
    events: {
      onHover: {
        enable: true,
        mode: "repulse"
      },
      onClick: {
        enable: true,
        mode: "push"
      },
      resize: true
    },
    modes: {
      repulse: {
        distance: 100,
        duration: 0.4
      },
      push: {
        quantity: 4
      }
    }
    
  },
  detectRetina: true
});