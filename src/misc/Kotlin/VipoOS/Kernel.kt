package example.os

import screeps.api.Game

class Kernel {

    private val scheduler = Scheduler()

    private val maxCpu = 16 // Running on shard 3, leaving some cpu for the final processing of statistics and saving of memory

    fun spawnProcess(program: Program, pri: Int) = scheduler.spawnProcess(program, pri)

    fun loop() {
        console.log()
        console.log("Starting kernel loop with ${(maxCpu - Game.cpu.getUsed()).toString().take(5)} cpu left")

        if(true)
            scheduler.printStats()

        scheduler.wakeSleepingProcesses()

        while (Game.cpu.getUsed() < maxCpu) {
            val process = scheduler.getNextProcess() ?: break

            val startCpu = Game.cpu.getUsed()
            var signal: Signal? = null

            try {
                signal = process.run()
            } catch (e: Exception) {
                console.log("<span style='color:red'>Got exception while running pid ${process.pid} (${process.getProgramName()}) : $e</span>")
                signal = SleepSignal(1)
            }
            val spentCpu = Game.cpu.getUsed() - startCpu
            process.addCpuUsage(spentCpu)

            when(signal) {
                is ExitSignal -> scheduler.killProcess(process)
                is SleepSignal -> scheduler.sleepProcess(process)
            }
        }
    }
}