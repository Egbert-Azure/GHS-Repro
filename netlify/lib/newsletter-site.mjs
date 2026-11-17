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
      `Sie erhalten diese E-Mail, weil Sie den Newsletter der GHS-Seite (${a(SITE, HOST)}) abonniert haben. ` +
      `Hier können Sie sich mit einem Klick ${a(unsubscribeUrl, "abmelden")}.`,
    subscriberFooterText: ({ unsubscribeUrl }) =>
      `Sie erhalten diese E-Mail, weil Sie den Newsletter der GHS-Seite (${HOST}) abonniert haben.\n` +
      `Abmelden mit einem Klick: ${unsubscribeUrl}`,

    confirm: {
      subject: "Bitte bestätigen Sie Ihr Abonnement des GHS-Newsletters",
      heading: "Bitte bestätigen Sie Ihr Abonnement",
      intro: "Vielen Dank für Ihr Interesse am Newsletter der GHS-Seite. Bitte bestätigen Sie Ihr Abonnement mit einem Klick auf den Button. Danach erhalten Sie eine kurze E-Mail, sobald es einen neuen Beitrag gibt.",
      button: "Abonnement bestätigen",
      ignore: "Sie haben sich nicht angemeldet? Dann ignorieren Sie diese E-Mail einfach. Sie erhalten dann keine weiteren Nachrichten.",
      footer: ({ a }) => `Diese E-Mail wurde verschickt, weil Ihre Adresse auf ${a(`${SITE}/newsletter/`, `${HOST}/newsletter/`)} eingetragen wurde.`,
    },

    moved: {
      subject: "Der GHS-Newsletter ist umgezogen",
      heading: "Der Newsletter ist umgezogen",
      paragraphs: ({ a, detailsUrl }) => [
        "Bisher haben Sie die Neuigkeiten der GHS-Seite über den Dienst follow.it erhalten. Ab sofort verschickt die Seite den Newsletter selbst – ohne Werbung und nur dann, wenn es einen neuen Beitrag gibt.",
        `Ihre E-Mail-Adresse liegt damit nicht mehr bei einem Newsletter-Dienst, der sich über Werbung finanziert. Sie wird ausschließlich für diesen Newsletter verwendet und weder weitergegeben noch verkauft. ${a(detailsUrl, "Mehr zum Datenschutz")}`,
        "Sie müssen nichts weiter tun. Wenn Sie den Newsletter nicht mehr erhalten möchten, können Sie sich unten mit einem Klick abmelden.",
        "Viele Grüße<br>Egbert",
      ],
      detailsUrl: `${SITE}/newsletter/#datenschutz`,
      latestLabel: "Der neueste Beitrag",
      visitButton: "Zur GHS-Seite",
    },
  },
};
