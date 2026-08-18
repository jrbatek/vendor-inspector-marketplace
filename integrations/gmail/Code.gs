const PROCESSED_LABEL = "inspectsource-processed";
const ERROR_LABEL = "inspectsource-error";

function processInspectSourceInbox() {
  const props = PropertiesService.getScriptProperties();
  const endpoint = props.getProperty("INSPECTSOURCE_EMAIL_ENDPOINT");
  const secret = props.getProperty("INSPECTSOURCE_EMAIL_SECRET");
  if (!endpoint || !secret) throw new Error("Set INSPECTSOURCE_EMAIL_ENDPOINT and INSPECTSOURCE_EMAIL_SECRET in Apps Script properties.");

  const processed = getOrCreateLabel_(PROCESSED_LABEL);
  const errorLabel = getOrCreateLabel_(ERROR_LABEL);
  const threads = GmailApp.search(`is:unread in:inbox -label:${PROCESSED_LABEL}`, 0, 10);

  threads.forEach((thread) => {
    const messages = thread.getMessages();
    const message = messages[messages.length - 1];
    try {
      const response = UrlFetchApp.fetch(endpoint, {
        method: "post", contentType: "application/json",
        headers: { "x-inspectsource-secret": secret },
        payload: JSON.stringify({ from: message.getFrom(), subject: message.getSubject(), body: message.getPlainBody(), messageId: message.getId() }),
        muteHttpExceptions: true,
      });
      if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) throw new Error(`InspectSource API returned ${response.getResponseCode()}: ${response.getContentText()}`);

      const result = JSON.parse(response.getContentText());
      const candidates = result.candidates || [];
      const attachments = candidates.slice(0, 5).map((candidate) => createAnonymousCvPdf_(candidate, result.brief));
      message.reply(buildReply_(result), { attachments, name: "InspectSource AI Project Coordinator" });
      thread.addLabel(processed); thread.removeLabel(errorLabel); thread.markRead();
    } catch (error) { console.error(error); thread.addLabel(errorLabel); }
  });
}

function buildReply_(result) {
  const lines = ["Thank you for your inspection staffing request.", "", result.summary || "InspectSource has reviewed the request.", ""];
  if (result.brief && result.brief.coordinatorQuestions && result.brief.coordinatorQuestions.length) {
    lines.push("Items we would like to confirm:"); result.brief.coordinatorQuestions.forEach((q) => lines.push(`- ${q}`)); lines.push("");
  }
  if (result.candidates && result.candidates.length) {
    lines.push("Recommended candidates:");
    result.candidates.slice(0, 5).forEach((c, i) => {
      lines.push(`${i + 1}. Inspector #${c.anonymousId} — ${c.score}% match`);
      if (c.discipline) lines.push(`   Discipline: ${c.discipline}`);
      if (c.location) lines.push(`   Location: ${c.location}`);
      if (c.availability) lines.push(`   Availability: ${c.availability}`);
      if (c.qualificationUrl) lines.push(`   Review Qualifications: ${c.qualificationUrl}`);
    });
    lines.push("", "The attached CVs contain the same qualification categories shown in Review Qualifications.");
  } else lines.push("We did not identify a strong enough match yet. We will need clarification or a broader search before recommending candidates.");
  lines.push("", "Inspector identities and direct contact details remain protected until an engagement is accepted through InspectSource.", "", "InspectSource AI Project Coordinator");
  return lines.join("\n");
}

function createAnonymousCvPdf_(candidate, brief) {
  const document = DocumentApp.create(`InspectSource Anonymous CV - ${candidate.anonymousId}`);
  const body = document.getBody();
  body.appendParagraph("InspectSource").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph("Anonymous Inspector Qualification CV").setHeading(DocumentApp.ParagraphHeading.TITLE);
  body.appendParagraph(`Inspector #${candidate.anonymousId}`);
  body.appendParagraph(candidate.verified ? "Verified by InspectSource" : "Pre-Qualified Inspector");
  body.appendParagraph("");
  body.appendParagraph(candidate.discipline ? `${candidate.discipline} Inspection Professional` : "Vendor Inspection Professional").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  if (candidate.location) body.appendParagraph(`Location: ${candidate.location}`);
  if (candidate.yearsExperience) body.appendParagraph(`Experience: ${candidate.yearsExperience}+ years`);
  if (candidate.inspectorType) body.appendParagraph(`Inspector Type: ${candidate.inspectorType}`);
  if (candidate.biography) body.appendParagraph(candidate.biography);

  body.appendParagraph("Assignment Fit").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  if (candidate.availability) body.appendParagraph(`Availability: ${candidate.availability}`);
  if (candidate.dayRate != null) body.appendParagraph(`Day Rate: ${candidate.currency || ""} ${candidate.dayRate}`.trim());
  if (candidate.drivingRadius != null) body.appendParagraph(`Travel Coverage: ${candidate.drivingRadius} ${candidate.distanceUnit || ""}`.trim());
  body.appendParagraph(`Domestic Travel: ${candidate.domesticTravel ? "Available" : "Not listed"}`);
  body.appendParagraph(`International Travel: ${candidate.internationalTravel ? "Available" : "Not listed"}`);
  body.appendParagraph(`Remote Review: ${candidate.remoteReview ? "Available" : "Not listed"}`);
  if (candidate.maximumFlightHours != null) body.appendParagraph(`Maximum Flight Time: ${candidate.maximumFlightHours} hours`);

  body.appendParagraph("Why this inspector matched").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  (candidate.reasons || []).forEach((reason) => body.appendListItem(reason));
  if (candidate.questions && candidate.questions.length) {
    body.appendParagraph("Items to confirm").setHeading(DocumentApp.ParagraphHeading.HEADING2);
    candidate.questions.forEach((question) => body.appendListItem(question));
  }

  const q = candidate.qualifications || {};
  appendQualificationSection_(body, "Equipment Experience", q.equipment);
  appendQualificationSection_(body, "Inspection Activities", q.activities);
  appendQualificationSection_(body, "NDT Methods", q.ndtMethods);
  appendQualificationSection_(body, "Certifications", q.certifications);
  appendQualificationSection_(body, "Codes & Standards", q.codes);
  appendQualificationSection_(body, "Industry Experience", q.industries);
  appendQualificationSection_(body, "Languages", q.languages);
  appendQualificationSection_(body, "Work Countries", q.workCountries);
  appendQualificationSection_(body, "Travel Credentials", q.travelCredentials);
  appendQualificationSection_(body, "Software", q.software);
  appendQualificationSection_(body, "Training", q.training);

  if (brief) {
    body.appendParagraph("Assignment Reference").setHeading(DocumentApp.ParagraphHeading.HEADING2);
    if (brief.location) body.appendParagraph(`Requested location: ${brief.location}`);
    if (brief.startDate) body.appendParagraph(`Requested start: ${brief.startDate}`);
    if (brief.durationDays) body.appendParagraph(`Expected duration: ${brief.durationDays} days`);
  }

  body.appendParagraph("");
  body.appendParagraph("This CV intentionally excludes the inspector's name, personal email, phone number, employer, and exact address. Identity release is coordinated through InspectSource.");
  body.appendParagraph(`Review Qualifications online: ${candidate.qualificationUrl}`);
  document.saveAndClose();
  const file = DriveApp.getFileById(document.getId());
  const pdf = file.getAs(MimeType.PDF).setName(`InspectSource_CV_${candidate.anonymousId}.pdf`);
  file.setTrashed(true);
  return pdf;
}

function appendQualificationSection_(body, title, items) {
  if (!items || !items.length) return;
  body.appendParagraph(title).setHeading(DocumentApp.ParagraphHeading.HEADING2);
  items.forEach((item) => {
    const details = [];
    if (item.level) details.push(item.level);
    if (item.proficiency) details.push(item.proficiency);
    if (item.years_experience) details.push(`${item.years_experience} years`);
    if (item.provider) details.push(item.provider);
    if (item.certificate_number) details.push(`Credential ${item.certificate_number}`);
    if (item.credential_number) details.push(`Credential ${item.credential_number}`);
    if (item.expires_on) details.push(`Expires ${item.expires_on}`);
    body.appendListItem(`${item.name}${details.length ? ` — ${details.join(" · ")}` : ""}`);
  });
}

function getOrCreateLabel_(name) { return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name); }
function installInspectSourceTrigger() {
  ScriptApp.getProjectTriggers().filter((trigger) => trigger.getHandlerFunction() === "processInspectSourceInbox").forEach((trigger) => ScriptApp.deleteTrigger(trigger));
  ScriptApp.newTrigger("processInspectSourceInbox").timeBased().everyMinutes(5).create();
}
