# Workflow: Files

> Status: Authoritative

This workflow explains how project files are handled in the shared app.

SharePoint is authoritative for file bytes and library metadata. Dataverse stores lightweight file references and optional record attachments.

---

## Outcome

By the end of this workflow:

- the project is connected to the correct SharePoint site
- files are stored in the correct canonical project library
- the shared app can browse all project files, even if they were not uploaded through the app
- important files can be registered in Dataverse and optionally attached to project records
- the app makes project context easier to navigate without becoming the file system of record

---

## Steps

1. Connect the project to its SharePoint site.
   Use `/projects/[id]/files` to bind the project record to the correct SharePoint site URL and site ID.

2. Choose the right canonical library.
   Use the library that matches the document's role:
   `Drawing Files`, `Model Files`, `Trade Files`, `Field Files`, or `Admin Files`.

3. Upload the file to SharePoint through the files hub.
   The app uploads the file to SharePoint first, collects the library's required metadata inputs, and then creates a lightweight `rlh_files` reference row in Dataverse for app-level context.

4. Review existing SharePoint files in the same hub.
   Files that already exist in the bound SharePoint libraries should still appear in the shared app even if they do not yet have Dataverse reference rows.

5. Register an existing SharePoint file in Dataverse when app context is needed.
   Register the file if you want app notes, attachment links, or other app-managed context tied to that document.

6. Attach the file to a project record when helpful.
   Use `rlh_filelinks` to connect a registered file to a cost item, project-scope item, bid package, action item, change order, RFI, or selection.

---

## Done When

- the project files tab shows the correct SharePoint libraries
- the team can open files from the shared app without the app becoming the file system of record
- files that matter to workflow context are registered and attached where useful
- file context supports the structured project model instead of competing with it

---

## Related Workflows

- `workflows/project-setup.md`
- `workflows/scope-and-cost.md`
- `workflows/bidding.md`
- `workflows/execution.md`
