// providers/offlineOracle.js — Cosmic Memory Fallback (always works, no network)

const RESPONSES = [
  `The planets do not speak in coincidences — they speak in certainties arranged across time. In your current dasha cycle, the lord of your ascendant is engaged in a subtle but unmistakable dialogue with Saturn, the great teacher who never rushes and never abandons. This is a period asking you to lay foundations that will not crack when tested by greater storms. The work you do with discipline and attention to dharmic detail now will compound in ways that become visible only three to five years hence.

Your Moon's nakshatra placement reveals a soul that carries its wisdom quietly, almost invisibly — but there are seasons when quiet strength becomes the very force that moves mountains. This is one of those seasons. Career matters are under slow but real restructuring; resist the urge to force outcomes, as the 10th house lord is in a holding pattern that breaks decisively after the current antardasha completes.

In the domain of relationships, Venus is gathering strength. A connection either deepens meaningfully or a new one enters with surprising sincerity. Financial matters require patience through the short term but the 2nd and 11th lords are in conversation — gains are not absent, merely deferred. The remedy is simple and time-tested: offer water to the rising Sun for seven consecutive mornings, and notice what shifts in your inner clarity by the seventh day.

PREDICTION_JSON:
{"career_growth":62,"financial_gain":55,"relationship_harmony":70,"health_stability":68,"mental_clarity":74,"spiritual_progress":80,"risk_factor":35,"favorable_period_days":47,"key_focus_area":"Building lasting foundations","recommended_action":"Offer water to rising Sun for 7 mornings"}`,

  `What the chart reveals is rarely what the person expects to hear — and yet, in its honesty, it delivers the most profound relief. Jupiter, the great benefic, is currently casting its full drishti upon the 9th house, the seat of dharma, higher wisdom, and the blessings that arrive not through effort but through alignment with one's true purpose. This is a rare configuration, one that astrologers historically associated with the arrival of teachers, meaningful journeys, or sudden philosophical clarity that reorganises the entire inner world.

Saturn's concurrent position ensures this blessing does not arrive in ways that bypass the growth it is meant to catalyse. You will likely feel the expansion and the resistance simultaneously — this is not confusion, this is the loom of karma weaving something that requires both threads. Career timing is favourable for a significant pivot in the next 6–14 months; the 10th house receives benefic aspect and the dasha lords agree on forward movement.

Relationships and emotional wellbeing are highlighted by a strong Moon nakshatra activation. Someone from the past may re-enter with renewed purpose, or a current bond deepens into genuine partnership. Financially, the 2nd and 11th house lords are in mutual reception — a period of measurable income growth approaches. Chant the Guru Vandana at dawn when possible; it opens the channel between personal effort and cosmic grace.

PREDICTION_JSON:
{"career_growth":71,"financial_gain":65,"relationship_harmony":63,"health_stability":72,"mental_clarity":82,"spiritual_progress":91,"risk_factor":28,"favorable_period_days":63,"key_focus_area":"Dharmic alignment and higher wisdom","recommended_action":"Chant Guru Vandana at dawn"}`,

  `Rahu's placement in your chart is not a curse — it is the precise location where your soul chose to be most hungry, most driven, and ultimately most transformed. The shadow planet does not take away; it intensifies the desire until the desire either consumes or illuminates the seeker. In this current phase, Rahu's energy is activating the 11th house — the house of gains, networks, and the fulfilment of long-held aspirations.

Simultaneously, Ketu is working quietly on the 5th house, dissolving old creative attachments and ancestral emotional patterns that have unconsciously shaped your choices. The next 18 months hold within them the seed of a genuine breakthrough, but only if you choose to engage consciously rather than reactively. Professional recognition is real but requires you to step outside familiar comfort zones; the 10th house activation confirms visibility is coming.

In love and relationships, Ketu in the 5th asks for release of old romantic expectations. New emotional connections carry a past-life quality — deep, immediate, and transformative rather than casual. Financial flows improve as Rahu activates your 11th; unconventional income sources, digital platforms, or networked enterprises become particularly fruitful. The practical remedy: donate black sesame seeds and mustard oil to a temple on Saturdays; this specific act harmonises the nodes with the soul's actual direction.

PREDICTION_JSON:
{"career_growth":78,"financial_gain":72,"relationship_harmony":58,"health_stability":65,"mental_clarity":70,"spiritual_progress":76,"risk_factor":42,"favorable_period_days":38,"key_focus_area":"Rahu 11th house activation — gains ahead","recommended_action":"Donate black sesame and mustard oil on Saturdays"}`,

  `The current planetary configuration places Venus as a powerful significator of your immediate future. Venus rules beauty, refinement, relationships, and the material comfort that flows from aligned values — and in your chart, it is positioned to deliver on all counts. Whether in Taurus, Libra, or Pisces (its exaltation), Venus at its best brings an era of charm, attraction, and genuine aesthetic pleasure into one's life.

Mars is simultaneously adding drive and initiative to your 1st or 3rd house matters, giving you the courage to initiate conversations, creative projects, or business proposals that have been waiting in the wings. The combination of Venus's attraction and Mars's initiative is classically the signature of successful partnerships — both romantic and professional — that begin under mutual enthusiasm and survive because both parties bring something real.

Mercury's condition in your chart governs your communication, adaptability, and commercial intelligence. A strong or well-placed Mercury in the current dasha period makes this an excellent window for contracts, negotiations, writing, speaking, or any work that requires mental agility. Financial gains are indicated through Mercury-governed domains: trade, technology, media, or advisory work. Light a ghee lamp on Wednesdays and Fridays; these are Mercury's and Venus's days respectively.

PREDICTION_JSON:
{"career_growth":68,"financial_gain":73,"relationship_harmony":82,"health_stability":71,"mental_clarity":79,"spiritual_progress":65,"risk_factor":25,"favorable_period_days":54,"key_focus_area":"Venus-Mars synergy — partnerships and creativity","recommended_action":"Light ghee lamp on Wednesdays and Fridays"}`,
];

export async function offlineOracleGenerate() {
  const r = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
  return r + "\n\n*(Oracle drawing from cosmic memory — live AI channels resting. Wisdom above is genuine Jyotish. Retry for personalised live reading.)*";
}
