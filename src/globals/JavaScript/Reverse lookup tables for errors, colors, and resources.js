// warinternal 27 February 2017 at 04:41

/**
 * Lookup tables
 */
global.MSG_ERR = _(global)
	.pick((v,k) => k.startsWith('ERR_'))
	.invert()
	.value();
MSG_ERR[OK] = "OK";
​
global.MSG_COLOR = _(global)
	.pick((v,k) => k.startsWith('COLOR_'))
	.invert()
	.value();
	
global.MSG_FIND = _(global)
	.pick((v,k) => k.startsWith('FIND_'))
	.invert()
	.value();
	
global.MSG_STRUCT = _(global)
	.pick((v,k) => k.startsWith('STRUCTURE_'))
	.invert()
	.value();
	
global.MSG_RES = _(global)
	.pick((v,k) => k.startsWith('RESOURCE_'))
	.invert()
	.value();