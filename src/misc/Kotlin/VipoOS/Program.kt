package example.os

abstract class Program {

    private val className by lazy { this::class.simpleName ?: "Unknown" }

    abstract fun execute() : Sequence<Signal>

    open fun getProgramName() = getClassName()

    fun getClassName() = className
}