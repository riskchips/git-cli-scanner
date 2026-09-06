import pc from 'picocolors';

export class Spinner {
  private timer: NodeJS.Timeout | null = null;
  private messages: string[];
  private currentMessageIndex = 0;
  // Cute orange flower animation frames
  private frames: string[] = ['✿', '❀', '❁', '❂', '❃', '🏵'];
  private currentFrame = 0;
  private ticks = 0;

  constructor(messages: string | string[]) {
    this.messages = Array.isArray(messages) ? messages : [messages];
  }

  start() {
    // Hide cursor
    process.stdout.write('\x1B[?25l');
    this.timer = setInterval(() => {
      // Rotate message every 15 frames (~1.8 seconds)
      if (this.ticks > 0 && this.ticks % 15 === 0) {
        this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length;
      }
      
      const currentMessage = this.messages[this.currentMessageIndex];
      // \r returns to the beginning of the line, \x1b[K clears the line
      process.stdout.write(`\r\x1b[K${pc.yellow(this.frames[this.currentFrame])} ${currentMessage}`);
      
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      this.ticks++;
    }, 120);
  }

  stop(successMessage?: string) {
    if (this.timer) clearInterval(this.timer);
    process.stdout.write('\r\x1b[K'); // clear line
    process.stdout.write('\x1B[?25h'); // show cursor
    if (successMessage) {
      console.log(`${pc.green('✔')} ${successMessage}`);
    }
  }

  fail(failMessage?: string) {
    if (this.timer) clearInterval(this.timer);
    process.stdout.write('\r\x1b[K'); // clear line
    process.stdout.write('\x1B[?25h'); // show cursor
    if (failMessage) {
      console.log(`${pc.red('✖')} ${failMessage}`);
    }
  }
}
