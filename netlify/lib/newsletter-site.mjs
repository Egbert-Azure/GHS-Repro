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
    readButton: "Beitrag lesen",
    subjectMany: (n) => `${n} neue Beiträge – ${NAME}`,
    headingMany: "Neu auf der GHS-Seite",
    more: (n) => (n === 1 ? "… und ein weiterer neuer Beitrag." : `… und ${n} weitere neue Beiträge.`),
    moreButton: "Alle Beiträge im Blog",

    subscriberFooter: ({ a, unsubscribeUrl }) =>
      `Du bekommst diese E-Mail, weil Du den Newsletter von ${NAME} auf ${a(SITE, HOST)} abonniert hast. ` +
      `${a(unsubscribeUrl, "Abmelden")} mit einem Klick.`,
    subscriberFooterText: ({ unsubscribeUrl }) =>
      `Du bekommst diese E-Mail, weil Du den Newsletter von ${NAME} auf ${HOST} abonniert hast.\n` +
      `Abmelden mit einem Klick: ${unsubscribeUrl}`,

    confirm: {
      subject: `Bitte bestätigen: Newsletter ${NAME}`,
      heading: "Ein Klick zur Bestätigung",
      intro: "Danke für Deine Anmeldung. Bitte bestätige Deine Adresse, dann bekommst Du eine kurze E-Mail, sobald auf der Seite etwas Neues erscheint.",
      button: "Anmeldung bestätigen",
      ignore: "Du hast Dich nicht angemeldet? Dann ignoriere diese E-Mail einfach. Du bekommst nichts weiter.",
      footer: ({ a }) => `Verschickt, weil jemand diese Adresse auf ${a(`${SITE}/newsletter/`, `${HOST}/newsletter/`)} eingetragen hat.`,
    },

    moved: {
      subject: `${NAME}: Der Newsletter ist umgezogen`,
      heading: "Der Newsletter ist umgezogen",
      paragraphs: ({ a, detailsUrl }) => [
        "Du hast die Neuigkeiten der GHS-Seite bisher über follow.it bekommen. Ab jetzt verschickt die Seite sie selbst: ohne Werbung, nur eine kurze E-Mail, wenn ein neuer Beitrag erscheint.",
        `Es geht auch um Deine Daten. Deine Adresse liegt nicht mehr bei einer Newsletter-Firma, die von Werbung lebt, sondern bei der Seite selbst. Sie wird nur für diesen Newsletter verwendet und nie weitergegeben oder verkauft. Die E-Mails enthalten kein Tracking, und beim Abmelden wird Deine Adresse gelöscht. ${a(detailsUrl, "Wie Deine Adresse behandelt wird")}.`,
        "Du musst nichts tun. Wenn Du den Newsletter nicht mehr bekommen möchtest, meldest Du Dich unten mit einem Klick ab.",
        "Viele Grüße<br>Egbert",
      ],
      detailsUrl: `${SITE}/newsletter/#deine-adresse`,
      latestLabel: "Neuester Beitrag",
      visitButton: "Zur GHS-Seite",
    },
  },
};
