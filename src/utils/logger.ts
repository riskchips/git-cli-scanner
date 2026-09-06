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

export function printIssues(issues: any[]) {
  issues.forEach(issue => {
    let emoji = '🚨';
    let label = '[HIGH]';
    let colorFn = pc.red;

    if (issue.severity === 'medium') {
      emoji = '⚠️';
      label = '[MEDIUM]';
      colorFn = pc.yellow;
    } else if (issue.severity === 'dummy') {
      emoji = '🧪';
      label = '[DUMMY]';
      colorFn = pc.cyan;
    }

    const title = `${emoji} ${label} ${issue.type}`;
    
    console.error(colorFn(`\n╭───────────────────────────────────────────────────`));
    console.error(colorFn(`│ ${title}`));
    console.error(colorFn(`│ 📁 File  : ${issue.file} (Line ${issue.line || 'unknown'})`));
    
    // Truncate match if it's too long for the box
    let displayMatch = issue.match.replace(/\n/g, ' ').trim();
    if (displayMatch.length > 50) {
      displayMatch = displayMatch.substring(0, 47) + '...';
    }
    
    console.error(colorFn(`│ 🔎 Match : ${displayMatch}`));
    console.error(colorFn(`╰───────────────────────────────────────────────────`));
  });
}
