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
  if (issues.length === 0) return;
  console.error('\n' + pc.bold('Scan Results:'));
  
  // Sort by severity: high > medium > dummy
  const severityWeight: Record<string, number> = { high: 3, medium: 2, dummy: 1 };
  const sortedIssues = [...issues].sort((a, b) => {
    return (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0);
  });

  // Group by file and rule type to prevent fatigue
  const grouped = new Map<string, any[]>();
  for (const issue of sortedIssues) {
    const key = `${issue.file}:::${issue.type}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(issue);
  }

  // Iterate and print
  for (const [key, group] of grouped.entries()) {
    const displayCount = Math.min(group.length, 3);
    for (let i = 0; i < displayCount; i++) {
      const issue = group[i];
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
      
      if (issue.risk) {
        console.error(`    ${pc.dim('Risk:')}  ${pc.yellow(issue.risk)}`);
      }

      if (showSolution && issue.solution) {
        console.error(`    ${pc.dim('Fix:')}   ${pc.green(issue.solution)}`);
      }
    }
    
    // Print fatigue warning if there are more
    if (group.length > 3) {
      console.error(`\n    ${pc.cyan(`... and ${group.length - 3} more similar issues in ${group[0].file}`)}`);
    }
  }
  
  console.error();
}
