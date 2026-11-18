// What makes this site's newsletter its own: address, name, colours and the wording
// of the emails. The code in newsletter.mjs is the same on every site; to reuse the
// newsletter elsewhere, copy it and write a new version of this file.
//
// Links in the texts are built with a(href, label), so they get the right colour.

const SITE = "https://ghs.myvortexcloud.com";
const NAME = "GHS Dorsten";
const HOST = SITE.replace("https://", "");
const YEAR = 365 * 864e5;

export default {
  site: SITE,
  name: NAME,
  lang: "de",

  // The site's Mria theme: light blue page, dark buttons, its blue for labels and links.
  colors: {
    page: "#f3f7ff", text: "#040b1f", accent: "#0056fe", button: "#0c101a",
    rule: "#d6dff0", muted: "#677387",
  },

  // Posts restored from the web archive keep their old date (2001 to 2016), so every
  // post that is new on the site is mailed, whatever its date. A number here (days)
  // would skip posts dated further back than that.
  announceWithinDays: null,

  // At most this many posts in full per email; any more get one line and a link.
  maxItemsPerMail: 5,
  moreUrl: `${SITE}/blog/`,

  text: {
    // Over a year old when mailed: a post brought back from the old school website.
    label: (item, now) => (now - Date.parse(item.date) > YEAR ? "Aus dem Archiv" : "Neuer Beitrag"),
    readButton: "Weiterlesen",
    subjectMany: (n) => `${n} neue Beiträge auf der GHS-Seite`,
    headingMany: "Neu auf der GHS-Seite",
    more: (n) => (n === 1 ? "Außerdem gibt es einen weiteren neuen Beitrag." : `Außerdem gibt es ${n} weitere neue Beiträge.`),
    moreButton: "Alle Beiträge ansehen",

    subscriberFooter: ({ a, unsubscribeUrl }) =>
      `Du erhältst diese E-Mail, weil Du den Newsletter der GHS-Seite (${a(SITE, HOST)}) abonniert hast. ` +
      `Hier kannst Du Dich mit einem Klick ${a(unsubscribeUrl, "abmelden")}.`,
    subscriberFooterText: ({ unsubscribeUrl }) =>
      `Du erhältst diese E-Mail, weil Du den Newsletter der GHS-Seite (${HOST}) abonniert hast.\n` +
      `Abmelden mit einem Klick: ${unsubscribeUrl}`,

    confirm: {
      subject: "Bitte bestätige Dein Abonnement des GHS-Newsletters",
      heading: "Bitte bestätige Dein Abonnement",
      intro: "Vielen Dank für Dein Interesse am Newsletter der GHS-Seite. Bitte bestätige Dein Abonnement mit einem Klick auf den Button. Danach erhältst Du eine kurze E-Mail, sobald es einen neuen Beitrag gibt.",
      button: "Abonnement bestätigen",
      ignore: "Du hast Dich nicht angemeldet? Dann ignoriere diese E-Mail einfach. Du erhältst dann keine weiteren Nachrichten.",
      footer: ({ a }) => `Diese E-Mail wurde verschickt, weil Deine Adresse auf ${a(`${SITE}/newsletter/`, `${HOST}/newsletter/`)} eingetragen wurde.`,
    },

    moved: {
      subject: "Der GHS-Newsletter ist umgezogen",
      heading: "Der Newsletter ist umgezogen",
      paragraphs: ({ a, detailsUrl }) => [
        "Bisher hast Du die Neuigkeiten der GHS-Seite über den Dienst follow.it erhalten. Ab sofort verschickt die Seite den Newsletter selbst – ohne Werbung und nur dann, wenn es einen neuen Beitrag gibt.",
        `Deine E-Mail-Adresse liegt damit nicht mehr bei einem Newsletter-Dienst, der sich über Werbung finanziert. Sie wird ausschließlich für diesen Newsletter verwendet und weder weitergegeben noch verkauft. ${a(detailsUrl, "Mehr zum Datenschutz")}`,
        "Du musst nichts weiter tun. Wenn Du den Newsletter nicht mehr erhalten möchtest, kannst Du Dich unten mit einem Klick abmelden.",
        "Viele Grüße<br>Egbert",
      ],
      detailsUrl: `${SITE}/newsletter/#datenschutz`,
      latestLabel: "Der neueste Beitrag",
      visitButton: "Zur GHS-Seite",
    },
  },
};
