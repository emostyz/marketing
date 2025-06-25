import { easeOut } from 'framer-motion'

export const pageTransitions = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2, ease: easeOut }
}

export const slideTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  slideLeft: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '-100%' }
  },
  
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 }
  },
  
  flip: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 }
  }
}

export const elementAnimations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5, ease: easeOut }
  },
  
  slideUp: {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.5, ease: easeOut }
  },
  
  bounceIn: {
    initial: { scale: 0 },
    animate: { 
      scale: [0, 1.2, 0.9, 1.05, 1],
      transition: { duration: 0.6, ease: easeOut }
    }
  },
  
  typewriter: {
    initial: { width: 0 },
    animate: { width: '100%' },
    transition: { duration: 2, ease: (t: number) => t }
  }
}