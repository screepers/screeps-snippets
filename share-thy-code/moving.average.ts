// unfleshedone 2 May 2017 at 07:12
export class MovingAverage
{
	public static Setup(name: string, memory: any, timespan: number)
	{
		if (memory[name] === undefined)
			memory[name] = new MovingAverage(timespan);
		else
			Object.setPrototypeOf(memory[name], MovingAverage.prototype);
	}

	private _movingAverage: number = 0;
	private _variance: number = 0;

	private count: number = 0;

	private _startTime?: number;

	private previousTime?: number;

	private previousResetTime?: number;

	private intermediateTotal?: number;

	private _runningTotal: number = 0;
	private _min?: number;
	private _max?: number;

	public get runningTotal() { return this._runningTotal; }

	public get min() { return this._min; }

	public get max() { return this._max; }

	public get startTime() { return this._startTime; }

	public get movingAverage()
	{
		if (this.previousTime && Game.time - this.previousTime > 10)
			this.push(0);

		return this._movingAverage;
	}

	public get variance() { return this._variance / this.count; }

	constructor(private timespan: number, private accumulateFor?: number)
	{
	}

	public push(incoming: number)
	{
		const time = Game.time;

		this.updateStartTime(time);
		this.updateTotal(incoming);

		const { value, final } = this.updateAccumulator(incoming, time);

		if (final)
		{
			this.updateMinMax(value);
			this.updateMA(value, time);
			this.updateCount();
		}
	}

	protected updateStartTime(time: number)
	{
		if (this._startTime === undefined)
			this._startTime = time;
	}

	protected updateTotal(value: number)
	{
		this._runningTotal += value;
	}

	protected updateMinMax(value: number)
	{
		if (this._min === undefined || this._min > value)
			this._min = value;
		if (this._max === undefined || this._max < value)
			this._max = value;
	}

	protected updateMA(value: number, time: number)
	{
		if (this.previousTime)
		{
			// calculate moving average
			const a = this.alpha(time, this.previousTime);
			const previousMa = this._movingAverage;
			this._movingAverage = a * value + (1 - a) * this._movingAverage;

			// calculate variance
			this._variance += (value - previousMa) * (value - this._movingAverage);
		}
		else
			this._movingAverage = value;
		this.previousTime = time;
	}

	protected updateCount()
	{
		this.count++;
	}

	protected alpha(t: number, pt: number)
	{
		return 1 - (Math.exp(- (t - pt) / this.timespan));
	}

	protected updateAccumulator(value: number, time: number): { value: number; final: boolean; }
	{
		if (this.accumulateFor === undefined)
			return { value, final: true };

		if (!this.previousResetTime)
			this.previousResetTime = time;

		if (this.intermediateTotal === undefined)
			this.intermediateTotal = value;
		else
			this.intermediateTotal += value;

		const out = this.intermediateTotal;
		const final = time - this.previousResetTime > this.accumulateFor;

		if (final)
		{
			this.intermediateTotal = 0;
			this.previousResetTime = time;
		}

		return { value: out, final };
	}
}