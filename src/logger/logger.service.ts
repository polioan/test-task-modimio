import { injectable } from 'inversify'
import type { ILogger, Level } from './logger.interface.js'
import { format } from 'date-fns'
import { inspect } from 'node:util'

@injectable()
export class LoggerService implements ILogger {
  private log(level: Level, message: string, metadata: any[]) {
    const string = `${level.toUpperCase()} ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')} ${message} ${metadata.map(m => inspect(m)).join(' ')}`
    console[level](string)
  }

  public info(message: string, ...metadata: any[]) {
    this.log('info', message, metadata)
  }

  public warn(message: string, ...metadata: any[]) {
    this.log('warn', message, metadata)
  }

  public error(message: string, ...metadata: any[]) {
    this.log('error', message, metadata)
  }
}
