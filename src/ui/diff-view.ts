import chalk from 'chalk';
import { createPatch } from 'diff';

export function showDiff(filename: string, oldContent: string, newContent: string): void {
  const patch = createPatch(filename, oldContent, newContent, 'local', 'remote');
  const lines = patch.split('\n');

  // Skip the first 4 header lines of unified diff
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('@@')) {
      console.log(chalk.cyan(line));
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      console.log(chalk.green(line));
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      console.log(chalk.red(line));
    } else if (line.startsWith('---') || line.startsWith('+++')) {
      console.log(chalk.dim(line));
    } else {
      console.log(line);
    }
  }
}

export function showPreview(content: string, maxLines = 10): void {
  const lines = content.split('\n');
  const preview = lines.slice(0, maxLines);

  for (const line of preview) {
    console.log(chalk.dim(`  │ ${line}`));
  }

  if (lines.length > maxLines) {
    console.log(chalk.dim(`  │ ... (${lines.length - maxLines} more lines)`));
  }
}
