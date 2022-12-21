
```js
// PHASE 3
/\by/g                                  // words starting y; yes, yellow, etc
/er\b/g                                 // words ending er

// PHASE 5: no meta sequences
a.e e.e i.e o.e u[^r]e                  // magic e words (came, these, like, bone, june). not -ure words, as these are phase 3 (pure, cure, etc)
q(?!u)                                  // q with no following u (qatar)
(?<=a)ti(?=on|a)                        // the 'ti' in -ation or -atia, but not others, e.g. patio
(?<=gr|l)ow(?!l)                        // the 'ow' in -grow or -low, but not growl
(?<=nd|sh|t)ow                          // the 'ow' in window, -show and -tow
(?<=b)ow(?=l)                           // the 'ow' in bowl, but not bow

//PHASE 5: with meta sequences
/er\B/g                                 // er not at end of word (otherwise phase 3)
/\By/g                                  // y not at start of word
/\buni/g                                // uni- as prefix (universe, unicycle, etc)
/[aeiou]c[aeiouy]/g                     // s sound from 'c', (ace, icy, etc)
/\bcy/g                                 // cy- as prefix (cycle, cyborg, etc)
/(?<=\bs)ch/g                           // the 'ch' in the sch- prefix (school, schedule, etc)
/\bch(?=r)/g                            // the 'ch' in the chr- prefix (chrome, christmas, etc)
/\bch(?=em)/g                           // the 'ch' in the chem- prefix (chemical, chemistry, etc)
/(?<=te)ch/g                            // the 'ch' in tech (technique, nanotech, etc)
/(?<=\ba|[^eo]a)ch(?=e\b|es\b)/g        // the 'ch' in -ache or -aches, excluding -eaches (beaches etc) or -oaches (coaches etc)
/mb\b/g                                 // -mb as suffix (comb, thumb, etc)
```