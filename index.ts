const KEY_SHARP_COLOR = "black";
const KEY_COLOR = "white";
const KEY_DOWN_COLOR = "#9090EE";

const PIANO_WIDTH = 793;
const PIANO_HEIGHT = 300;

const KEYS = "1!2\"34$5%6&78(9)0qQwWeErtTyYuiIoOpPasSdDfgGhHjJklLzZxcCvVbBnm";

const KEY_WIDTH = Math.floor(PIANO_WIDTH/KEYS.length);
const SHARP_HEIGHT = PIANO_HEIGHT/2;

interface Note {
  note: string,
  sharp: boolean,
  down: boolean,
}

function joinPath(a: string, b: string): string {
  return [a, b].join(a.endsWith("/") ? "" : "/");
}

function createNotes(noteChars: string[]): Note[] {
  let notes: Note[] = [];

  for (let y = 2; y <= 6; ++y) {
    for (let x = 0; x < noteChars.length; ++x) {
      notes.push({
        note: `${noteChars[x]}${y}`,
        sharp: false,
        down: false,
      });
      if (noteChars[x].toLowerCase() !== "b" && noteChars[x].toLowerCase() !== "e") notes.push({
        note: `${noteChars[x]}s${y}`,
        sharp: true,
        down: false,
      });
    }
  }
  notes.push({
    note: "c7",
    sharp: false,
    down: false,
  });

  return notes;
}

function createAudios(dir: string, notes: Note[]): HTMLAudioElement[] {
  let audios: HTMLAudioElement[] = [];
  for (let note of notes) {
    const audio = new Audio();
    audio.src = joinPath(dir, `${note.note}.mp3`);
    audios.push(audio);
  }

  return audios;
}

function renderPiano(ctx: CanvasRenderingContext2D, notes: Note[]) {
  console.assert(PIANO_WIDTH%KEYS.length === 0);
  let keyHeight = PIANO_HEIGHT;
  ctx.fillStyle = KEY_COLOR;
  ctx.fillRect(0, 0, PIANO_WIDTH, PIANO_HEIGHT);
  for (let i = 0; i < KEYS.length; ++i) {
    if (notes[i].sharp) {
      ctx.fillStyle = KEY_SHARP_COLOR;
      keyHeight = SHARP_HEIGHT;
    }
        else {
          ctx.fillStyle = KEY_COLOR;
          keyHeight = PIANO_HEIGHT
        }

    if (notes[i].down) ctx.fillStyle = KEY_DOWN_COLOR;
    ctx.fillRect(i*KEY_WIDTH, 0, KEY_WIDTH, keyHeight);
    ctx.fillStyle = notes[i].sharp ? KEY_COLOR : KEY_SHARP_COLOR;
    ctx.fillText(KEYS[i], i*KEY_WIDTH+KEY_WIDTH/4, keyHeight-50, KEY_WIDTH);
  }
}

function getCheckedInput(buttons: HTMLInputElement[]): HTMLInputElement | void {
  for (let i = 0; i < buttons.length; ++i) {
    if (buttons[i].checked) {
      return buttons[i];
    }
  }
}

function getElementByIdOrError<T>(id: string): T {
  const x = document.getElementById(id) as T;
  if (x === null) {
    throw new Error(`Could not find element ${id}`);
  }
  return x;
}

window.onload = () => {
  const notes = createNotes(["c", "d", "e", "f", "g", "a", "b"]);
  const buttonIds = [
    "Emotional",
    "Emotional_2.0",
    "GreatAndSoftPiano",
    "HardAndToughPiano",
    "HardPiano",
    "Harp",
    "Harpsicord",
    "LoudAndProudPiano",
    "Music_Box",
    "NewPiano",
    "Piano2",
    "PianoSounds",
    "Rhodes_MK1",
    "SoftPiano",
    "Steinway_Grand",
    "Untitled",
    "Vintage_Upright",
    "Vintage_Upright_Soft",
  ];

  let buttonElements: HTMLInputElement[] = [];
  for (let buttonId of buttonIds) {
    buttonElements.push(getElementByIdOrError<HTMLInputElement>(buttonId));
  }

  let pianoType = (getCheckedInput(buttonElements) as HTMLInputElement).value;
  let audios = createAudios(`./piano_sounds/${pianoType}`, notes);

  const piano = getElementByIdOrError<HTMLCanvasElement>("piano");
  piano.width = PIANO_WIDTH;
  piano.height = PIANO_HEIGHT;

  const pianoCtx = piano.getContext("2d");
  if (pianoCtx === null) {
    throw new Error(`Could not initialize 2d context`);
  }

  const pianoStylePicker = getElementByIdOrError<HTMLFieldSetElement>("pianoStyle");
  const volumeSlider = getElementByIdOrError<HTMLInputElement>("volumeSlider");
  pianoStylePicker.addEventListener("change", (_) => {
    pianoType = (getCheckedInput(buttonElements) as HTMLInputElement).value;
    audios = createAudios(`./piano_sounds/${pianoType}`, notes);
    for (let i = 0; i < audios.length; ++i) {
      audios[i].volume = parseInt(volumeSlider.value)/100;
    }
  });

  volumeSlider.addEventListener("change", (_) => {
    for (let i = 0; i < KEYS.length; ++i) {
      pianoType = (getCheckedInput(buttonElements) as HTMLInputElement).value;
      for (let i = 0; i < audios.length; ++i) {
        audios[i].volume = parseInt(volumeSlider.value)/100;
      }
    }
  });

  renderPiano(pianoCtx, notes);
  document.addEventListener("keydown", (e) => {
    for (let i = 0; i < KEYS.length; ++i) {
      if (notes[i].down) return;
      if (e.key == KEYS[i]) {
        const audio = audios[i];
        audio.currentTime = 0;
        audio.play();
        notes[i].down = true;
      }
    }

    renderPiano(pianoCtx, notes);
  });

  document.addEventListener("keyup", (_) => {
    for (let i = 0; i < KEYS.length; ++i) {
      notes[i].down = false;
    }

    renderPiano(pianoCtx, notes);
  });
};
