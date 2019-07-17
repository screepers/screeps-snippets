// warinternal 13 March 2017 at 03:44

/**
 * Simple benchmark test with sanity check
 *
 * Usage: benchmark([
 *		() => doThing(),
 *		() => doThingAnotherWay(),
 * ]);
 *
 * Output:
 *
 * Benchmark results, 1 loop(s):
 * Time: 1.345, Avg: 1.345, Function: () => doThing()
 * Time: 1.118, Avg: 1.118, Function: () => doThingAnotherWay()
 */
function benchmark(arr, iter = 1) {
  var exp,
    r,
    i,
    j,
    len = arr.length;
  var start, end, used;
  var results = _.map(arr, fn => ({ fn: fn.toString(), time: 0, avg: 0 }));
  for (j = 0; j < iter; j++) {
    for (i = 0; i < len; i++) {
      start = Game.cpu.getUsed();
      results[i].rtn = arr[i]();
      used = Game.cpu.getUsed() - start;
      if (i > 0 && results[i].rtn != results[0].rtn)
        throw new Error("Results are not the same!");
      results[i].time += used;
    }
  }
  console.log(`Benchmark results, ${iter} loop(s): `);
  _.each(results, res => {
    res.avg = _.round(res.time / iter, 3);
    res.time = _.round(res.time, 3);
    console.log(`Time: ${res.time}, Avg: ${res.avg}, Function: ${res.fn}`);
  });
}
