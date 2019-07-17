// unfleshedone 3 June 2017 at 20:56
// ===================================================
// Usage:
// For telling right side of the creep what his left side is doing.

if (creep.intentTracker.canMove())
	creep.move(...)
			   
if (creep.intentTracker.canAttack())
	creep.attack(...)

// ===================================================
// intent.tracker.d.ts

interface IIntentTracker
{
	canMove(): boolean;
	canHarvest(): boolean;
	canAttack(): boolean;
	canBuild(): boolean;
	canRepair(): boolean;
	canDismantle(): boolean;
	canAttackController(): boolean;
	canRangedHeal(): boolean;
	canHeal(): boolean;
	canRangedAttack(): boolean;
	canRangedMassAttack(): boolean;
	canUpgradeController(): boolean;
	canClaimController(): boolean;
	canTransfer(): boolean;
	canWithdraw(): boolean;
	canDrop(): boolean;
	canPickup(): boolean;
}

interface Creep
{
	readonly intentTracker: IIntentTracker;
}

// ===================================================
// intent.tracker.ts

enum Buckets
{
	eMeleePipeline,
	eRangedPipeline,
}

type HostType = Creep;

interface IIntent
{
	args: any[];
}

export class IntentTracker implements IIntentTracker
{
	public static WrapIntents(host: HostType)
	{
		if ((host as any)._intentsWrapped)
			return;
		(host as any)._intentsWrapped = true;

		IntentTracker.WrapIntent(host, "harvest");
		IntentTracker.WrapIntent(host, "attack");
		IntentTracker.WrapIntent(host, "build");
		IntentTracker.WrapIntent(host, "repair");
		IntentTracker.WrapIntent(host, "dismantle");
		IntentTracker.WrapIntent(host, "attackController");
		IntentTracker.WrapIntent(host, "rangedHeal");
		IntentTracker.WrapIntent(host, "heal");
		IntentTracker.WrapIntent(host, "rangedAttack");
		IntentTracker.WrapIntent(host, "rangedMassAttack");

		IntentTracker.WrapIntent(host, "upgradeController");
		IntentTracker.WrapIntent(host, "claimController");
		IntentTracker.WrapIntent(host, "move");
		IntentTracker.WrapIntent(host, "transfer");
		IntentTracker.WrapIntent(host, "withdraw");
		IntentTracker.WrapIntent(host, "drop");
		IntentTracker.WrapIntent(host, "pickup");
	}

	private static WrapIntent(host: HostType, functionName: string)
	{
		const descriptor = Object.getOwnPropertyDescriptor(host, functionName);
		if (!descriptor)
			return;

		const hasAccessor = descriptor.get || descriptor.set;
		if (hasAccessor)
			return;

		const isFunction = typeof descriptor.value === "function";
		if (!isFunction)
			return;

		const originalFunction = (host as any)[functionName];

		let buckets = IntentTracker.Pipelines[functionName];
		if (buckets === undefined)
			buckets = [];

		(host as any)[functionName] = function(this: any, ...args: any[])
		{
			const res = originalFunction.apply(this, args);
			if (res === OK)
				this.intentTracker.onIntent(functionName, buckets, args);
			return res;
		};
	}

	private static Pipelines: { [name: string]: Buckets[] } =
	{
		attack: [Buckets.eMeleePipeline],
		harvest: [Buckets.eMeleePipeline],
		build: [Buckets.eMeleePipeline, Buckets.eRangedPipeline],
		repair: [Buckets.eMeleePipeline, Buckets.eRangedPipeline],
		dismantle: [Buckets.eMeleePipeline],
		attackController: [Buckets.eMeleePipeline],
		rangedHeal: [Buckets.eMeleePipeline, Buckets.eRangedPipeline],
		heal: [Buckets.eMeleePipeline],
		rangedAttack: [Buckets.eRangedPipeline],
		rangedMassAttack: [Buckets.eRangedPipeline],
	};

	private pipelines: Set<Buckets> = new Set();
	private intents: Map<string, IIntent> = new Map();

	public onIntent(name: string, buckets: Buckets[], args: any[])
	{
		this.intents.set(name, { args });
		_.each(buckets, (b) => this.pipelines.add(b));
	}

	private checkIntent(name: string): boolean
	{
		const buckets = IntentTracker.Pipelines[name];

		if (buckets === undefined)
			return !this.intents.has(name);
		else
			return _.all(buckets, (b) => !this.pipelines.has(b));
	}

	public canMove(): boolean
	{
		return this.checkIntent("move");
	}
	public canHarvest(): boolean
	{
		return this.checkIntent("harvest");
	}
	public canTransfer(): boolean
	{
		return this.checkIntent("transfer");
	}
	public canAttack(): boolean
	{
		return this.checkIntent("attack");
	}
	public canBuild(): boolean
	{
		return this.checkIntent("build");
	}
	public canRepair(): boolean
	{
		return this.checkIntent("repair");
	}
	public canDismantle(): boolean
	{
		return this.checkIntent("dismantle");
	}
	public canAttackController(): boolean
	{
		return this.checkIntent("attackController");
	}
	public canRangedHeal(): boolean
	{
		return this.checkIntent("rangedHeal");
	}
	public canHeal(): boolean
	{
		return this.checkIntent("heal");
	}
	public canRangedAttack(): boolean
	{
		return this.checkIntent("rangedAttack");
	}
	public canRangedMassAttack(): boolean
	{
		return this.checkIntent("rangedMassAttack");
	}
	public canUpgradeController(): boolean
	{
		return this.checkIntent("upgradeController");
	}
	public canClaimController(): boolean
	{
		return this.checkIntent("claimController");
	}
	public canWithdraw(): boolean
	{
		return this.checkIntent("withdraw");
	}
	public canDrop(): boolean
	{
		return this.checkIntent("drop");
	}
	public canPickup(): boolean
	{
		return this.checkIntent("pickup");
	}
}

// ===================================================
// main.ts

if (!Creep.prototype.hasOwnProperty("intentTracker"))
{
	Object.defineProperty(Creep.prototype, "intentTracker",
	{
		get(this: any)
		{
			if (this.__intentTracker === undefined)
				this.__intentTracker = new IntentTracker();
			return this.__intentTracker;
		},
		configurable: false,
		enumerable: false,
	});
}
	
export function loop()
{
	// run this before screeps-profiler wrap
	IntentTracker.WrapIntents(Creep.prototype);

	// main loop
}