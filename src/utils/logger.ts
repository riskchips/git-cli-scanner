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

export function printIssues(issues: any[], showSolution: boolean = false) {
  console.error('\n' + pc.bold('Scan Results:'));
  
  issues.forEach(issue => {
    let indicator = '●';
    let label = 'HIGH';
    let colorFn = pc.red;

    if (issue.severity === 'medium') {
      label = 'MEDIUM';
      colorFn = pc.yellow;
    } else if (issue.severity === 'dummy') {
      indicator = '○';
      label = 'IGNORED (DUMMY)';
      colorFn = pc.dim;
    }

    // Truncate match if it's too long
    let displayMatch = issue.match.replace(/\n/g, ' ').trim();
    if (displayMatch.length > 60) {
      displayMatch = displayMatch.substring(0, 57) + '...';
    }
    
    console.error(`\n  ${colorFn(indicator)} ${colorFn(pc.bold(label))} ${pc.dim('·')} ${issue.type}`);
    console.error(`    ${pc.dim('File:')}  ${issue.file}:${issue.line || '?'}`);
    console.error(`    ${pc.dim('Match:')} ${displayMatch}`);
    
    if (showSolution && issue.solution) {
      console.error(`    ${pc.dim('Fix:')}   ${pc.green(issue.solution)}`);
    }
  });
  console.error();
}
