import { confirm, select, checkbox } from '@inquirer/prompts';

export async function confirmAction(message: string, defaultValue = true): Promise<boolean> {
  return confirm({ message, default: defaultValue });
}

export async function selectOption<T extends string>(
  message: string,
  choices: { name: string; value: T }[],
): Promise<T> {
  return select({ message, choices });
}

export async function selectMultiple(
  message: string,
  choices: { name: string; value: string; checked?: boolean }[],
): Promise<string[]> {
  return checkbox({ message, choices });
}

export type ConflictResolution = 'remote' | 'local' | 'skip';

export async function resolveConflict(filename: string): Promise<ConflictResolution> {
  return select({
    message: `How to resolve ${filename}?`,
    choices: [
      { name: 'Keep remote version', value: 'remote' as const },
      { name: 'Keep local version', value: 'local' as const },
      { name: 'Skip (do nothing)', value: 'skip' as const },
    ],
  });
}
