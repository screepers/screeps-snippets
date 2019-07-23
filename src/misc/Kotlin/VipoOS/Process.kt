package example.os

import screeps.api.Game

class Process(val pid: Int, val pri: Int, val program: Program) {

    private var sleepUntil: Int = 0

    private var cpuUsage = 0.0
    private var sleepCount = 0

    private val exe = program.execute().iterator()

    fun getSleepUntil() = sleepUntil
    fun getProgramName() = program.getProgramName()
    fun getClassName() = program.getClassName()

    fun run() : Signal {
        val signal = exe.next()

        when(signal) {
            is SleepSignal -> {sleepUntil = Game.time + signal.duration; sleepCount++}
        }

        return signal
    }

    fun addCpuUsage(spent: Double){
        cpuUsage += spent
    }

    fun getCpuUsage() = cpuUsage
    fun getSleepCount() = sleepCount
}