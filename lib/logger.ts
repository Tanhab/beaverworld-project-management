// lib/logger.ts
import * as Sentry from "@sentry/nextjs";

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogData {
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, message: string, data?: LogData) {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    if (level === 'error') {
      // Always log errors
      console.error(prefix, message, data || '')
      
      // Send to Sentry in production
      if (!this.isDevelopment) {
        Sentry.captureException(new Error(message), {
          level: 'error',
          extra: data,
        })
      }
    } else if (this.isDevelopment) {
      // Log other levels only in development
      switch (level) {
        case 'info':
          console.log(prefix, message, data || '')
          break
        case 'warn':
          console.warn(prefix, message, data || '')
          // Send warnings to Sentry too
          if (!this.isDevelopment) {
            Sentry.captureMessage(message, {
              level: 'warning',
              extra: data,
            })
          }
          break
        case 'debug':
          console.debug(prefix, message, data || '')
          break
      }
    }
  }

  info(message: string, data?: LogData) {
    this.log('info', message, data)
  }

  warn(message: string, data?: LogData) {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error | any, data?: LogData) {
    const errorData = {
      ...data,
      error: error?.message || error,
      stack: error?.stack,
    }
    
    this.log('error', message, errorData)
    
    // Send the actual error to Sentry (better stack traces)
    if (!this.isDevelopment && error instanceof Error) {
      Sentry.captureException(error, {
        extra: data,
      })
    }
  }

  debug(message: string, data?: LogData) {
    this.log('debug', message, data)
  }

  // Sentry-specific methods
  setUser(user: { id: string; email?: string; username?: string }) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    })
  }

  clearUser() {
    Sentry.setUser(null)
  }

  addBreadcrumb(message: string, data?: LogData) {
    Sentry.addBreadcrumb({
      message,
      data,
      level: 'info',
    })
  }
}

export const logger = new Logger()