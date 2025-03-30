export enum LogLevels {
  'fatal' = 'fatal',
  'error' = 'error',
  'warn' = 'warn',
  'info' = 'info',
  'debug' = 'debug',
}

export interface LogConfig {
  folder: string;
  filename: string; // %index% will be replaced with 0, 1, ..., maxCount
  maxSize: number;
  maxCount: number;
  outToFile: boolean;
  outToConsole: boolean;
  level: LogLevels;
}

export const DEFAULT_LOG_FILENAME = 'log-%index%.log';
export const defaultLogConfig = {
  folder: './log/',
  filename: DEFAULT_LOG_FILENAME, // %index% will be replaced with 0, 1, ..., maxCount-1, default is 0
  maxSize: 1024 * 1024 * 1,
  maxCount: 5,
  outToFile: true,
  outToConsole: true,
  level: LogLevels.debug,
};

export interface MessageFromSubProcess {
  id: string;
  pid: number | undefined;
  uuid?: string;
  level: string;
  namespace: string;
  color: LoggerColors | undefined;
  messageList: (string | number | object)[];
}

// Colors for console
// https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
export const enum LoggerColors {
  Black = 0,
  Red = 1,
  Green = 2,
  Yellow = 3,
  Blue = 4,
  Magenta = 5,
  Cyan = 6,
  White = 7,
  BrightBlack = 8,
  BrightRed = 9,
  BrightGreen = 10,
  BrightYellow = 11,
  BrightBlue = 12,
  BrightMagenta = 13,
  BrightCyan = 14,
  BrightWhite = 15,
}
