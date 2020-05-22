package example.os

import screeps.api.Game

class Scheduler {
    var pid = 0

    private val processes = mutableMapOf<Int, Process>()
    private val runningProcesses = mutableListOf<Process>()
    private val sleepingProcesses = mutableListOf<Process>()

    fun getNextProcess() = runningProcesses.firstOrNull()

    // Only call these when a process gets added to one of the lists.
    private fun reorderRunningProcesses() = runningProcesses.sortBy { it.pri }
    private fun reorderSleepingProcesses() = sleepingProcesses.sortBy { it.getSleepUntil() }

    fun spawnProcess(program: Program, pri: Int) : Process {
        val newPid = pid++
        val newProcess = Process(newPid, pri, program)

        processes[newPid] = newProcess
        runningProcesses.add(newProcess)
        reorderRunningProcesses()

        return newProcess
    }

    fun killProcess(process: Process) {
        processes.remove(process.pid)
        runningProcesses.remove(process)
        sleepingProcesses.remove(process)
    }

    fun sleepProcess(process: Process) {
        runningProcesses.remove(process)
        sleepingProcesses.add(process)

        reorderSleepingProcesses()
    }

    fun wakeSleepingProcesses() {
        if(sleepingProcesses.isEmpty())
            return

        val wakeUp = mutableListOf<Process>()

        while(sleepingProcesses.first().getSleepUntil() <= Game.time)
            wakeUp.add(sleepingProcesses.removeAt(0))

        runningProcesses.addAll(wakeUp)

        if(wakeUp.isNotEmpty())
            reorderRunningProcesses()
    }

    fun printStats() {
        console.log("Scheduler has ${processes.size} processes (${runningProcesses.size} running, ${sleepingProcesses.size} sleeping)")
        console.log("Running:")
        if(runningProcesses.isNotEmpty())
            runningProcesses.forEach { console.log("Pid ${it.pid} (${it.pri}) : ${it.getProgramName()} " +
                "${it.getCpuUsage().toString().take(5)} CPU spent over ${it.getSleepCount()} sleeps (${(it.getCpuUsage() / it.getSleepCount()).toString().take(5)}/sleep)") }
        console.log("Sleeping:")
        if(sleepingProcesses.isNotEmpty())
            sleepingProcesses.forEach { console.log("Pid ${it.pid} : ${it.getProgramName()} (${it.getSleepUntil() - Game.time} ticks left) " +
                "${it.getCpuUsage().toString().take(5)} CPU spent over ${it.getSleepCount()} sleeps (${(it.getCpuUsage() / it.getSleepCount()).toString().take(5)}/sleep)") }
    }
}