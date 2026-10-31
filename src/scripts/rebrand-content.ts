import { runImport } from "./_shared/seed-template";
import { TemplateModel } from "../models/template.model";
import { WorkModel } from "../models/work.model";

const OLD_NAME = /Inviteo/g;
const NEW_NAME = "Save the Kath";

/** Replaces the old brand name inside every string of a content object. */
function rebrand(value: unknown): { value: unknown; changed: boolean } {
  if (typeof value === "string") {
    const next = value.replace(OLD_NAME, NEW_NAME);
    return { value: next, changed: next !== value };
  }
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const result = rebrand(item);
      changed ||= result.changed;
      return result.value;
    });
    return { value: next, changed };
  }
  if (value && typeof value === "object") {
    let changed = false;
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const result = rebrand(item);
      changed ||= result.changed;
      next[key] = result.value;
    }
    return { value: next, changed };
  }
  return { value, changed: false };
}

runImport("Rebrand content", async () => {
  let templates = 0;
  for (const doc of await TemplateModel.find({}, { content: 1, name: 1, description: 1 }).lean()) {
    const content = rebrand(doc.content);
    const description = rebrand(doc.description);
    if (!content.changed && !description.changed) continue;
    await TemplateModel.updateOne(
      { _id: doc._id },
      { $set: { content: content.value, description: description.value } }
    );
    templates += 1;
  }

  let works = 0;
  for (const doc of await WorkModel.find({}, { content: 1, description: 1 }).lean()) {
    const content = rebrand(doc.content);
    const description = rebrand(doc.description);
    if (!content.changed && !description.changed) continue;
    await WorkModel.updateOne(
      { _id: doc._id },
      { $set: { content: content.value, description: description.value } }
    );
    works += 1;
  }

  console.log(`Rebranded ${templates} templates and ${works} works`);
});
