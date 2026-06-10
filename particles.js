// particles.js - Guaranteed working configuration
tsParticles.load("particles", {
  fpsLimit: 60,
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        area: 900
      }
    },
    color: {
      value: "rgb(255, 255, 255)"
    },
    shape: {
      type: "circle"
    },
    opacity: {
      value: 0.2
    },
    size: {
      value: { min: 4, max: 4 }
    },
    links: {
      enable: false,
      distance: 150,
      color: "#ffffff",
      opacity: 0.3,
      width: 1
    },
    move: {
      enable: true,
      speed: 0.2,
      direction: "none",
      random: false,
      straight: false,
      outModes: {
        default: "bounce"
      }
    }
  },

  // interactivity: {

  //   events: { onHover: { enable: false, mode: "repulse" } },
  //   modes: { repulse: { distance: 80 } },

  //   detectsOn: "canvas",
  //   events: {
  //     onHover: {
  //       enable: true,
  //       mode: "repulse"
  //     },
  //     onClick: {
  //       enable: true,
  //       mode: "push"
  //     },
  //     resize: true
  //   },
  //   modes: {
  //     repulse: {
  //       distance: 100,
  //       duration: 0.4
  //     },
  //     push: {
  //       quantity: 4
  //     }
  //   }
    
  // },
  detectRetina: true
});