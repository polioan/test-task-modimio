export type LoggerFn = (message: string, ...metadata: any[]) => void

export type Level = 'info' | 'warn' | 'error'

export type ILogger = Record<Level, LoggerFn>
