import pc from 'picocolors';

export function info(message: string) {
  console.log(pc.blue('ℹ info ') + message);
}

export function success(message: string) {
  console.log(pc.green('✔ success ') + message);
}

export function error(message: string) {
  console.error(pc.red('✖ error ') + message);
}
