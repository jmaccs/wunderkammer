




function noteToFrequency(note) {
    const noteRegex = /^([A-Ga-g])(#|b)?(\d+)$/;
    const match = note.match(noteRegex);
    
    if (!match) {
      throw new Error("Invalid note format. Must be in the form like 'A4', 'C#3', etc.");
    }
  
    const [, noteName, accidental, octave] = match;
  
   
    const noteOffsets = {
      'C': 0,
      'C#': 1, 
      'D': 2,
      'D#': 3, 
      'E': 4,
      'F': 5,
      'F#': 6, 
      'G': 7,
      'G#': 8, 
      'A': 9,
      'A#': 10, 
      'B': 11
    };
  
   
    const fullNote = noteName.toUpperCase() + (accidental || '');
  
 
    const noteOffset = noteOffsets[fullNote];
  
    if (noteOffset === undefined) {
      throw new Error("Invalid note name or accidental.");
    }
  
  
    const octaveNumber = parseInt(octave, 10);
    const semitoneOffsetFromA4 = noteOffset - 9 + (octaveNumber - 4) * 12;
  
    
    const frequency = 440 * Math.pow(2, semitoneOffsetFromA4 / 12);
  
    return frequency;
  }

  export default class Sound {
	constructor() {
		this.ctx = new AudioContext();
		const mainOutputGainNode = this.ctx.createGain();
		mainOutputGainNode.connect(this.ctx.destination);
		mainOutputGainNode.gain.setValueAtTime(0.9, this.ctx.currentTime);

		this.bandPassFilterNode = this.ctx.createBiquadFilter();
		this.bandPassFilterNode.type = "bandpass";
		this.bandPassFilterNode.frequency.value = 1000;
		this.bandPassFilterNode.Q.value = 0.1;

		this.bandPassFilterNode.connect(mainOutputGainNode);

		this.mainNode = this.bandPassFilterNode;
		this.mainNode.connect(mainOutputGainNode);

		// Memoize frequencies
		this.frequencyCache = {};
		this.isPlaying = false;
		this.oscillators = [];
		this.gainNodes = [];
	}

	// Cache/memoize the frequency for each note
	getFrequency(note) {
		if (!this.frequencyCache[note]) {
			this.frequencyCache[note] = noteToFrequency(note);
		}
		return this.frequencyCache[note];
	}

	// Create new oscillators and gain nodes for each playback
	initializeOscillators(note) {
		this.oscillators = [];
		this.gainNodes = [];

		const frequency = this.getFrequency(note);

		for (let i = 1; i < 5; i++) {
			const type = i < 2 ? "square" : i < 3 ? "sawtooth" : i < 4 ? "triangle" : "sine";
			for (let j = 0; j < 3; j++) {
				const oscillator = this.ctx.createOscillator();
				oscillator.type = type;
				oscillator.frequency.setValueAtTime(frequency, this.ctx.currentTime);

				const gainNode = this.ctx.createGain();
				gainNode.gain.setValueAtTime(0, this.ctx.currentTime); // Start silent

				oscillator.connect(gainNode);
				gainNode.connect(this.mainNode);

				this.oscillators.push(oscillator);
				this.gainNodes.push(gainNode);
			}
		}
	}

	// Start playback by creating new oscillators and ramping up gain
	startPlayback(note) {
		if (!this.isPlaying) {
			this.initializeOscillators(note);

			this.oscillators.forEach((oscillator, i) => {
				// Fade in by ramping the gain up smoothly
				this.gainNodes[i].gain.cancelScheduledValues(this.ctx.currentTime);
				this.gainNodes[i].gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.05);

				oscillator.start(this.ctx.currentTime); // Start oscillator only once
			});

			this.isPlaying = true;
		}
	}

	// Gently stop playback by fading the gain out and stopping oscillators
	stopPlayback() {
		if (this.isPlaying) {
			this.gainNodes.forEach(gainNode => {
				// Fade out by ramping the gain down smoothly
				gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
				gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3); // 0.3s fade-out
			});

			// Stop the oscillators after the fade-out
			setTimeout(() => {
				this.oscillators.forEach(oscillator => oscillator.stop(this.ctx.currentTime)); // Stop oscillators after fade-out
				this.isPlaying = false;
			}, 300); // 300ms corresponds to the fade-out duration
		}
	}
}
