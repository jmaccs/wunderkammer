
    import {  createTransition } from '@threlte/extras'
    import { cubicOut, cubicIn } from 'svelte/easing'

	let animDelay

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