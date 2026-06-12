# Zoho CRM home page

## Purpose

The Home page is the default landing screen after login. It serves as an onboarding hub for new users and a persistent dashboard shell for returning users. It does not display CRM record data by default — instead it surfaces setup prompts, quick-access navigation, and optional widget panels.

---

## Layout regions

| Region | Description |
|---|---|
| **Left sidebar** | Persistent navigation panel. Contains the Zoho app switcher, global nav links (Home, Reports, Analytics, My Requests, Agents, Workqueue), CRM Teamspace selector, and a collapsible module tree grouped by category (Sales, Activities, Inventory, etc.). |
| **Top bar** | Global header with Search Records input, + New quick-create button, and icon shortcuts: Ask Zia, Signals, Calendar, Marketplace, Setup, Profile, and the Zoho cross-app launcher. |
| **Main content area** | Centre panel. On a fresh org this renders the onboarding welcome card, a "Watch a one-minute video" card, a "Need a Live Webinar?" card, and the "Set up your CRM" checklist. Once setup steps are dismissed or completed, this area hosts customisable dashboard widgets. |
| **Bottom utility bar** | Fixed footer with Chats, Channels, Contacts (Zoho Cliq), Smart Chat toggle, and right-side tool icons: Announcements, Mail, Motivator, Sticky Notes, Zia, Activity Reminders, Recent Items, Accessibility, Help. |

---

## Widgets / components (in order)

The following appear by default on a new/unconfigured Home page, top to bottom:

1. **Welcome card** — Personalised greeting ("Hello [username]"), tagline ("We're happy to bring you aboard the world's favourite CRM!"), and a "Let's get started!" heading. Includes a "Watch a one-minute video" link that opens an in-app video modal.
2. **"Need a Live Webinar?" card** — Displays a "Book Now" CTA linking to `zoho.com/crm/webinars`.
3. **"Set up your CRM" checklist** — Expandable step-by-step onboarding list with five items:
   - Invite your team
   - Configure your deals pipeline
   - Connect to your email account
   - Migrate your existing data
   - Integration
   Each item expands to show a description and an action button. A "Skip" button dismisses the entire checklist.
4. **File Storage migration banner (conditional)** — Appears if the org has not yet migrated Documents storage to Zoho WorkDrive. Offers "Skip for now" or "Proceed with Migration".

Once the onboarding state is dismissed, the Home page becomes a configurable dashboard. Standard widgets available include: Announcements, Mail summary, Motivator, Sticky Notes, Zia assistant, Activity Reminders, Recent Items.

---

## Default columns / data shown

The Home page does not render a record list view or data table by default. No CRM module columns are shown here.

After onboarding is complete, individual dashboard widgets surface summarised data (e.g. Activity Reminders shows due tasks; Recent Items shows recently viewed records), but these are widget-level summaries, not full columnar list views.

For module-level default columns, see the module list views:

| Module | Default columns |
|---|---|
| Leads | Lead Name, Company, Email, Phone, Lead Source, Lead Owner |
| Contacts | Contact Name, Account Name, Email, Phone, Contact Owner |
| Accounts | Account Name, Phone, Website, Account Owner |
| Deals | Deal Name, Amount, Stage, Closing Date, Account Name, Contact Name, Deal Owner |
| Tasks | Subject, Due Date, Status, Priority, Related To, Contact Name, Task Owner |
| Meetings | Title, From |
| Vendors | Vendor Name, Email |

All primary-name column headers include an **"All"** ownership-scope pill (e.g. "Lead Name — All") for quick scoping.

---

## Filter options

The Home page itself has no filter controls.

In module list views, the **Filter** button opens a left-side panel with two sections:

### System Defined Filters (checkbox toggles)
Available in most modules (subset varies):
- Activities
- Campaigns
- Latest Email Status
- Locked
- Record Action
- Related Records Action
- Touched Records
- Untouched Records
- Cadences

### Filter By Fields
An alphabetical, searchable list of every field in the module. Example field-level filters available for Leads:

Address (and sub-fields: City, Country/Region, Flat/House No., State/Province, Street Address, Zip/Postal Code), Annual Revenue, Company, Connected To, Converted Account, Converted Contact, Converted Deal, Created By, Created Time, Email, Email Opt Out, Fax, First Name, Industry, Last Activity Time, Last Name, Lead Conversion Time, Lead Name, Lead Owner, Lead Source, Lead Status, Mobile, Modified By, Modified Time, No. of Employees, Phone, Rating, Salutation, Secondary Email, Skype ID, Tag, Title, Twitter, Unsubscribed Mode, Unsubscribed Time, Website

Plus related-record filters: Accounts, Calls, Campaigns, Cases, Contacts, Deals, Emails, Invitees, and more.

---

## Bulk actions (if any)

The Home page has no bulk actions.

In module list views, selecting records via checkbox triggers:

**Inline row quick-actions (on hover):**
- Edit, Clone, Enroll to Cadence
- `...` menu → Edit, Send Email, Create Task, Add Tags, Convert (Leads only), Delete, Copy URL, More → Create Call / Create Meeting

**Top selection bar (appears on any selection):**
- Send Email
- Tags (add/remove)
- Mass Update
- `...` dropdown:
  - Run Macro
  - Create Task
  - Cadences
  - Add to Campaigns
  - Print Mailing Labels
  - Print Using Canvas ✨ (AI-assisted)
  - Mail Merge
  - Mass Convert *(Leads only)*
  - Delete
  - Export Selected

Selection bar displays count: *"N Records Selected. Clear"*

---

## Empty state

The Home page does not have a traditional empty state — a fresh org immediately renders the onboarding welcome card and setup checklist instead.

For module list views, the empty state is a plain text message rendered within the column grid:

> **"No [Module name] found."** (e.g. "No Vendors found.")

- Column headers remain visible
- Footer shows **Total Records 0**
- No illustration, no CTA button — text only

---

## RBAC notes

Zoho CRM implements RBAC via three layered components:

### Profiles
*(Setup → Security Control → Profiles)*

Two system-defined profiles:

| Profile | Notes |
|---|---|
| **Administrator** | Full access to all modules, setup, and developer tools. System-defined; most permissions cannot be modified directly — must be cloned to customise. |
| **Standard** | Standard user access; fully customisable. |

Permission categories per profile:
- **Module Permissions**: Basic (View/Create/Edit/Delete per module), Import/Export, Send Email, Tools, Others
- **Setup Permissions**: Admin Level, Email & Templates, Automation, Webform, Data Administration, Zia, CPQ
- **Extension Permissions**: Zoho, Google, Microsoft, Others, Social
- **Developer Permissions**: API Access, Manage Extensibility, Manage Zoho CRM Variables

Default Basic Permissions for Administrator profile:

| Module | Access |
|---|---|
| Leads, Contacts, Accounts, Deals, Tasks, Meetings, Calls | View, Create, Edit, Delete |
| Reports | View, Manage, Schedule, Export |
| Analytics | View, Manage, Export |
| Notes | View, Create, Edit, Delete |
| Attachments | View, Create, Delete |
| Visits | View, Delete |

> Home, Feeds, and Approval tabs are visible to all profiles based on org-level settings, not profile-level toggles.

### Roles & Hierarchy
*(Setup → Security Control → Roles and Sharing → Roles)*

Current org role tree (3 levels):
```
Ideator  (org root)
  └── CEO
        └── Manager
```

Roles define subordinate data visibility. A user in a higher role can see records owned by users in subordinate roles.

### Data Sharing Settings (Default Organisation Permissions)
*(Setup → Security Control → Roles and Sharing → Data Sharing Settings)*

| Module | Default Access |
|---|---|
| Leads | Private |
| Accounts | Private |
| Contacts | Private |
| Deals | Private |
| Campaigns | Private |
| Tasks | Private |
| Meetings | Private |
| Cases | Private |
| Solutions | Private |
| Products | Public (Read Only) |
| Vendors | Private |
| Price Books | Private |
| Quotes | Private |
| Sales Orders | Private |
| Purchase Orders | Private |
| Invoices | Private |
| Emails | Public (Read/Write/Delete) |
| Calls | Private |
| Visits | Public (Read/Write/Delete) |

**Private** = user sees only own records (plus subordinates' records if role hierarchy allows).  
Sharing Rules (second tab) allow per-role or per-group exceptions to override defaults.

### Users & Groups
*(Setup → General → Users)*

Three tabs: Users, Groups, Activate Users. Each user is assigned one Role and one Profile. The current instance has one active user (Super Admin, CEO role, Ideator org).

---

## Performance / behavior notes

- The Home page loads a Zoho Cliq chat integration in the bottom bar; if the Cliq service is unavailable, a "Couldn't connect to chat" modal appears.
- The left sidebar module tree is lazy-loaded; a brief "Loading" skeleton state is shown on first render.
- The File Storage migration banner is injected conditionally at runtime depending on org migration status — it is not part of the static page template.
- Module list views show a red loading bar across the top of the viewport during navigation transitions.
- Deals defaults to Kanban (Stage View) on first load rather than List View — unique among core modules.
- List view horizontal scroll is managed via a bottom scrollbar; columns do not wrap or reflow on narrow viewports.
- Total Records count in list view footers reflects the current filtered set, not the global module total.
- The "Ask Zia" panel and the Zia Search overlay are separate surfaces (top-bar icon vs. a Chrome-extension-style search bar) and serve different interaction patterns.

---

## Open questions

- [ ] What widgets appear on the Home dashboard after onboarding is completed / skipped? Are there default widgets or is it blank?
- [ ] Can the Home dashboard layout be customised per user, per role, or only org-wide?
- [ ] Does the "All Leads / All Contacts / etc." ownership-scope pill in column headers respect the user's role hierarchy automatically, or does it require manual filter selection?
- [ ] Are there additional system-defined views beyond "All [Module]" created by default (e.g. "My Leads", "Today's Leads")?
- [ ] What is the behaviour of the Home page for a Standard profile user vs. an Administrator — are any widgets or setup cards hidden?
- [ ] Does the empty-state message change when a filter is active (e.g. "No results match your filter") vs. the module genuinely having no records?
- [ ] What is the maximum number of columns that can be added to a list view, and is there a per-profile or per-role restriction on column customisation?
- [ ] Are Sharing Rules (the second tab under Data Sharing Settings) configured for any modules in this org?
- [ ] How does Territory Management interact with the role hierarchy for record visibility — is it additive or does it override role-based sharing?
- [ ] What triggers the WorkDrive file storage migration banner — is it org-age, plan tier, or an explicit admin action?
