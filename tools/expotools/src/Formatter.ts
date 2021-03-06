import chalk from 'chalk';
import terminalLink from 'terminal-link';

import { GitLog, GitFileLog } from './Git';

const { green, yellow, blue, gray, dim, reset } = chalk;

/**
 * Uses `terminal-link` to create clickable link in the terminal.
 * If the terminal doesn't support this feature, fallback just to provided text, it would look ugly on the CI.
 */
export function link(text: string, url: string) {
  return terminalLink(text, url, { fallback: (text) => text });
}

/**
 * Formats an entry from git log.
 */
export function formatCommitLog(log: GitLog): string {
  const authorName = green(log.authorName);
  const commitHash = formatCommitHash(log.hash);
  const title = formatCommitTitle(log.title);
  const date = log.committerRelativeDate;

  return `${commitHash} ${title} ${gray(`by ${authorName} ${date}`)}`;
}

/**
 * Formats commit title. So far it only makes closing PR number a link to the PR on GitHub.
 */
export function formatCommitTitle(title: string): string {
  return title.replace(
    /\(#(\d+)\)$/g,
    `(${blue.bold(link('#$1', 'https://github.com/expo/expo/pull/$1'))})`
  );
}

/**
 * Formats commit hash to display it as a link pointing to the commit on GitHub.
 */
export function formatCommitHash(hash?: string): string {
  if (!hash) {
    return gray('undefined');
  }
  const url = `https://github.com/expo/expo/commit/${hash}`;
  const abbreviatedHash = hash.substring(0, 6);

  return yellow.bold(`(${link(abbreviatedHash, url)})`);
}

/**
 * Formats markdown changelog entry to be displayed nicely in the terminal.
 * Replaces links to terminal chars sequence that prints clickable text pointing to given URL.
 */
export function formatChangelogEntry(entry: string): string {
  return entry
    .replace(/\[(#\d+|@\w+)\]\(([^)]+?)\)/g, blue.bold(link('$1', '$2')))
    .replace(/(\W)([_*]{2})([^\2]*?)\2(\W)/g, '$1' + reset.bold('$3') + '$4')
    .replace(/(\W)([_*])([^\2]*?)\2(\W)/g, '$1' + reset.italic('$3') + '$4')
    .replace(/`([^`]+?)`/g, dim('$1'));
}

/**
 * Formats file log - that is a relative file path and the status (modified, added, etc.).
 */
export function formatFileLog(fileLog: GitFileLog): string {
  const uri = `vscode://file/${fileLog.path}`;
  return `${link(fileLog.relativePath, uri)} ${gray(`(${fileLog.status})`)}`;
}

/**
 * Removes all non-ascii characters (characters with unicode number between `0` and `127` are left untouched) from the string.
 * https://www.utf8-chartable.de/unicode-utf8-table.pl?number=128
 */
export function stripNonAsciiChars(str: string): string {
  return str.replace(/[^\x00-\x7F]/gu, '');
}
