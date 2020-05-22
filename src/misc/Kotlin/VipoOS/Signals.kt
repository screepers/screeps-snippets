package example.os

// This is for being able to print ${signal.type} when we don't know the subclass
enum class SignalType {
    EXIT,
    SLEEP,
    YIELD
}

abstract class Signal(val type: SignalType)

class ExitSignal(val exitCode: Int) : Signal(SignalType.EXIT)

class SleepSignal(val duration: Int) : Signal(SignalType.SLEEP)

class YieldSignal : Signal(SignalType.YIELD)