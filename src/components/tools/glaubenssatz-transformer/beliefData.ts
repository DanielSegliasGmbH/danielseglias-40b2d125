export interface Belief {
  id: string;
  title: string;
  emoji: string;
  whyPeopleBelieve: string;
  reality: string;
  newPerspective: string;
  impulse: string;
}

export const BELIEFS: Belief[] = [
  {
    id: 'need-money',
    title: '«Ich brauche viel Geld, um zu investieren»',
    emoji: '💰',
    whyPeopleBelieve: 'Früher war das tatsächlich so. Man brauchte Tausende Franken, um an der Börse zu investieren. Dieses Bild hat sich in den Köpfen festgesetzt.',
    reality: 'Heute kannst du bereits ab 1 Franken investieren. Viele 3a-Lösungen starten ab 100 CHF pro Monat. Die Einstiegshürde ist praktisch verschwunden.',
    newPerspective: 'Es geht nicht darum, wie viel du hast – sondern darum, dass du anfängst. Selbst kleine Beträge wachsen über die Zeit erheblich.',
    impulse: 'Was wäre, wenn du mit dem startest, was du heute hast – statt auf den perfekten Moment zu warten?',
  },
  {
    id: 'too-risky',
    title: '«Investieren ist zu riskant»',
    emoji: '⚠️',
    whyPeopleBelieve: 'Medien berichten vor allem über Crashs und Verluste. Einzelne Geschichten von Menschen, die viel verloren haben, bleiben im Gedächtnis.',
    reality: 'Historisch hat der globale Aktienmarkt über jeden 15-Jahres-Zeitraum positiv abgeschnitten. Breit gestreut und langfristig ist das Risiko kalkulierbar.',
    newPerspective: 'Das grösste Risiko ist nicht das Investieren – sondern das Nicht-Investieren. Dein Geld auf dem Sparkonto verliert jedes Jahr an Kaufkraft.',
    impulse: 'Was ist riskanter: Einen Plan zu haben – oder darauf zu hoffen, dass schon alles gut kommt?',
  },
  {
    id: 'not-enough-knowledge',
    title: '«Ich kenne mich zu wenig aus»',
    emoji: '🤷',
    whyPeopleBelieve: 'Finanzen wirken komplex. Fachbegriffe, Charts und Zahlen schrecken ab. Viele denken, man müsse Experte sein, um gute Entscheidungen zu treffen.',
    reality: 'Du musst kein Experte sein. Die wichtigsten Prinzipien passen auf eine Postkarte: Breit streuen, langfristig denken, Kosten tief halten.',
    newPerspective: 'Wissen hilft – aber Perfektion ist keine Voraussetzung. Ein einfacher, solider Plan schlägt jedes Jahr Nichtstun.',
    impulse: 'Würdest du auch beim Autofahren warten, bis du jedes Bauteil des Motors verstehst – oder einfach den Kurs machen?',
  },
  {
    id: 'do-it-later',
    title: '«Ich mache das später»',
    emoji: '⏳',
    whyPeopleBelieve: 'Es gibt immer etwas Dringenderes. Finanzplanung fühlt sich nicht akut an. Man denkt, man hat noch Zeit.',
    reality: 'Jedes Jahr, das du wartest, kostet dich Geld – nicht wenig, sondern richtig viel. Der Zinseszins arbeitet nur, wenn du ihn lässt.',
    newPerspective: '«Später» ist der teuerste Finanzplan der Welt. Der beste Zeitpunkt war vor 10 Jahren. Der zweitbeste ist jetzt.',
    impulse: 'Wie viel hat dich das Warten bis heute schon gekostet?',
  },
  {
    id: 'bank-knows-best',
    title: '«Meine Bank wird das schon richtig machen»',
    emoji: '🏦',
    whyPeopleBelieve: 'Vertrauen in Institutionen ist tief verankert. Banken wirken kompetent und professionell. Man geht davon aus, dass sie im Kundeninteresse handeln.',
    reality: 'Banken sind Unternehmen mit eigenen Gewinnzielen. Sie empfehlen oft Produkte, an denen sie selbst am meisten verdienen – nicht die, die für dich am besten sind.',
    newPerspective: 'Vertrauen ist gut. Aber zu verstehen, was mit deinem Geld passiert, ist besser. Du verdienst Transparenz.',
    impulse: 'Weisst du, wie viel deine Bank an dir verdient?',
  },
  {
    id: 'no-risk',
    title: '«Ich will kein Risiko eingehen»',
    emoji: '🛡️',
    whyPeopleBelieve: 'Sicherheit fühlt sich gut an. Das Sparkonto scheint sicher, weil der Betrag nie sinkt. Verluste vermeiden ist ein starker psychologischer Antrieb.',
    reality: 'Dein Sparkonto verliert durch die Inflation jedes Jahr 2-3% an Kaufkraft. Das fühlt sich nicht wie ein Verlust an – ist aber einer.',
    newPerspective: '«Kein Risiko» gibt es nicht. Es gibt nur sichtbare und unsichtbare Risiken. Die Inflation ist das unsichtbare Risiko, das die meisten übersehen.',
    impulse: 'Wenn dein Geld jedes Jahr weniger wert wird – ist das wirklich «sicher»?',
  },
  {
    id: 'too-late',
    title: '«Mit 40+ ist es zu spät»',
    emoji: '🕐',
    whyPeopleBelieve: 'Man hört oft, dass man jung anfangen muss. Wer spät dran ist, denkt, es lohnt sich nicht mehr.',
    reality: 'Selbst mit 45 hast du noch 20+ Jahre bis zur Pensionierung. In dieser Zeit kann dein Vermögen sich verdoppeln oder verdreifachen – wenn du heute startest.',
    newPerspective: 'Es ist nie zu spät, aber es wird mit jedem Jahr teurer, nichts zu tun. Die Frage ist nicht «ob», sondern «wie».',
    impulse: 'Was wäre in 10 Jahren anders, wenn du heute anfängst?',
  },
  {
    id: 'complex',
    title: '«Finanzen sind zu kompliziert»',
    emoji: '🧩',
    whyPeopleBelieve: 'Die Finanzbranche macht es absichtlich komplex. Fachsprache, Kleingedrucktes und endlose Produktvergleiche schrecken ab.',
    reality: 'Gute Finanzplanung ist einfach. Kompliziert wird es nur, wenn jemand dir etwas verkaufen will, das du nicht brauchst.',
    newPerspective: 'Wenn du etwas nicht verstehst, liegt das selten an dir – sondern an der Erklärung. Fordere Klarheit ein.',
    impulse: 'Was wäre, wenn Finanzen einfacher sind, als du denkst?',
  },
  {
    id: 'small-amounts',
    title: '«Bei kleinen Beträgen lohnt sich das nicht»',
    emoji: '🪙',
    whyPeopleBelieve: 'Man denkt, 200 CHF pro Monat machen keinen Unterschied. Im Vergleich zu grossen Summen wirkt es unbedeutend.',
    reality: '200 CHF pro Monat über 30 Jahre bei 5% Rendite ergibt über 160\'000 CHF. Davon sind mehr als 88\'000 CHF reiner Zinseszins.',
    newPerspective: 'Kleine Beträge, konsequent investiert, ergeben grosse Summen. Der Zinseszins ist die stärkste Kraft der Finanzwelt.',
    impulse: 'Was könntest du mit 160\'000 CHF anfangen, die du «nebenbei» aufgebaut hast?',
  },
  {
    id: 'market-timing',
    title: '«Ich warte auf den richtigen Zeitpunkt»',
    emoji: '📊',
    whyPeopleBelieve: 'Es klingt logisch: Kaufen wenn es günstig ist, verkaufen wenn es teuer ist. Medien verstärken das Gefühl, es gäbe den «perfekten» Einstieg.',
    reality: 'Selbst Profis schaffen es nicht zuverlässig, den Markt zu timen. Studien zeigen: Wer regelmässig investiert, schneidet besser ab als die meisten «Timer».',
    newPerspective: 'Time in the market schlägt timing the market. Nicht der Einstiegspunkt entscheidet – sondern dass du dabei bleibst.',
    impulse: 'Wie lange wartest du schon auf den «richtigen» Moment?',
  },
  {
    id: 'insurance-enough',
    title: '«Meine Versicherung reicht als Vorsorge»',
    emoji: '📋',
    whyPeopleBelieve: 'Versicherungslösungen werden oft als «Rundum-Sorglos-Paket» verkauft. Man fühlt sich abgesichert, weil man eine Police hat.',
    reality: 'Versicherungsgebundene Vorsorge hat oft hohe versteckte Kosten und wenig Flexibilität. Die Rendite liegt häufig deutlich unter freien Anlageformen.',
    newPerspective: 'Versicherung und Vorsorge sind zwei verschiedene Dinge. Mische sie nicht – es kostet dich Rendite und Freiheit.',
    impulse: 'Weisst du, wie viel Rendite dir deine Police tatsächlich bringt – nach allen Kosten?',
  },
  {
    id: 'losing-everything',
    title: '«Ich könnte alles verlieren»',
    emoji: '😰',
    whyPeopleBelieve: 'Geschichten von Totalverlusten – Einzelaktien, Krypto-Crashs – erzeugen Angst. Man überträgt Einzelfälle auf alle Anlageformen.',
    reality: 'Bei einem breit gestreuten Weltportfolio müssten tausende Unternehmen gleichzeitig bankrottgehen. Das ist in der Geschichte noch nie passiert.',
    newPerspective: 'Diversifikation ist dein Schutzschild. Wer breit streut, kann schwanken – aber nicht alles verlieren.',
    impulse: 'Ist die Angst vor dem Verlust grösser als der tatsächliche Verlust durch Nichtstun?',
  },
];
