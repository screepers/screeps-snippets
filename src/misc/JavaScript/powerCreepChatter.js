/**
 * Posted 30 June 2019 by @kittytack 
 * If I can opgen, do opgen...
 */
if (creep.usePower(PWR_GENERATE_OPS) == OK) {
    const noises = ['Meow', 'Ding', 'Beep', 'Purr']; // Array of random noises
    const punctuations = ['!', '...', '~', '.']; // Array of random punctuation
    creep.say(_.sample(noises) + _.sample(punctuations), true); // Say a random noise, followed by a random punctuation
}