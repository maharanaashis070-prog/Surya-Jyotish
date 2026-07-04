// ═══════════════════════════════════════════════════════════════════════
// yogaDetectionEngine.js — Vedic Yoga (planetary combination) Detection
// Extracted & cleaned from surya-ai-brain-10-1-1.html
//
// Detects classical Vedic yogas from a natal chart: Raja Yoga, Gajakesari,
// Budhaditya, Chandra-Mangal, Dhana Yoga, the five Pancha Mahapurusha yogas
// (Hamsa/Malavya/Ruchaka/Sasa — Bhadra omitted upstream), Viparita Raja Yoga,
// and the affliction Kemadruma Yoga.
//
// INPUT CONTRACT: expects the `structured.planets` array shape produced by
// chartCalculationEngine.js's calcKundli(): each planet is
//   { name, bhavaRashi (1-12 house), rashi:{idx}, ... }
// and `lagnaIdx` = structured.lagna.rashiIdx (0-11 sign index of ascendant).
//
// USAGE:
//   import { detectYogas } from './yogaDetectionEngine.js';
//   const yogas = detectYogas(kundli.structured.planets, kundli.structured.lagna.rashiIdx);
//   // -> [{ type:'raja', name:'Gajakesari Yoga', desc:'...', planets:[...], strength:'strong' }, ...]
// ═══════════════════════════════════════════════════════════════════════

// ── YOGA DETECTION ENGINE ────────────────────────────────────

  const KENDRA = [1,4,7,10];
  const TRIKONA = [1,5,9];
  const TRIK = [6,8,12];
  const UPACHAYA = [3,6,10,11];

  function norm360(x){return((x%360)+360)%360;}

  // Get house lord name from house index
  function houseLord(houseIdx, lagnaIdx){
    const SIGN_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];
    const signIdx = (lagnaIdx + houseIdx - 1) % 12;
    return SIGN_LORDS[signIdx];
  }

  function detectYogas(planets, lagnaIdx){
    const yogas = [];
    const byName = {};
    planets.forEach(p => { byName[p.name] = p; });

    const sunP = byName['Sun'], moonP = byName['Moon'], jupP = byName['Jupiter'];
    const venP = byName['Venus'], satP = byName['Saturn'], marP = byName['Mars'];
    const merP = byName['Mercury'];

    function house(p){ return p ? p.bhavaRashi : null; }

    // ── RAJA YOGAS ──
    // Kendras × Trikonas lord conjunction/exchange
    planets.forEach(p => {
      planets.forEach(q => {
        if(p.name === q.name) return;
        const ph = house(p), qh = house(q);
        if(!ph || !qh) return;
        // Lords of kendra and trikona conjoined or mutually aspecting
        const pKendra = KENDRA.includes(ph), pTrikona = TRIKONA.includes(ph);
        const qKendra = KENDRA.includes(qh), qTrikona = TRIKONA.includes(qh);
        if((pKendra && qTrikona) || (pTrikona && qKendra)){
          // Must be in same house or within 12 degrees
          if(ph === qh){
            yogas.push({
              type:'raja', name:'Raja Yoga',
              desc:`${p.name} and ${q.name} unite the power of angular and triangular houses, bestowing authority, success, and royal favour.`,
              planets:[p.name, q.name], strength: 'strong'
            });
          }
        }
      });
    });

    // ── GAJAKESARI YOGA ── Jupiter in kendra from Moon
    if(jupP && moonP){
      const moonH = house(moonP), jupH = house(jupP);
      if(moonH && jupH){
        const diff = Math.abs(jupH - moonH);
        if([0,3,6,9].includes(diff) || [0,3,6,9].includes(12-diff)){
          yogas.push({
            type:'raja', name:'Gajakesari Yoga',
            desc:'Jupiter stands in angular relation to the Moon — a supremely auspicious combination bestowing wisdom, eloquence, fame, and enduring prosperity.',
            planets:['Jupiter','Moon'], strength:'strong'
          });
        }
      }
    }

    // ── BUDHADITYA YOGA ── Sun and Mercury together
    if(sunP && merP && house(sunP) === house(merP)){
      yogas.push({
        type:'raja', name:'Budhaditya Yoga',
        desc:'The Sun and Mercury conjoin, merging solar authority with mercurial intellect — granting exceptional communication, scholarship, and professional distinction.',
        planets:['Sun','Mercury'], strength:'strong'
      });
    }

    // ── CHANDRA-MANGAL YOGA ── Moon and Mars together
    if(moonP && marP && house(moonP) === house(marP)){
      yogas.push({
        type:'dhana', name:'Chandra-Mangal Yoga',
        desc:'Moon and Mars unite emotional intuition with decisive action — a powerful yoga for wealth accumulation and business acumen.',
        planets:['Moon','Mars'], strength:'moderate'
      });
    }

    // ── DHANA YOGAS ── 2nd/11th lords in strength
    const lord2H = house(byName[houseLord(2, lagnaIdx)]);
    const lord11H = house(byName[houseLord(11, lagnaIdx)]);
    if(lord2H && (KENDRA.includes(lord2H) || TRIKONA.includes(lord2H))){
      yogas.push({
        type:'dhana', name:'Dhana Yoga (2nd Lord)',
        desc:'The lord of wealth is powerfully placed in an angular or triangular house, activating the flow of material abundance and financial stability.',
        planets:[houseLord(2, lagnaIdx)], strength:'moderate'
      });
    }

    // ── HAMSA YOGA ── Jupiter in own sign or exalted in kendra
    if(jupP){
      const jupH = house(jupP), jupSign = jupP.rashi?.idx;
      const jupOwnOrExalt = [3,8,11].includes(jupSign); // Cancer(3)=exalt, Sag(8)/Pisces(11)=own
      if(jupOwnOrExalt && jupH && KENDRA.includes(jupH)){
        yogas.push({
          type:'raja', name:'Hamsa Yoga (Pancha Mahapurusha)',
          desc:'Jupiter — the cosmic Guru — sits exalted or in own sign in an angular house. This Mahapurusha Yoga blesses with profound wisdom, spiritual authority, and distinguished fortune.',
          planets:['Jupiter'], strength:'strong'
        });
      }
    }

    // ── MALAVYA YOGA ── Venus in own/exalt in kendra
    if(venP){
      const venH = house(venP), venSign = venP.rashi?.idx;
      const venOwnOrExalt = [1,6,11].includes(venSign); // Taurus(1)/Libra(6)=own, Pisces(11)=exalt
      if(venOwnOrExalt && venH && KENDRA.includes(venH)){
        yogas.push({
          type:'raja', name:'Malavya Yoga (Pancha Mahapurusha)',
          desc:'Venus is exalted or in own sign in an angular house — the Malavya Mahapurusha Yoga granting extraordinary beauty, artistic genius, material pleasures, and romantic magnetism.',
          planets:['Venus'], strength:'strong'
        });
      }
    }

    // ── RUCHAKA YOGA ── Mars in own/exalt in kendra
    if(marP){
      const marH = house(marP), marSign = marP.rashi?.idx;
      const marOwnOrExalt = [0,7,9].includes(marSign); // Aries(0)/Scorpio(7)=own, Capricorn(9)=exalt
      if(marOwnOrExalt && marH && KENDRA.includes(marH)){
        yogas.push({
          type:'raja', name:'Ruchaka Yoga (Pancha Mahapurusha)',
          desc:'Mars blazes from its own or exalted sign in a kendra — the Ruchaka Mahapurusha Yoga conferring exceptional physical vitality, courage, authority, and capacity for achievement.',
          planets:['Mars'], strength:'strong'
        });
      }
    }

    // ── SASA YOGA ── Saturn in own/exalt in kendra
    if(satP){
      const satH = house(satP), satSign = satP.rashi?.idx;
      const satOwnOrExalt = [6,9,10].includes(satSign); // Libra(6)=exalt, Cap(9)/Aqua(10)=own
      if(satOwnOrExalt && satH && KENDRA.includes(satH)){
        yogas.push({
          type:'raja', name:'Sasa Yoga (Pancha Mahapurusha)',
          desc:'Saturn commands from own or exalted sign in an angle — the Sasa Mahapurusha Yoga granting mastery over masses, administrative power, and the discipline to build enduring legacies.',
          planets:['Saturn'], strength:'strong'
        });
      }
    }

    // ── VIPARITA RAJA YOGA ── Trik lords in trik houses
    const trikLords = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'].filter(n=>{
      const p = byName[n]; if(!p) return false;
      return TRIK.includes(house(p));
    });
    if(trikLords.length >= 2){
      yogas.push({
        type:'nabhasa', name:'Viparita Raja Yoga',
        desc:`The lords of difficult houses retire into each other's domains — a paradoxical inversion that transmutes obstacles into unexpected power and rises after adversity.`,
        planets: trikLords.slice(0,2), strength:'moderate'
      });
    }

    // ── KEMADRUMA YOGA ── Moon with no planets in adjacent houses (affliction)
    if(moonP){
      const mH = house(moonP);
      if(mH){
        const adj1 = ((mH-2+12)%12)+1, adj2 = (mH%12)+1;
        const hasAdj = planets.some(p => p.name !== 'Moon' && p.name !== 'Rahu' && p.name !== 'Ketu' && (house(p)===adj1 || house(p)===adj2));
        if(!hasAdj){
          yogas.push({
            type:'duryoga', name:'Kemadruma Yoga',
            desc:'The Moon stands alone with no planetary support in adjacent houses — bringing periods of isolation, unexpected reversals, and the need to cultivate inner resilience.',
            planets:['Moon'], strength:'weak'
          });
        }
      }
    }

    // Deduplicate by name
    const seen = new Set();
    return yogas.filter(y => {
      if(seen.has(y.name)) return false;
      seen.add(y.name); return true;
    });
  }

export { detectYogas };
