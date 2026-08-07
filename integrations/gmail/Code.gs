const PROCESSED_LABEL = "inspectsource-processed";
const ERROR_LABEL = "inspectsource-error";

function processInspectSourceInbox() {
  const props = PropertiesService.getScriptProperties();
  const endpoint = props.getProperty("INSPECTSOURCE_EMAIL_ENDPOINT");
  const secret = props.getProperty("INSPECTSOURCE_EMAIL_SECRET");

  if (!endpoint || !secret) {
    throw new Error("Set INSPECTSOURCE_EMAIL_ENDPOINT and INSPECTSOURCE_EMAIL_SECRET in Apps Script properties.");
  }

  const processed = getOrCreateLabel_(PROCESSED_LABEL);
  const errorLabel = getOrCreateLabel_(ERROR_LABEL);
  const threads = GmailApp.search(`is:unread in:inbox -label:${PROCESSED_LABEL}`, 0, 10);

  threads.forEach((thread) => {
    const messages = thread.getMessages();
    const message = messages[messages.length - 1];

    try {
      const payload = {
        from: message.getFrom(),
        subject: message.getSubject(),
        body: message.getPlainBody(),
        messageId: message.getId(),
      };

      const response = UrlFetchApp.fetch(endpoint, {
        method: "post",
        contentType: "application/json",
        headers: { "x-inspectsource-secret": secret },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
      });

      if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
        throw new Error(`InspectSource API returned ${response.getResponseCode()}: ${response.getContentText()}`);
      }

      const result = JSON.parse(response.getContentText());
      const candidates = result.candidates || [];
      const attachments = candidates.slice(0, 5).map((candidate) => createAnonymousCvPdf_(candidate, result.brief));
      const replyBody = buildReply_(result);

      message.reply(replyBody, {
        attachments,
        name: "InspectSource AI Project Coordinator",
      });

      thread.addLabel(processed);
      thread.removeLabel(errorLabel);
      thread.markRead();
    } catch (error) {
      console.error(error);
      thread.addLabel(errorLabel);
    }
  });
}

function buildReply_(result) {
  const lines = [];
  lines.push("Thank you for your inspection staffing request.");
  lines.push("");
  lines.push(result.summary || "InspectSource has reviewed the request.");
  lines.push("");

  if (result.brief && result.brief.coordinatorQuestions && result.brief.coordinatorQuestions.length) {
    lines.push("Items we would like to confirm:");
    result.brief.coordinatorQuestions.forEach((question) => lines.push(`- ${question}`));
    lines.push("");
  }

  if (result.candidates && result.candidates.length) {
    lines.push("Recommended candidates:");
    result.candidates.slice(0, 5).forEach((candidate, index) => {
      lines.push(`${index + 1}. Inspector #${candidate.anonymousId} — ${candidate.score}% match`);
      if (candidate.discipline) lines.push(`   Discipline: ${candidate.discipline}`);
      if (candidate.location) lines.push(`   Location: ${candidate.location}`);
      if (candidate.availability) lines.push(`   Availability: ${candidate.availability}`);
      if (candidate.cvUrl) lines.push(`   CV: ${candidate.cvUrl}`);
    });
    lines.push("");
    lines.push("Anonymous CVs are attached for review.");
  } else {
    lines.push("We did not identify a strong enough match yet. We will need clarification or a broader search before recommending candidates.");
  }

  lines.push("");
  lines.push("Inspector identities and direct contact details remain protected until an engagement is accepted through InspectSource.");
  lines.push("");
  lines.push("InspectSource AI Project Coordinator");
  return lines.join("\n");
}

function createAnonymousCvPdf_(candidate, brief) {
  const document = DocumentApp.create(`InspectSource Anonymous CV - ${candidate.anonymousId}`);
  const body = document.getBody();

  body.appendParagraph("InspectSource").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph("Anonymous Inspector CV").setHeading(DocumentApp.ParagraphHeading.TITLE);
  body.appendParagraph(`Inspector #${candidate.anonymousId}`);
  body.appendParagraph("");
  body.appendParagraph(candidate.discipline ? `${candidate.discipline} Professional` : "Vendor Inspection Professional").setHeading(DocumentApp.ParagraphHeading.HEADING1);

  if (candidate.location) body.appendParagraph(`Location: ${candidate.location}`);
  if (candidate.availability) body.appendParagraph(`Availability: ${candidate.availability}`);
  body.appendParagraph(`InspectSource Match: ${candidate.score}%`);

  body.appendParagraph("Why this candidate matched").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  (candidate.reasons || []).forEach((reason) => body.appendListItem(reason));

  if (candidate.questions && candidate.questions.length) {
    body.appendParagraph("Items to confirm").setHeading(DocumentApp.ParagraphHeading.HEADING2);
    candidate.questions.forEach((question) => body.appendListItem(question));
  }

  if (brief) {
    body.appendParagraph("Assignment reference").setHeading(DocumentApp.ParagraphHeading.HEADING2);
    if (brief.location) body.appendParagraph(`Requested location: ${brief.location}`);
    if (brief.startDate) body.appendParagraph(`Requested start: ${brief.startDate}`);
    if (brief.durationDays) body.appendParagraph(`Expected duration: ${brief.durationDays} days`);
  }

  body.appendParagraph("");
  body.appendParagraph("This document intentionally excludes the inspector's name, personal email, phone number, employer, and exact address. Identity release is coordinated through InspectSource.");
  body.appendParagraph(`Full anonymous qualification profile: ${candidate.qualificationUrl}`);

  document.saveAndClose();
  const file = DriveApp.getFileById(document.getId());
  const pdf = file.getAs(MimeType.PDF).setName(`InspectSource_CV_${candidate.anonymousId}.pdf`);
  file.setTrashed(true);
  return pdf;
}

function getOrCreateLabel_(name) {
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
}

function installInspectSourceTrigger() {
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === "processInspectSourceInbox")
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger("processInspectSourceInbox")
    .timeBased()
    .everyMinutes(5)
    .create();
}
