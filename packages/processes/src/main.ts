import { spawn } from 'child_process'
import type { ChildProcess } from 'child_process'
import { parseArgs } from 'node:util'
import terminate from 'terminate'

type Command = {
  name: string
  waitForCompletion: boolean
  sleepSecondsBefore: number
}

type CommandOptions = { wait?: boolean; sleepSecondsBefore?: number }

const command = (script: string, options: CommandOptions = {}): Command => {
  const { wait = false, sleepSecondsBefore = 0 } = options
  return {
    name: `bun run --cwd ../.. ${script}`,
    waitForCompletion: wait,
    sleepSecondsBefore,
  }
}

const parseArguments = (): { reset: boolean } => {
  const { values } = parseArgs({
    options: {
      reset: { type: 'boolean', default: false },
    },
  })

  return { reset: values.reset }
}

const runCommand = (command: Command): Promise<ChildProcess> => {
  return new Promise(async (resolve, reject) => {
    const [cmd, ...args] = command.name.split(' ')

    if (command.sleepSecondsBefore) {
      await Bun.sleep(1000 * command.sleepSecondsBefore)
    }
    console.info(`Running: ${command.name}`)

    const process = spawn(cmd, args, { stdio: 'inherit' })
    const childProcess: ChildProcess = process

    if (!command.waitForCompletion) {
      resolve(childProcess)
      console.info(`Process completed: ${command.name}`)
      return
    }

    process.on('close', (code) => {
      if (code !== 0) {
        reject(
          new Error(`Command "${command.name}" failed with exit code ${code}`)
        )
        return
      }
      resolve(childProcess)
      console.info(`Process completed: ${command.name}`)
    })

    process.on('error', (err) => {
      reject(
        new Error(`Failed to start command "${command.name}": ${err.message}`)
      )
    })
  })
}

const runSequence = async (commands: Command[]): Promise<ChildProcess[]> => {
  const processes: ChildProcess[] = []

  for (const command of commands) {
    try {
      const process = await runCommand(command)
      if (!command.waitForCompletion) {
        processes.push(process)
      }
    } catch (error) {
      console.error(error)
      processes.forEach((p) => {
        if (p.pid) {
          terminate(p.pid)
        }
      })
      process.exit(1)
    }
  }

  return processes
}

const setupCleanup = (processes: ChildProcess[]): void => {
  const cleanup = (): void => {
    console.info('\nTerminating all processes...')
    processes.forEach((p) => {
      if (p.pid) {
        terminate(p.pid)
      }
    })
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

const main = async (): Promise<void> => {
  const { reset } = parseArguments()

  const commonCommands: Command[] = [command('web:dev')]

  const resetCommands: Command[] = [
    command('anvil:new'),
    command('contract:deploy', { wait: true }),
    ...commonCommands,
  ]

  const standardCommands: Command[] = [
    command('anvil:state'),
    ...commonCommands,
  ]

  const commands = reset ? resetCommands : standardCommands
  const processes = await runSequence(commands)

  setupCleanup(processes)
  console.info('All commands started. Press Ctrl+C to terminate.')
}

main().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
