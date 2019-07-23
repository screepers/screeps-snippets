package example.os.programs


import example.os.*

class Demo(private val id: Int) : Program() {

    override fun getProgramName() = getClassName() + " ($id)"

    override fun execute(): Sequence<Signal> {
        return sequence {
            var i = 0
            var someCondition = false

            val name = getProgramName()

            console.log("This is program $name going to do a normal Yield")
            yield(YieldSignal())

            console.log("This is program $name going to sleep one tick")
            yield(SleepSignal(1))

            while(true) {
                if(someCondition)
                    yield(ExitSignal(0))

                console.log("This is program $name in forever loop: ${i++}")
                yield(SleepSignal(1))
            }
        }
    }
}