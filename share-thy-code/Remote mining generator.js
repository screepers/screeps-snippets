// domnomnom 1 January 2017 at 08:29

// identity function for string interpolation.
// interp`foo ${baz} bar` == `foo ${baz} bar`
const interp = (strings, ...values) => {
  const out = [];
  for (let i = 0; i < values.length; ++i) {
    out.push(strings[i]);
    out.push(values[i] + "");
  }
  out.push(strings[strings.length - 1]); // len(strings) = len(values) + 1
  return out.join("");
};

// returns an array of creepName lines. The last number represents the repeat count and where it is inserted.
// example use:  repeat`banker:${'E45N52'}_${2}`  --> ['banker:E45N52_0', 'banker:E45N52_1']
const repeat = (strings, ...values) => {
  const lines = [];
  const numRepeats = values[values.length - 1];
  for (let i = 0; i < numRepeats; ++i) {
    values[values.length - 1] = i;
    lines.push(interp(strings, ...values));
  }
  return lines;
};

// remoteMine('E45N52', [1,2], 'E45N53') -->
//     claim:E45N52
//     mine:E45N52_0
//     mine:E45N52_1
//     mule:d_E45N52_0-d_E45N53_0
//     mule:d_E45N52_1-d_E45N53_0
//     mule:d_E45N52_1-d_E45N53_1
const remoteMine = (roomName, numMulesPerSite, deliverTarget) => {
  const lines = [].concat(
    `claim:${roomName}`,
    repeat`mine:${roomName}_${numMulesPerSite.length}`,
    ...numMulesPerSite.map(
      (numMules, siteIndex) =>
        repeat`mule:d_${roomName}_${siteIndex}-d_${deliverTarget}_${numMules}`
    )
  );

  return lines.map(line => `    ${line}\n`).join("");
};
