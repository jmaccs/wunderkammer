import { createTransition } from '@threlte/extras';
import { cubicOut, cubicIn } from 'svelte/easing';

let animDelay;

export const fade = createTransition((ref) => {
    ref.transparent = true;
    return {
        tick(t) {
            ref.opacity = t;
        },
        easing: cubicOut,
        duration: 400,
        delay: 100
    };
});

export const scale = createTransition((ref) => {
    return {
        tick(t) {
            // t is [0,1] and needs to be converted to [0.5,1]
            t = 0.5 + t * 0.5;
            ref.scale.set(t, t, t);
        },
        easing: cubicOut,
        duration: 800
    };
});

export const fly = createTransition((ref) => {
    return {
        tick(t) {
            t = 1 - t;
            ref.position.y = t;
        },
        easing: cubicOut,
        duration: 800
    };
});

export const scaleTransition = createTransition((ref, { direction }) => {
    return {
        tick(t) {
            ref.scale.setScalar(t);
        },
        delay: animDelay + (direction === 'in' ? 200 : 0),
        duration: 200,
        easing: direction === 'in' ? cubicOut : cubicIn
    };
});

export function calculateResponsiveDimensions(innerWidth, innerHeight) {

    const baseWidth = 2000;
    const baseHeight = 1500;
    const baseAspectRatio = baseWidth / baseHeight;

    
    const currentAspectRatio = innerWidth / innerHeight;

    
    let scale = 0.25; 


    if (innerWidth <= 768) { 
        scale = 0.8;
    } else if (innerWidth <= 1024) { 
        scale = 0.5;
    }

    let width, height;

    
    if (currentAspectRatio > baseAspectRatio) {
      
        height = innerHeight * scale;
        width = height * baseAspectRatio;
    } else {
  
        width = innerWidth * scale;
        height = width / baseAspectRatio;
    }

    
    const minWidth = 300;
    const minHeight = 200;
    width = Math.max(width, minWidth);
    height = Math.max(height, minHeight);

 
    const maxWidth = innerWidth * 0.9;
    const maxHeight = innerHeight * 0.9;
    width = Math.min(width, maxWidth);
    height = Math.min(height, maxHeight);

    return {
        width: Math.round(width),
        height: Math.round(height)
    };
}
